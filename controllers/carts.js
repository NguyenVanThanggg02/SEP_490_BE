import { cartDao } from "../dao/index.js";

const getListSpacesOfUser = async (req, res) => {
  try {
    const listSpacesByUser = req.params.id;
    const listSpaces = await cartDao.fetchListSpaceOfUser(listSpacesByUser);
    if (listSpaces) {
      res.status(200).json(listSpaces);
    } else {
      res.status(404).json({ message: "Not found spaces" });
    }
  } catch (error) {
    res.status(500).json({ message: error.toString() });
  }
};
const deleteListCartOfUser = async (req, res) => {
  try {
    const cartId = req.params.id;
    const cartList = await cartDao.removeListSpaceOfUser(cartId);
    if (cartList) {
      res.status(200).json(cartList);
    } else {
      res.status(404).json("Not Found");
    }
  } catch (error) {
    res.status(500).json({ message: error.toString() });
  }
};
const addSpacesToCart = async (req, res) => {
  try {
    const { userId, spaceId, categoriesId, quantity } = req.body;
    const newSpaceItem = await cartDao.addSpacesToCart(
      userId,
      spaceId,
      categoriesId,
      quantity
    );
    res
      .status(200)
      .json({ message: "Space added to cart successfully", newSpaceItem });
  } catch (error) {
    res.status(500).json({ message: error.toString() });
  }
};
const updateCart = async (req, res) => {
  try {
    const updateCart = await cartDao.updateCart(req.params.id, req.body);
    res.status(200).json({ message: "success", updateCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export default {
  getListSpacesOfUser,
  deleteListCartOfUser,
  addSpacesToCart,
  updateCart,
};
