import Joi from "joi";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import {RefreshToken, User} from "../../models";
import bcrypt from "bcrypt";
import JwtService from "../../services/JwtSertice";
import {REFRESH_SECRET} from "../../config";

const registerController = {
  async register(req, res, next) {
    // register controller function..
    // Validation Schema
    const registerSchema = Joi.object({
      name: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
      repeat_password: Joi.ref("password"),
    });
    // End of Validation Schema

    const {error} = registerSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    // Check if user is exists
    try {
      const exist = await User.exists({email: req.body.email});
      if (exist) {
        return next(CustomErrorHandler.alreadyExist());
      }
    } catch (err) {
      return next(err);
    }

    // Hash password...
    const {name, email, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // prepare the model..
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    // token variable
    let access_token;
    let refresh_token;
    try {
      const result = await user.save();
      // JsonToken access Token
      access_token = JwtService.sign({_id: result._id, role: result.role});
      // Refresh Token
      refresh_token = JwtService.sign(
        {_id: result._id, role: result.role},
        "1y",
        REFRESH_SECRET
      );
      
      // database whitelist
      await RefreshToken.create({token: refresh_token});
      
    } catch (error) {
      return next(error);
    }

    res.send({
      message: "Ok",
      access_token,
      refresh_token,
    });
  },
};

export default registerController;
