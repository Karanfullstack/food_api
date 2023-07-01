import Joi from "joi";

// Validation Schema
const registerController = {
  register(req, res, next) {
    const registerSchema = Joi.object({
      name: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}"))
        .required(),
      repeat_password: Joi.ref("password"),
    });
    // End of Validation Schema

    res.send({message: "Hello from Express"});
  },
};

export default registerController;
