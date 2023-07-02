import Joi from "joi";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import {User} from "../../models";
import bcrypt from "bcrypt";
const registerController = {
  async register(req, res, next) {
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
        return next(
          CustomErrorHandler.alreadyExist("This email is already taken.")
        );
      }
    } catch (err) {
      return next(err);
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // prepare the model

    res.send({
      message: "OK",
      data: req.body,
    });
  },
};

export default registerController;
