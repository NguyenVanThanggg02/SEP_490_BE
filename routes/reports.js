import express from "express";
import { reportsController } from "../controllers/index.js";
import Reports from "../models/reports.js";
import { notificationDao } from "../dao/index.js";

const reportRouter = express.Router();
reportRouter.post("/", reportsController.createReports);
reportRouter.get("/", reportsController.getAllReports);

reportRouter.get('/getreport/:id', async (req, res) => {
    const { id } = req.params;  // Lấy id từ URL params
  
    try {
      const report = await Reports.findById(id)
        .populate('reasonId') // Populate trường reasonId nếu cần
        .populate('userId') // Populate userId nếu cần
        .populate({
          path: 'spaceId', // Populate không gian
          populate: [
            {
              path: 'userId', // Populate userId của không gian
              select: 'fullname', // Lấy chỉ trường fullname của người dùng
            },
            {
              path: 'appliancesId', // Populate appliancesId của không gian
              select: 'name', // Lấy chỉ tên của tiện ích
              populate: {
                path: 'appliances', // Populate các tiện ích của không gian
                select: 'name', // Lấy tên của tiện ích
              },
            },
          ],
        })
        .exec();
  
      // Nếu không tìm thấy báo cáo, trả về 404
      if (!report) {
        return res.status(404).json({ message: 'Báo cáo không tìm thấy' });
      }
  
      // Trả về báo cáo tìm thấy
      res.status(200).json(report);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy báo cáo' });
    }
  });
  

//Chấp nhận report
reportRouter.put("/reportstatus/:postId", async (req, res, next) => {
    const { postId } = req.params;
    const { statusReport } = req.body;

    try {
        const postSpace = await Reports.findOneAndUpdate(
            { _id: postId },
            { statusReport: statusReport },
            { new: true }
        ).populate("reasonId")
            .populate("userId")
            .populate({
                path: "spaceId", // Populate không gian
                populate: [
                    {
                        path: "userId", // Populate userId của không gian
                        select: "fullname", // Chỉ lấy trường fullname từ bảng users
                    },
                    {
                        path: "appliancesId", // Populate appliancesId của không gian
                        select: "appliances", // Chỉ lấy trường appliances từ bảng appliances
                        populate: {
                            path: "appliances", // Populate các đối tượng trong mảng appliances
                            select: "name", // Chỉ lấy các trường name và iconName từ mảng appliances
                        },
                    },
                ],
            })
            .exec();

        if (!postSpace) {
            return res.status(404).json({ message: "Report not found" });
        }

        // if (statusReport === "Chấp nhận" || statusReport === "Từ chối") {
        //     await notificationDao.saveAndSendNotification(
        //         postSpace.userId._id.toString(),
        //         `${postSpace.userId.fullname} đã gửi báo cáo về không gian ${postSpace.spaceId.name}`,
        //         postSpace.spaceId.images && postSpace.spaceId.images.length > 0 ? postSpace.spaceId.images[0].url : null,
        //         `/spaces/${postSpace.spaceId._id.toString()}`
        //     );
        // }

        res.status(200).json(postSpace);
    } catch (error) {
        console.error("Error:", error); // Thêm log lỗi ra console
        res.status(500).json({ message: "Đã xảy ra lỗi khi chấp nhận post" });
    }
});


export default reportRouter;
