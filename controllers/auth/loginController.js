import Joi from "joi";
import bcrpt from "bcrypt";
import JwtService from "../../services/JwtSertice";
import {RefreshToken, User} from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import {REFRESH_SECRET} from "../../config";
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
      const refresh_token = JwtService.sign(
        {_id: user._id, role: user.role},
        "1y",
        REFRESH_SECRET
      );

      // database whitelist
      await RefreshToken.create({token: refresh_token});
      res.json({access_token, refresh_token});
    } catch (err) {
      return next(err);
    }
  },

  async logout(req, res, next) {
    // validation
    const refreshSchema = Joi.object({
      refresh_token: Joi.string().required(),
    });
    const {error} = refreshSchema.validate(req.body);
    if (error) {
      next(error);
    }
    try {
      await RefreshToken.deleteOne({token: req.body.refresh_token});
    } catch (err) {
      return next(new Error("Something went wrong with Databse" + err.message));
    }
    res.json({sucess: true});
  },
};

export default loginController;
