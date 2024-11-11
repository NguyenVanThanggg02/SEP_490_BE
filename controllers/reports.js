import { reportsDao } from "../dao/index.js";

const getAllReports = async (req, res) => {
  try {
    const allReports = await reportsDao.fetchAllReports();
    res.status(200).json(allReports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createReports = async (req, res) => {
  try {
    const { reasonId, userId, spaceId } = req.body;

    // Validate input data
    if (!reasonId || !userId || !spaceId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const report = await reportsDao.createReports(reasonId, userId, spaceId);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default { createReports, getAllReports };
