import cloudinary from "../cloudinary.config.js";
import { notificationDao, spaceDao } from "../dao/index.js";
import CommunityStandards from "../models/communityStandards.js";
import Spaces from "../models/spaces.js";
import mongoose from "mongoose";
import Rules from "../models/rules.js";

import pkg from 'cloudinary'; // Nhập package cloudinary dưới dạng mặc định
import Appliances from "../models/appliances.js";
import Users from "../models/users.js";
import Bookings from "../models/bookings.js";
import UserNeeds from "../models/userNeeds.js";
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
    const allSpaces = await Spaces.find({}).lean().populate("reviews").populate("userId");
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


// get proposed Spaces
const getProposedSpaces = async (req, res) => {
  const userId = req.params.userId;
  if (!userId)
    return res.status(404).json({
      message: "UserId is required",
    });
  try {
    const userNeed = await UserNeeds.findOne({ userId })
      .populate("userId", "-password")
      .lean();

    if (!userNeed) {
      return res.status(404).json({
        message: "Not found user need",
      });
    }
    console.log("userNeed", userNeed);
    if (!userNeed.userId.firstLogin) {
      return res.json({
        message: "This is not first login",
        data: [],
      });
    }
    // user have choose some cate=> get spaces by cate
    console.log(userNeed?.productPreferences);
    let spaces = [];
    if (userNeed.productPreferences?.length) {
      spaces = await Spaces.find({
        categoriesId: { $in: [userNeed.productPreferences] },
      })
        .populate("categoriesId")
        .populate("reviews")
        .lean();
    } else {
      // user not choose cate=> get spaces by 5 fist spaces
      spaces = await Spaces.find({}, null, { skip: 5 })
        .populate("categoriesId")
        .populate("reviews")
        .lean();
    }

    // update firstLogin
    await Users.findByIdAndUpdate(userId, { firstLogin: false }).lean();

    res.json({
      message: "Get proposed spaced successfully",
      data: spaces,
    });
  } catch (error) {
    res.status(500).json({
      message: "Get user needs failed",
    });
  }
};

