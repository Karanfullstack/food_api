import Joi from "joi";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import JwtService from "../../services/JwtSertice";
import {RefreshToken, User} from "../../models";
import {REFRESH_SECRET} from "../../config";
const refreshController = {
  async refresh(req, res, next) {
    // validation
    const refreshSchema = Joi.object({
      refresh_token: Joi.string().required(),
    });
    const {error} = refreshSchema.validate(req.body);
    if (error) {
      next(error);
    }
    // databse
    let refreshToken;
    try {
      refreshToken = await RefreshToken.findOne({
        token: req.body.refresh_token,
      });

      if (!refreshToken) {
        return next(CustomErrorHandler.unAuthorized("Invalid refresh token"));
      }

      let userId;
      try {
        const {_id} = await JwtService.verify(
          refreshToken.token,
          REFRESH_SECRET
        );
        userId = _id;
      } catch (err) {
        return next(CustomErrorHandler.unAuthorized("Invalid refresh token"));
      }

      // check if user in the databse
      const user = await User.findOne({_id: userId});

      if (!user) {
        return next(CustomErrorHandler.unAuthorized("No user found!"));
      }

      const access_token = JwtService.sign({_id: user._id, role: user.role});
      const refresh_token = JwtService.sign(
        {_id: user._id, role: user.role},
        "1y",
        REFRESH_SECRET
      );

      // databse whitelist
      await RefreshToken.create({token: refresh_token});
      res.json({access_token, refresh_token});
    } catch (err) {
      return next(new Error("Something went wrong" + err.message));
    }
  },
};

export default refreshController;
