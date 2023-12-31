import express from "express";
const router = express.Router();
import {
  registerController,
  loginController,
  userController,
  refreshController,
  productController,
} from "../controllers";
import auth from "../middlewares/auth";
import admin from "../middlewares/admin";

router.post("/register", registerController.register);
router.post("/login", loginController.login);
router.get("/me", auth, userController.me);
router.post("/refresh", refreshController.refresh);
router.post("/logout", loginController.logout);

router.post("/products", [auth, admin], productController.store);
router.put("/products/:id", [auth, admin], productController.update);
router.delete("/products/:id", productController.delete);
router.get("/products", productController.get);
router.get("/products/:id", productController.show);

export default router;