const getSimilarSpaces = async (req, res) => {
  try {
    const similarSpaces = req.params.id
    const spaces = await spaceDao.fetchSimilarSpaces(similarSpaces)
    if (spaces.length > 0) {
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

    // Kiểm tra các trường bắt buộc
    if (!name  || !location || !area  || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

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
      communityStandardsId: communityStandardsId, // Gán ID cho space
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
    console.error('Error:', error);
    res.status(500).json({ success: false, message: `Error creating space: ${error.message}` });
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
      userId 
    } = req.body;

    console.log("Received userId:", userId); 

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
    
    const adminList = await Users.find({ role: 1 });
    const user = await Users.findById(userId); 
    console.log("Fetched user:", user); 

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

//get space based on filter
const getFilteredSpaces = async (req, res, next) => {
  try {
    const {
      name,
      cateId,
      applianceNames,
      minArea,
      maxArea,
      typeOfPrice,
      minPrice,
      maxPrice,
      district,
    } = req.query;
    // Khởi tạo đối tượng filter rỗng
    let filter = {};

    // Lọc theo tên
    if (name) {
      const trimmedVal = name.trim();
      // Create a dynamic regular expression based on the input
      const regex = new RegExp(`.*${trimmedVal}.*`, "i");
      filter.name = { $regex: regex };
    }

    // Lọc theo danh mục
    if (cateId) {
      if (cateId !== "all") {
        filter.categoriesId = cateId; // categoriesId để lọc theo ObjectId
      }
    }

    // Convert minArea and maxArea to strings
    const minAreaStr = minArea.toString();
    const maxAreaStr = maxArea.toString();

    // Lọc theo khu vực
    if (minArea && maxArea) {
      filter["$expr"] = {
        $and: [
          { $gte: [{ $toDouble: "$area" }, parseFloat(minAreaStr)] },
          { $lte: [{ $toDouble: "$area" }, parseFloat(maxAreaStr)] },
        ],
      };
    } else if (minArea) {
      filter["$expr"] = {
        $and: [{ $gte: [{ $toDouble: "$area" }, parseFloat(minAreaStr)] }],
      };
    } else if (maxArea) {
      filter["$expr"] = {
        $and: [{ $lte: [{ $toDouble: "$area" }, parseFloat(maxAreaStr)] }],
      };
    }

    // Lọc theo gias
    if (typeOfPrice && minPrice && maxPrice) {
      filter["$expr"] = {
        $and: [
          { $gte: [{ $toDouble: `$${typeOfPrice}` }, parseFloat(minPrice)] },
          { $lte: [{ $toDouble: `$${typeOfPrice}` }, parseFloat(maxPrice)] },
        ],
      };
    } else if (minPrice) {
      filter["$expr"] = {
        $gte: [{ $toDouble: `$${typeOfPrice}` }, parseFloat(minPrice)],
      };
    } else if (maxPrice) {
      filter["$expr"] = {
        $lte: [{ $toDouble: `$${typeOfPrice}` }, parseFloat(maxPrice)],
      };
    }

    console.log("filter", filter);

    // Lọc theo tên thiết bị, applianceNames can be array or string
    if (applianceNames?.length || applianceNames) {
      // Step 1: Find appliance documents that match the given appliance names
      const appliances = await Appliances.find({
        "appliances.name": {
          $in: applianceNames?.length ? applianceNames : [applianceNames],
        },
      }).lean();

      const applianceIds = appliances.map((appliance) => appliance._id);
      filter["appliancesId"] = { $in: applianceIds };
    }

    const filteredSpaces = await Spaces.find(filter)
      .lean()
      .populate("categoriesId")
      .populate("rulesId")
      .populate("reviews")
      .populate("userId")
      .populate("appliancesId"); // Populate appliancesId nếu không có applianceNames

    res.status(200).json({
      message: "Get the filtered space successfully",
      data: filteredSpaces,
    });
  } catch (error) {
    next(error); // Gọi next với lỗi để xử lý lỗi
  }
};

const changeFavoriteStatus = async (req, res) => {
  try {
    const spaceId = req.params.id;

    // Tìm không gian qua DAO
    const space = await spaceDao.getSpaceById(spaceId);

    if (!space) {
      return res.status(404).json({ message: "Không gian không tồn tại" });
    }

    // Đảo ngược trạng thái yêu thích qua DAO
    const updatedSpace = await spaceDao.updateFavoriteStatus(space);

    return res.status(200).json({
      message: "Đã thay đổi trạng thái yêu thích thành công",
      favorite: updatedSpace.favorite,
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
    const deletedSpace = await spaceDao.deleteSpace(req.params.id);

    if (!deletedSpace) {
      return res.status(404).json({ message: 'Space not found' });
    }

    res.status(200).json(deletedSpace);
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
const getBookingDetailsSpaces = async (req, res) => {
  const userId = req.params.userId;

  if (!userId)
    return res.status(404).json({
      message: "All field is required",
    });
  try {
    const spaces = await Spaces.find({ userId }, "name").lean();
    const spacesWithBook = await Promise.all(
      spaces.map(async (space, i) => {
        const bookings = await Bookings.find(
          { spaceId: space._id.toString(), status: "completed" },
          "createdAt plusTransId"
        )
          .lean()
          .populate("plusTransId");

        return {
          ...space,
          bookings,
        };
      })
    );

    res.json({
      message: "Get space with booking info successfully",
      data: spacesWithBook,
    });
  } catch (error) {
    res.status(500).json({
      message: "Get space with booking info failed",
    });
  }
};

// const getBookingDetailsSpaces = async (req, res) => {
//   const userId = req.params.userId;
//   const { month, year } = req.query;

//   if (!userId || !month || !year)
//     return res.status(404).json({
//       message: "All field is required",
//     });
//   try {
//     let filter = {
//       status: "completed",
//     };
//     if (month !== "all") {
//       // Create the start and end dates for the query
//       const startDate = new Date(year, month - 1, 1); // month is 0-indexed in JavaScript Date
//       const endDate = new Date(year, month, 0); // last day of the month
//       filter.createdAt = {
//         $gte: startDate,
//         $lt: endDate,
//       };
//     } else {
//       // First date and time of the year
//       const startDate = new Date(year, 0, 1, 0, 0, 0, 0);
//       // Last date and time of the year
//       const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
//       filter.createdAt = {
//         $gte: startDate,
//         $lt: endDate,
//       };
//     }
//     const spaces = await Spaces.find({ userId }, "name").lean();
//     const spacesWithBook = await Promise.all(
//       spaces.map(async (space, i) => {
//         const bookings = await Bookings.find(
//           { spaceId: space._id.toString(), status: "completed", ...filter },
//           "createdAt plusTransId"
//         )
//           .lean()
//           .populate("plusTransId");

//         const getTotalPlusTrans = (plusTransId) => {
//           return plusTransId.reduce((acc, currVal) => {
//             return acc + Number(currVal.amount);
//           }, 0);
//         };

//         const flatPlusTransId = bookings.flatMap((booking) => {
//           return booking.plusTransId;
//         });
//         return {
//           ...space,
//           numOfBooking: bookings.length,
//           totalAvenue: flatPlusTransId.length
//             ? getTotalPlusTrans(flatPlusTransId)
//             : 0,
//         };
//       })
//     );

//     res.json({
//       message: "Get space with booking info successfully",
//       data: spacesWithBook,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Get space with booking info failed",
//     });
//   }
// };

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
  updateSpace,
  getProposedSpaces,
  getBookingDetailsSpaces,
  getFilteredSpaces
}
