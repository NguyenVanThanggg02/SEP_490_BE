import express from "express";
import Bank from "../models/bank.js";
import createError from "http-errors";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} from "../helpers/jwt_helper.js";
const bankRouter = express.Router();
bankRouter.get("/", async (req, res, next) => {
  try {

    const bank = await Bank.find();
    if (bank.length === 0) {
      res.status(404).send({ message: "Bank not found" });
      return
    }
    res.status(200).json(bank);
  } catch (error) {
    next(error);
  }
});
export default bankRouter;
