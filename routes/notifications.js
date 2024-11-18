import express from "express";

const notificationsRouter = express.Router();
import {
  getAllNotifications,
  markAllNotificationsAsRead,
} from "../controllers/notificationController.js";

notificationsRouter.post("/mark-read", markAllNotificationsAsRead);
notificationsRouter.get("/", getAllNotifications);

export { notificationsRouter };
