import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats,
} from "../controllers/taskController";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";

const router = Router();

router.use(authenticate);

router.get("/stats", getDashboardStats);

router.get(
  "/",
  [
    query("projectId").optional().isMongoId(),
    query("status")
      .optional()
      .isIn(["todo", "in-progress", "review", "done"]),
    query("assigneeId").optional().isMongoId(),
  ],
  validate,
  listTasks,
);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid task ID")],
  validate,
  getTask,
);

router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Task title is required"),
    body("projectId").isMongoId().withMessage("Valid project ID is required"),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high", "critical"]),
    body("assigneeId").optional().isMongoId(),
    body("dueDate").optional().isISO8601(),
    body("tags").optional().isArray(),
  ],
  validate,
  createTask,
);

router.patch(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid task ID"),
    body("status")
      .optional()
      .isIn(["todo", "in-progress", "review", "done"]),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high", "critical"]),
    body("assigneeId").optional().isMongoId(),
    body("dueDate").optional().isISO8601(),
    body("tags").optional().isArray(),
  ],
  validate,
  updateTask,
);

router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid task ID")],
  validate,
  deleteTask,
);

export default router;
