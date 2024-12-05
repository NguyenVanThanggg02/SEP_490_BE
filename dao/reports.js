import Reports from "../models/reports.js";
import Spaces from "../models/spaces.js";

const fetchAllReports = async () => {
  try {
    const allReports = await Reports.find({})
    .populate("reasonId")
    // .populate("userId")
    // .populate("spaceId")
    .exec();
    return allReports;
  } catch (error) {
    throw new Error(error.message);
  }
};

const findReportByUserAndSpace = async (userId, spaceId) => {
  try {
    return await Reports.findOne({ userId, spaceId }).lean();
  } catch (error) {
    throw new Error(error.message);
  }
};


const createReports = async (reasonId, userId, spaceId, customReason) => {
  try {
    const createReport = await Reports.create({
      reasonId,
      userId,
      spaceId,
      customReason
    });
    await Spaces.findByIdAndUpdate(
      spaceId,
      { $inc: { reportCount: 1 } },
      { new: true }
    );
    return createReport;
  } catch (error) {
    throw new Error(error.toString());
  }
};

export default { createReports, fetchAllReports,findReportByUserAndSpace };
