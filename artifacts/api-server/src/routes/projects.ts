import { Router } from "express";
import { body, param } from "express-validator";
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController";
import { authenticate, requireAdmin } from "../middlewares/auth";
import { validate } from "../middlewares/validate";

const router = Router();

router.use(authenticate);

router.get("/", listProjects);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid project ID")],
  validate,
  getProject,
);

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Project name is required"),
    body("description").optional().isString(),
    body("dueDate").optional().isISO8601().withMessage("Invalid date format"),
    body("memberIds").optional().isArray(),
  ],
  validate,
  createProject,
);

router.patch(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid project ID"),
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("status")
      .optional()
      .isIn(["active", "completed", "on-hold", "archived"]),
    body("dueDate").optional().isISO8601(),
    body("memberIds").optional().isArray(),
  ],
  validate,
  updateProject,
);

router.delete(
  "/:id",
  requireAdmin,
  [param("id").isMongoId().withMessage("Invalid project ID")],
  validate,
  deleteProject,
);

export default router;
