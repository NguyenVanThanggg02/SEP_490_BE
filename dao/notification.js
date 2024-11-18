import { socketAction } from "../helpers/constants.js";
import { getSocket, getUserList } from "../helpers/socket.io.js";
import Notification from "../models/notification.js";

async function saveNotification(userId, content, imageUrl = null, url = null) {
  try {
    const notification = new Notification({
      userId,
      content,
      imageUrl,
      url,
      isRead: false,
    });
    const savedNotification = await notification.save();
    return savedNotification;
  } catch (error) {
    console.error("Error saving notification:", error);
    throw error;
  }
}

async function getNotificationsByUserId(userId) {
  try {
    const query = { userId };
    const notifications = await Notification.find(query).sort({
      createdAt: -1,
    });
    return notifications;
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    throw error;
  }
}

async function markNotificationAsRead(notificationArr, userId) {
  try {
    const result = await Notification.updateMany(
      { _id: { $in: notificationArr }, userId: userId },
      {
        $set: { isRead: true },
      }
    );
    console.log(`Marked ${result.nModified} notifications as read.`);
    return result;
  } catch (error) {
    console.error("Error updating notification:", error);
    throw error;
  }
}

async function saveAndSendNotification(
  userId,
  content,
  imageUrl = null,
  url = null
) {
  const notification = await this.saveNotification(
    userId,
    content,
    (imageUrl = null),
    url
  );
  const userConnectedList = getUserList();
  const io = getSocket();
  userConnectedList
    .filter((userConnected) => userConnected.id === userId)
    .forEach((userConnected) => {
      io.to(userConnected.connectedId).emit(
        socketAction.NEW_NOTI,
        notification
      );
    });
}

export default {
  saveNotification,
  getNotificationsByUserId,
  markNotificationAsRead,
  saveAndSendNotification,
};
