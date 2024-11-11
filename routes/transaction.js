import express from "express";

const transactionRouter = express.Router();
import {
    getAllTransaction,
    transactionConfirm,
    transactionCreate,
    adminGetAllTransaction,
    adminConfirmTransaction
} from "../controllers/transactionController.js";

transactionRouter.post("/confirm", transactionConfirm);
transactionRouter.post("/create", transactionCreate);
transactionRouter.get("/list", getAllTransaction);
transactionRouter.get("/admin/list", adminGetAllTransaction);
transactionRouter.post("/admin/confirm", adminConfirmTransaction);

export { transactionRouter };
