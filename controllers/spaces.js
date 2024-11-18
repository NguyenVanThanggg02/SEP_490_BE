import { spaceDao, appliancesDao } from "../dao/index.js";
import Spaces from "../models/spaces.js";

// Lấy tất cả không gian
const getAllSpaces = async (req, res) => {
  try {
    const allSpaces = await spaceDao.fetchAllSpaces();
    res.status(200).json(allSpaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy danh sách không gian yêu thích
const getAllSpaceFavorites = async (req, res) => {
  try {
    const allSpaces = await spaceDao.fetchAllSpaceFavorite();
    res.status(200).json(allSpaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy danh sách không gian tương tự
const getSimilarSpaces = async (req, res) => {
  try {
    const { id } = req.params;
    const spaces = await spaceDao.fetchSimilarSpaces(id);

    if (spaces) {
      res.status(200).json(spaces);
    } else {
      res.status(404).json({ message: "Không tìm thấy không gian tương tự" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Tạo mới một không gian
const createNewSpace = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      area,
      rulesId,
      pricePerHour,
      images,
      categoriesId,
      appliances,
      customAppliances,
    } = req.body;

    const customApplianceIds = await Promise.all(
      (customAppliances || []).map(async (appliance) => {
        const newAppliance = await appliancesDao.addCustomAppliance({
          name: appliance.name,
          description: appliance.description || "",
          isCustom: true,
        });
        return newAppliance._id;
      })
    );

    const allApplianceIds = [...(appliances || []), ...customApplianceIds];

    const spaceData = {
      name,
      description,
      location,
      area,
      rulesId,
      pricePerHour,
      images,
      categoriesId,
      appliancesId: allApplianceIds,
    };

    const newSpace = await spaceDao.createSpace(spaceData);

    res.status(201).json({ success: true, space: newSpace });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Lỗi khi tạo không gian: ${error.message}`,
    });
  }
};

// Thay đổi trạng thái yêu thích
const changeFavoriteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const space = await Spaces.findById(id);

    if (!space) {
      return res.status(404).json({ message: "Không gian không tồn tại" });
    }

    space.favorite = !space.favorite;
    await space.save();

    res.status(200).json({
      message: "Đã thay đổi trạng thái yêu thích thành công",
      favorite: space.favorite,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi hệ thống",
      error: error.message,
    });
  }
};

export default {
  getAllSpaces,
  getAllSpaceFavorites,
  getSimilarSpaces,
  createNewSpace,
  changeFavoriteStatus,
};
