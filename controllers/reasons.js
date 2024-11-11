import { reasonsDao } from "../dao/index.js";

const getAllReasons = async (req, res) => {
  try {
    res.status(200).json(await reasonsDao.fetchAllReasons());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default { getAllReasons };
