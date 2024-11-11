import { messageDao } from "../dao/index.js";
import Spaces from "../models/spaces.js";
import Users from "../models/users.js";

const sendMessage = async (req, res) => {
  try {
    const { userId, messageContent, spaceId } = req.body;
    
    const [space, sender, receiver] = await Promise.all([
      Spaces.findById(spaceId),
      Users.findById(userId),
      Spaces.findById(spaceId).then(space => space ? Users.findById(space.userId) : null)
    ]);

    if (!space) return res.status(400).json({ message: "Không gian không tồn tại" });
    if (!sender || !receiver) return res.status(400).json({ message: "User không tồn tại" });

    const messaged = await messageDao.sendMessage(userId, space.userId, messageContent, spaceId);
    res.status(201).json({ message: "Tin nhắn đã được gửi", data: messaged });
  } catch (error) {
    res.status(500).json({ message: error.toString() });
  }
};

const getMessagesBetweenUsers = async (req, res) => {
  try {
    const { userId, receiverId, spaceId } = req.params;

    const [sender, receiver] = await Promise.all([
      Users.findById(userId),
      Users.findById(receiverId)
    ]);

    if (!sender || !receiver) return res.status(400).json({ message: "User hoặc Receiver không tồn tại" });

    const messages = await messageDao.getMessages(userId, receiverId, spaceId);
    if (!messages.length) return res.status(404).json({ message: "Không có tin nhắn nào giữa hai người" });

    res.status(200).json({ data: messages });
  } catch (error) {
    res.status(500).json({ message: error.toString() });
  }
};

export default { sendMessage, getMessagesBetweenUsers };
