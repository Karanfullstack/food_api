import Joi from "joi";
import {Product} from "../models";
import multer from "multer";
import path from "path";
import fs from "fs";
import CustomErrorHandler from "../services/CustomErrorHandler";
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

const handelMultipartData = multer({
  storage,
  limits: {fileSize: 1000000 * 5},
}).single("image");

const productController = {
  async store(req, res, next) {
    handelMultipartData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }
      console.log(req.file.path);
      const filePath = req.file.path;
      // validate request
      const productSchema = Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required(),
        size: Joi.string().required(),
      });
      const {error} = productSchema.validate(req.body);

      if (error) {
        // delete the upload file // appRoot is a global variable
        fs.unlink(`${appRoot}/${filePath}`, (err) => {
          if (err) {
            return next(CustomErrorHandler.serverError(err.message));
          }
        });
        return next(error);
      }

      const {name, price, size} = req.body;
      let document;
      try {
        document = await Product.create({
          name,
          price,
          size,
          image: filePath,
        });
      } catch (error) {}
      res.status(201).json({document});
    });
  },
};

export default productController;
