import Joi from "joi";
import {Product} from "../models";
import multer from "multer";
import path from "path";
import fs from "fs";
import CustomErrorHandler from "../services/CustomErrorHandler";
import productSchema from "../validators/productValidation";

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

      const filePath = req.file.path;
      // validate request
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
      } catch (err) {
        return next(err);
      }
      res.status(201).json({sucess:true,document});
    });
  },

  // update controller...

  async update(req, res, next) {
    handelMultipartData(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError(err.message));
      }
      let filePath; // block scope
      if (req.file) {
        filePath = req.file.path;
      }
      // validate request
      const {error} = productSchema.validate(req.body);

      if (error) {
        // delete the upload file // appRoot is a global variable

        if (req.file) {
          fs.unlink(`${appRoot}/${filePath}`, (err) => {
            if (err) {
              return next(CustomErrorHandler.serverError(err.message));
            }
          });
        }
        return next(error);
      }

      const {name, price, size} = req.body;
      let document;
      try {
        document = await Product.findOneAndUpdate(
          {_id: req.params.id},
          {
            name,
            price,
            size,
            ...(req.file && {image: filePath}), // spread the values
          },
          {new: true}
        );
        console.log(document);
      } catch (error) {
        return next(err);
      }
      res.status(201).json({sucess:true,document});
    });
  },

// @Delete Route

 async delete(req, res, next){
  
 }

};

export default productController;
