import Reports from "../models/reports.js";
import Spaces from "../models/spaces.js";

const fetchAllReports = async () => {
  try {
    return await Reports.find({})
      .populate("reasonId")
      // .populate("userId")
      // .populate("spaceId")
      .exec();
  } catch (error) {
    throw new Error(`Failed to fetch reports: ${error.message}`);
  }
};

const createReports = async (reasonId, userId, spaceId) => {
  try {
    const newReport = await Reports.create({ reasonId, userId, spaceId });

    await Spaces.findByIdAndUpdate(
      spaceId,
      { $inc: { reportCount: 1 } },
      { new: true }
    );

    return newReport;
  } catch (error) {
    throw new Error(`Failed to create report: ${error.message}`);
  }
};

export default { fetchAllReports, createReports };
