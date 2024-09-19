import express from "express";
import { cartController } from "../controllers/index.js";

const cartRouter = express.Router()
cartRouter.get('/:id', cartController.getListSpacesOfUser)
cartRouter.delete('/:id',cartController.deleteListCartOfUser)
cartRouter.post('/', cartController.addSpacesToCart);

export default cartRouter