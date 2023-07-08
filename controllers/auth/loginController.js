import Joi from "joi";
import bcrpt from "bcrypt";
import JwtService from "../../services/JwtSertice";
import {User} from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
const loginController = {
  async login(req, res, next) {
    // Validation Login
    const loginSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
    });
    const {error} = loginSchema.validate(req.body);

    if (error) {
      return next(error);
    }
    const {email} = req.body;
    try {
      const user = await User.findOne({email});
      if (!user) {
        return next(CustomErrorHandler.wrongCredentials());
      }
      // compare the password
      const match = await bcrpt.compare(req.body.password, user.password);
      
      if (!match) {
        return next(wrongCredentials());
      }
      // toke generate
      const access_token = JwtService.sign({_id: user._id, role: user.role});
      res.json({access_token});
    } catch (err) {
      return next(err);
    }
  },
};

export default loginController;
