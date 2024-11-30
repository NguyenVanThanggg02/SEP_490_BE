import express from "express";
import createError from "http-errors";
import SystemProrperties from "../models/systemPropertiesModel.js";

const systemRouter = express.Router();
systemRouter.get("/", async (req, res, next) => {
  try {
    const system = await SystemProrperties.find();
    if (system.length === 0) {
      res.status(404).send({ message: "System not found" });
      return;
    }
    res.status(200).json(system);
  } catch (error) {
    next(error);
  }
});
export default systemRouter;
