import { Router } from "express";
import { param, body } from "express-validator";
import {
  listUsers,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";
import { authenticate, requireAdmin } from "../middlewares/auth";
import { validate } from "../middlewares/validate";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/", listUsers);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid user ID")],
  validate,
  getUser,
);

router.patch(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid user ID"),
    body("name").optional().trim().notEmpty(),
    body("email").optional().isEmail(),
    body("role").optional().isIn(["admin", "member"]),
  ],
  validate,
  updateUser,
);

router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid user ID")],
  validate,
  deleteUser,
);

export default router;
