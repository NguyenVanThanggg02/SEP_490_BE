// Function to fetch a space by its ID
const fetchSpaceById = async (id) => {
  try {
    return await Spaces.findById(id)
      .populate("appliancesId")
      .populate("userId")
      .populate("categoriesId")
      .populate("reviews")
      .exec();
  } catch (error) {
    throw new Error(error.toString());
  }
};

// Function to update a space by ID
const updateSpace = async (id, spaceData) => {
  try {
    return await Spaces.findByIdAndUpdate(id, spaceData, { new: true })
      .populate("appliancesId")
      .populate("userId")
      .exec();
  } catch (error) {
    console.error("Error updating space:", error);
    throw new Error("Error updating space in DAO");
  }
};

// Function to delete a space by ID
const deleteSpace = async (id) => {
  try {
    const deletedSpace = await Spaces.findByIdAndDelete(id);
    if (!deletedSpace) {
      throw new Error("Space not found");
    }
    return deletedSpace;
  } catch (error) {
    console.error("Error deleting space:", error);
    throw new Error("Error deleting space in DAO");
  }
};

// Function to find spaces by a specific user
const fetchSpacesByUserId = async (userId) => {
  try {
    return await Spaces.find({ userId })
      .populate("appliancesId")
      .populate("categoriesId")
      .exec();
  } catch (error) {
    throw new Error(error.toString());
  }
};

export default {
  fetchAllSpaces,
  fetchAllSpaceFavorite,
  fetchSimilarSpaces,
  createSpace,
  fetchSpaceById,
  updateSpace,
  deleteSpace,
  fetchSpacesByUserId,
};
