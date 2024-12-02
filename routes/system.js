import express from "express";
import systemController from "../controllers/systemControllers.js";

const systemRouter = express.Router();

systemRouter.get("/", systemController.getSystemProperties);

export default systemRouter;
