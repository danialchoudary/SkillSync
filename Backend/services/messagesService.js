import mongoose from 'mongoose';
import Message from '../models/Message.js';
import User from '../models/User.js';

export function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

export function normalizeReceiverId(receiverId) {
  return String(receiverId || '').trim();
}

export function normalizeMessageContent(content) {
  return typeof content === 'string' ? content.trim() : '';
}

export async function receiverExists(receiverId) {
  return User.exists({ _id: receiverId });
}

export async function createMessage(payload) {
  return Message.create(payload);
}

export async function getConversationMessages(currentUserId, otherUserId) {
  return Message.find({
    $or: [
      { senderId: currentUserId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: currentUserId },
    ],
  }).sort({ createdAt: 1 });
}

export async function findMessageById(messageId) {
  return Message.findById(messageId);
}

export async function markMessageSeen(message) {
  if (!message.seen) {
    message.seen = true;
    await message.save();
  }

  return message;
}

export async function deleteConversationMessages(currentUserId, otherUserId) {
  return Message.deleteMany({
    $or: [
      { senderId: currentUserId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: currentUserId },
    ],
  });
}

