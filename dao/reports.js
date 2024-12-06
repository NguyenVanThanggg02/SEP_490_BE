import Reports from "../models/reports.js";
import Spaces from "../models/spaces.js";

const fetchAllReports = async () => {
  try {
    const reports = await Reports.find({})
      .populate("reasonId")
      // .populate("userId")
      // .populate("spaceId")
      .exec();
    return reports;
  } catch (error) {
    throw new Error(`Error fetching reports: ${error.message}`);
  }
};

const createReports = async (reasonId, userId, spaceId) => {
  try {
    const newReport = new Reports({ reasonId, userId, spaceId });
    await newReport.save();

    await Spaces.updateOne(
      { _id: spaceId },
      { $inc: { reportCount: 1 } }
    );

    return newReport;
  } catch (error) {
    throw new Error(`Error creating report: ${error.message}`);
  }
};

export default { fetchAllReports, createReports };
