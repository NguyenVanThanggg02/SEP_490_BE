import Spaces from "../models/spaces.js";

const fetchAllSpacesApply = async () => {
  try {
    return await Spaces.find({ censorship: "Chấp nhận" })
    .populate("communityStandardsId")
    .populate("appliancesId")
    .populate("userId")
    .exec()
  } catch (error) {
    throw new Error(error.toString());
  }
}
const fetchAllSpaces = async () => {
  try {
    return await Spaces.find({}).populate("appliancesId").populate("userId").exec()
  } catch (error) {
    throw new Error(error.toString());
  }
}

const fetchAllSpaceFavorite = async () => {
  try {
    return await Spaces.find({ favorite: true }).populate("appliancesId").exec()
  } catch (error) {
    throw new Error(error.toString());
  }
}

const fetchSimilarSpaces = async (id) => {
  try {
    const spaceId = await Spaces.find({ categoriesId: id, censorship: "Chấp nhận" })
      .populate('categoriesId')
      .populate('reviews')
    return spaceId
  } catch (error) {
    throw new Error(error.toString());
  }
}
const createCommunityStandards = async (communityStandardsData) => {
  const newCommunityStandards = new CommunityStandards(communityStandardsData);
  return await newCommunityStandards.save();
};



export const createSpace = async (spaceData) => {
  try {
    const newSpace = new Spaces({
      ...spaceData,
       locationPoint: {type: "Point", coordinates: spaceData.latLng 
        ? [spaceData.latLng[1], spaceData.latLng[0]] 
        : null}});
    await newSpace.save();
    return newSpace;
  } catch (error) {
    console.error("Error saving space to database:", error);
    throw new Error('Error creating space in DAO');
  }
};

export const updateSpace = async (id, spaceData) => {
  try {
    console.log("updateSpace", spaceData);
    const updatedSpace = await Spaces.findByIdAndUpdate(id, spaceData).lean();
    return updatedSpace;
  } catch (error) {
    console.error("Error updating space to database:", error);
    throw new Error("Error updating space in DAO");
  }
};

const deleteSpace = async (id) => {
  try {
    const deleteProduct = await Spaces.findByIdAndDelete(id).exec();
    if (!deleteProduct) throw new Error('Server error');
    return deleteProduct;
  } catch (error) {
    throw new Error(error.toString());
  }
};

const getSpaceById = async (spaceId) => {
  return await Spaces.findById(spaceId);
};

const updateFavoriteStatus = async (space) => {
  space.favorite = !space.favorite;
  return await space.save();
};

export default { fetchAllSpaces, fetchSimilarSpaces, createSpace, fetchAllSpaceFavorite, fetchAllSpacesApply, deleteSpace, updateSpace,getSpaceById,updateFavoriteStatus,createCommunityStandards }
