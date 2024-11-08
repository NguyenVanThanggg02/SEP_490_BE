import cloudinary from "../cloudinary.config.js";
import { notificationDao, spaceDao } from "../dao/index.js";
import CommunityStandards from "../models/communityStandards.js";
import Spaces from "../models/spaces.js";
import mongoose from "mongoose";
import Rules from "../models/rules.js";

import pkg from 'cloudinary'; // Nhập package cloudinary dưới dạng mặc định
import Appliances from "../models/appliances.js";
import Users from "../models/users.js";
const getAllSpacesApply = async (req, res) => {
  try {
    const allSpaces = await spaceDao.fetchAllSpacesApply();
    res.status(200).json(allSpaces)
  } catch (error) {
    res.status(500).json({ error: error.toString() })
  }
}
const getAllSpaces = async (req, res) => {
  try {
    const allSpaces = await spaceDao.fetchAllSpaces();
    res.status(200).json(allSpaces)
  } catch (error) {
    res.status(500).json({ error: error.toString() })
  }
}

//get space favorite
const getAllSpaceFavorites = async (req, res) => {
  try {
    const allSpaces = await spaceDao.fetchAllSpaceFavorite();
    res.status(200).json(allSpaces)
  } catch (error) {
    res.status(500).json({ error: error.toString() })
  }
}

const getSimilarSpaces = async (req, res) => {
  try {
    const similarSpaces = req.params.id
    const spaces = await spaceDao.fetchSimilarSpaces(similarSpaces)
    if (spaces) {
      res.status(200).json(spaces)
    } else {
      res.status(400).json({ message: 'not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.toString() })
  }
}



const createNewSpace = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      area,
      rulesId,
      userId,
      pricePerHour,
      pricePerDay,
      pricePerWeek,
      pricePerMonth,
      images,
      censorship,
      status,
      categoriesId,
      appliancesId,
      reportCount,
      isGoldenHour,
      goldenHourDetails,
      favorite,
      latLng,
    } = req.body;

    let formattedImages = [];
    if (Array.isArray(images)) {
      formattedImages = images.map(img => ({
        public_id: img.public_id,
        url: img.url
      }));
    } else if (images && images.public_id && images.url) {
      formattedImages = [{
        public_id: images.public_id,
        url: images.url
      }];
    }
    const communityStandardsId = new mongoose.Types.ObjectId();

    const newCommunityStandards = new CommunityStandards({
      _id: communityStandardsId,
      reasons: [],
      customReason: []
    });
    await newCommunityStandards.save();





    const spaceData = {
      name,
      description,
      location,
      area,
      rulesId,
      userId,
      pricePerHour,
      pricePerDay,
      pricePerWeek,
      pricePerMonth,
      images: formattedImages,
      censorship,
      status,
      categoriesId,
      appliancesId,
      reportCount,
      isGoldenHour,
      goldenHourDetails,
      communityStandardsId: communityStandardsId, // Gán ID đã tạo cho space
      favorite,
      latLng,
      locationPoint: {type: "Point", coordinates: latLng && latLng.length === 2 ? [latLng[1], latLng[0]] : null}
    };
    const newSpace = await Spaces.create(spaceData); // Tạo không đồng bộ
    const adminList = await Users.find({ role: 1 });
    const user = await Users.findById(spaceData.userId)
    adminList.forEach((admin) => {
      notificationDao.saveAndSendNotification(
        admin._id.toString(),
        `${user?.fullname} đã thêm mới space ${newSpace?.name}`,
        newSpace.images && newSpace.images.length > 0
          ? newSpace.images[0].url
          : null, "/admin#manage-spaces"
      );
    });
    return res.status(201).json({ success: true, space: newSpace });
  } catch (error) {
    console.error("Error creating space:", error);
    return res.status(500).json({ success: false, message: `Error creating space: ${error.message}` });
  }
};

