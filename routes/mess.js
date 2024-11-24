import express from "express";
import { addMessage, getMessages } from "../controllers/MessageController.js";
import { MessageController } from "../controllers/index.js";
const messRouter = express.Router();

messRouter.post("/", MessageController.addMessage);

messRouter.get("/:chatId", MessageController.getMessages);

export default messRouter;
