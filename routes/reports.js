import express from "express";
import { reportsController } from "../controllers/index.js";
import Reports from "../models/reports.js";
import { notificationDao } from "../dao/index.js";
import Spaces from "../models/spaces.js";

const reportRouter = express.Router();
reportRouter.post("/", reportsController.createReports);
reportRouter.get("/", reportsController.getAllReports);

reportRouter.get("/:userId", async (req, res, next) => {
    try {
        const { userId } = req.params;
        const reports = await Reports.find({})
            .populate("reasonId")
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
        const filteredReports = reports.filter(
            (report) => report?.spaceId?.userId?._id.toString() === userId
        );
        if (filteredReports.length === 0) {
            return res
                .status(404)
                .json({ message: "Không tìm thấy report" });
        }
        res.json(filteredReports);
    } catch (error) {
        next(error);
    }
});
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

reportRouter.put("/complaint/:id", async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID từ params
        const { complaint } = req.body; // Lấy complaint từ body

        // Kiểm tra nếu complaint rỗng
        if (!complaint || complaint.trim() === "") {
            return res.status(400).json({ message: "Complaint không được để trống." });
        }

        // Tìm và cập nhật trường complaint của report theo ID
        const updatedReport = await Reports.findByIdAndUpdate(
            id,
            { complaint: complaint.trim() }, // Cập nhật giá trị mới
            { new: true } // Trả về document đã cập nhật
        );

        // Nếu không tìm thấy report
        if (!updatedReport) {
            return res.status(404).json({ message: "Không tìm thấy report." });
        }

        // Trả về kết quả thành công
        res.status(200).json({
            message: "Cập nhật complaint thành công.",
            data: updatedReport,
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật complaint:", error.message);
        res.status(500).json({
            message: "Lỗi server khi cập nhật complaint.",
            error: error.message,
        });
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
        if (statusReport === "Chấp nhận") {
            await Spaces.findOneAndUpdate(
                { _id: postSpace.spaceId._id },
                { $inc: { reportCount: 1 } }, // Tăng reportCount thêm 1
                { new: true }
            );
        }

        res.status(200).json(postSpace);
    } catch (error) {
        console.error("Error:", error); // Thêm log lỗi ra console
        res.status(500).json({ message: "Đã xảy ra lỗi khi chấp nhận post" });
    }
});

reportRouter.put('/reportsreject/:id', async (req, res) => {
    const { id } = req.params; // Lấy ID báo cáo từ URL
    const { reportRejectionReason } = req.body; // Lấy lý do từ request body

    if (!reportRejectionReason || !reportRejectionReason.trim()) {
        return res.status(400).json({ message: "Lý do từ chối không được để trống" });
    }

    try {
        // Tìm và cập nhật báo cáo
        const report = await Reports.findById(id);

        if (!report) {
            return res.status(404).json({ message: "Không tìm thấy báo cáo" });
        }


        report.statusReport = "Từ chối";
        report.reportRejectionReason = reportRejectionReason;
        await report.save();

        return res.status(200).json({
            message: "Báo cáo đã bị từ chối",
            data: report,
        });
    } catch (error) {
        console.error("Error rejecting report:", error);
        return res.status(500).json({ message: "Đã xảy ra lỗi khi xử lý yêu cầu" });
    }
});

//Chấp nhận khiếu nại 

reportRouter.put('/complaintaccept/:id', async (req, res) => {
    const { id } = req.params; // Lấy ID báo cáo từ URL

    try {
        // Tìm và cập nhật trạng thái báo cáo
        const report = await Reports.findById(id);

        if (!report) {
            return res.status(404).json({ message: "Không tìm thấy báo cáo" });
        }

        // Cập nhật trạng thái báo cáo là "Chấp nhận"
        report.statusComplaint = "Chấp nhận";
        await report.save();

        return res.status(200).json({
            message: "Khiếu nại đã được chấp nhận",
            data: report,
        });
    } catch (error) {
        console.error("Error accepting report:", error);
        return res.status(500).json({ message: "Đã xảy ra lỗi khi xử lý yêu cầu" });
    }
});



export default reportRouter;
