import express from "express";

const dashboardRouter = express.Router();
import {
    getAllData,
} from "../controllers/dashboardController.js";

dashboardRouter.get("/", getAllData);

export { dashboardRouter };