const updateSpace = async (req, res) => {
  const { id } = req.params;
  try {
    const {
      name,
      rulesId,
      pricePerHour,
      pricePerDay,
      pricePerWeek,
      pricePerMonth,
      images,
      location,
      latLng,
      categoriesId,
      appliancesId,
      isGoldenHour,
      goldenHourDetails,
      userId // Thêm userId vào đây
    } = req.body;

    console.log("Received userId:", userId); // Kiểm tra xem userId có được truyền vào không

    let formattedImages = [];
    if (Array.isArray(images)) {
      formattedImages = images.map((img) => ({
        public_id: img.public_id,
        url: img.url,
      }));
    } else if (images && images.public_id && images.url) {
      formattedImages = [
        {
          public_id: images.public_id,
          url: images.url,
        },
      ];
    }

    const spaceData = {
      name,
      pricePerHour,
      pricePerDay,
      pricePerWeek,
      pricePerMonth,
      images: formattedImages,
      location,
      locationPoint: {
        type: "Point",
        coordinates: latLng && latLng.length === 2 ? [latLng[1], latLng[0]] : null,
      },
      latLng,
      categoriesId,
      isGoldenHour,
      goldenHourDetails,
      censorship: "Chờ duyệt",
    };

    const updatedRules = await Rules.findByIdAndUpdate(rulesId._id, { ...rulesId }).lean();
    if (!updatedRules)
      return res.status(404).json({
        success: false,
        message: `Error updating space: rule not found`,
      });

    const updatedAppliances = await Appliances.findByIdAndUpdate(
      appliancesId._id,
      { ...appliancesId }
    ).lean();
    if (!updatedAppliances)
      return res.status(404).json({
        success: false,
        message: `Error updating space: appliances not found`,
      });

    const updatedSpace = await spaceDao.updateSpace(id, spaceData);
    
    // Thêm phần thông báo cho quản trị viên
    const adminList = await Users.find({ role: 1 });
    const user = await Users.findById(userId); // Tìm user dựa vào userId
    console.log("Fetched user:", user); // Kiểm tra kết quả của truy vấn user

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Error: User not found with id ${userId}`,
      });
    }

    adminList.forEach((admin) => {
      notificationDao.saveAndSendNotification(
        admin._id.toString(),
        `${user.fullname} đã cập nhật không gian ${updatedSpace?.name}`,
        updatedSpace.images && updatedSpace.images.length > 0
          ? updatedSpace.images[0].url
          : null, "/admin#manage-spaces"
      );
    });

    console.log("updatedSpace", updatedSpace, updatedAppliances, updatedRules);
    return res.status(201).json({ success: true, space: updatedSpace });
  } catch (error) {
    console.error("Error updating space:", error);
    return res.status(500).json({
      success: false,
      message: `Error updating space: ${error.message}`,
    });
  }
};



const changeFavoriteStatus = async (req, res) => {
  try {
    const spaceId = req.params.id;

    // Tìm không gian theo ID
    const space = await Spaces.findById(spaceId);

    if (!space) {
      return res.status(404).json({ message: "Không gian không tồn tại" });
    }

    // Đảo ngược trạng thái của favorite
    space.favorite = !space.favorite;

    // Lưu lại thay đổi
    await space.save();

    return res.status(200).json({
      message: "Đã thay đổi trạng thái yêu thích thành công",
      favorite: space.favorite,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi hệ thống",
      error: error.message,
    });
  }
};

const removeImages = async (req, res) => {
  try {
    const { public_id } = req.body; // Lấy public_id từ body của request

    // Sử dụng cloudinary.uploader.destroy với await
    const result = await cloudinary.uploader.destroy(public_id);

    // Kiểm tra kết quả từ cloudinary và trả về phản hồi thích hợp
    if (result.result === 'ok') {
      return res.status(200).json({ message: 'Image deleted successfully' });
    } else {
      return res.status(400).json({ message: 'Failed to delete image', result });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const uploadImages = async (req, res) => {
  try {
    // Lấy thông tin ảnh từ req.files
    const images = req.files.map(file => ({
      url: file.path, // URL của ảnh đã được upload
      public_id: file.filename, // public_id của ảnh
    }));

    return res.status(200).json({
      message: 'Images uploaded successfully',
      images: images, // Trả về danh sách ảnh
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

const deleteSpace = async (req, res) => {
  try {
    const deleteSpace = await spaceDao.deleteSpace(req.params.id);
    res.status(200).json(deleteSpace);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
    console.log('Failed to delete product');
  }
};


const updateSpaceCensorshipAndCommunityStandards = async (req, res) => {
  try {
    const spaceId = req.params.id;
    const { censorship, reasons, customReason } = req.body;

    // Cập nhật trạng thái censorship của space
    const updatedSpace = await Spaces.findByIdAndUpdate(
      spaceId,
      { censorship, reasons, customReason }, // Các trường cần thiết
      { new: true } // Trả về tài liệu đã cập nhật
    ).populate("communityStandardsId");

    // Cập nhật mảng reasons và customReason của communityStandards
    const communityStandards = await CommunityStandards.findById(updatedSpace.communityStandardsId);
    if (communityStandards) {
      communityStandards.reasons = reasons; // Cập nhật lý do
      communityStandards.customReason = customReason; // Cập nhật lý do tùy chỉnh
      await communityStandards.save(); // Lưu thay đổi
    }

    // Nếu censorship là "Từ chối", gửi thông báo
    if (censorship === "Từ chối") {
      // Gửi thông báo cho người dùng
      await notificationDao.saveAndSendNotification(
        updatedSpace.userId.toString(),  // ID người dùng của không gian
        `${updatedSpace.name} đã bị ${censorship.toLowerCase()}`,  // Nội dung thông báo
        updatedSpace.images && updatedSpace.images.length > 0 ? updatedSpace.images[0].url : null,  // Hình ảnh (nếu có)
        `/spaces/${updatedSpace._id.toString()}`  // Liên kết đến không gian
      );
    }

    return res.status(200).json({ success: true, space: updatedSpace });
  } catch (error) {
    console.error('Error updating space and community standards:', error);
    return res.status(500).json({ success: false, message: 'Error updating space and community standards' });
  }
};


export default {
  getAllSpaces,
  getSimilarSpaces,
  createNewSpace,
  changeFavoriteStatus,
  getAllSpaceFavorites,
  removeImages,
  uploadImages,
  getAllSpacesApply,
  deleteSpace,
  updateSpaceCensorshipAndCommunityStandards,
  updateSpace
}
