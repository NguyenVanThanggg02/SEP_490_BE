import { reportsDao, notificationDao } from "../dao/index.js";
import Spaces from "../models/spaces.js";
import Users from "../models/users.js";

const getAllReports = async(req, res) =>{
  try {
    const allReports = await reportsDao.fetchAllReports()
    res.status(200).json(allReports)
  } catch (error) {
    throw new Error(error.message)
  }
}

const createReports = async (req, res) => {
  try {
    const { reasonId, userId, spaceId } = req.body;
    const report = await reportsDao.createReports(reasonId, userId, spaceId);

    const space = await Spaces.findById(spaceId);
    const user = await Users.findById(userId);
    const userAvatar = user?.avatar || "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg";

    await notificationDao.saveAndSendNotification(
      space.userId.toString(),
      `${user?.fullname} đã tố cáo space ${space?.name}`,
      userAvatar
    );
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

export default { createReports,getAllReports };
