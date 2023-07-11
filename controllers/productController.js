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
      res.status(201).json({sucess: true, document});
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
      } catch (error) {
        return next(err);
      }
      res.status(201).json({sucess: true, document});
    });
  },

  // @Delete Route
  async delete(req, res, next) {
    const document = await Product.findOneAndDelete({
      _id: req.params.id,
    }).select("-updatedAt -__v");
    if (!document) {
      return next(new Error("Nothing to delete"));
    }
    // image delete
    const imagePath = document._doc.image;
    fs.unlink(`${appRoot}/${imagePath}`, (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError());
      }
    });
    res.json({sucess: true, document});
  },

  // @Get all products
  async get(req, res, next) {
    let documents;
    try {
      documents = await Product.find()
        .select("-updatedAt -__v")
        .sort({_id: -1});
    } catch (err) {
      return next(CustomErrorHandler.serverError(err.message));
    }
    return res.json({sucess: true, length: documents.length, documents});
  },

  // @Get a single product
  async show(req, res, next) {
    let document;
    try {
      document = await Product.findOne({_id: req.params.id}).select(
        "-updatedAt -__v"
      );
    } catch (error) {
      return next(CustomErrorHandler.serverError());
    }
    return res.json(document);
  },
};

export default productController;
