import {
  createMessage,
  findMessageById,
  getConversationMessages,
  isValidObjectId,
  markMessageSeen,
  normalizeMessageContent,
  normalizeReceiverId,
  receiverExists,
} from '../services/messagesService.js';

export async function sendMessage(req, res) {
  const { receiverId, content, messageType, fileUrl, fileName, fileType, fileSize } = req.body;
  const senderId = req.user._id.toString();
  const normalizedReceiverId = normalizeReceiverId(receiverId);
  const normalizedContent = normalizeMessageContent(content);

  if (!normalizedReceiverId || (!normalizedContent && messageType !== 'file')) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!isValidObjectId(normalizedReceiverId)) {
    return res.status(400).json({ error: 'Invalid receiverId' });
  }

  if (normalizedReceiverId === senderId) {
    return res.status(400).json({ error: 'You cannot send messages to yourself' });
  }

  try {
    const exists = await receiverExists(normalizedReceiverId);
    if (!exists) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    const message = await createMessage({
      senderId,
      receiverId: normalizedReceiverId,
      content: normalizedContent,
      messageType: messageType || 'text',
      fileUrl,
      fileName,
      fileType,
      fileSize,
    });

    return res.status(201).json(message);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send message' });
  }
}

export async function uploadMessageAttachment(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    return res.json({
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });
  } catch (err) {
    console.error('File upload error:', err);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
}

export async function getConversation(req, res) {
  const userId = normalizeReceiverId(req.params.userId);
  const currentUserId = req.user._id.toString();

  if (!isValidObjectId(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  if (userId === currentUserId) {
    return res.json([]);
  }

  try {
    const messages = await getConversationMessages(currentUserId, userId);
    return res.json(messages);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch conversation' });
  }
}

export async function markSeen(req, res) {
  try {
    const message = await findMessageById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    if (message.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not allowed to mark this message as seen' });
    }

    const updatedMessage = await markMessageSeen(message);
    return res.json(updatedMessage);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to mark message as seen' });
  }
}

