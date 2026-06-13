import Notification from '../models/Notification.js';
import { getIO } from '../socket/index.js';

/**
 * Creates a notification in the database and emits it via Socket.IO
 * 
 * @param {string} recipientId - The user ID to receive the notification
 * @param {string} type - 'application_status_update', 'new_application', 'system'
 * @param {string} title - Notification title
 * @param {string} message - Notification message body
 * @param {string} link - Optional link to navigate to when clicked
 * @param {string} image - Optional image URL for avatar/logo
 */
export async function createNotification(recipientId, type, title, message, link = '', image = '') {
  try {
    const notification = new Notification({
      recipient: recipientId,
      type,
      title,
      message,
      link,
      image,
    });

    await notification.save();

    // Emit live to the user if they are connected
    try {
      const io = getIO();
      // Users are joined to a room matching their recipientId
      io.to(recipientId.toString()).emit('new_notification', notification);
    } catch (socketErr) {
      console.warn('[NotificationService] Failed to emit via socket (is socket initialized?):', socketErr.message);
    }

    return notification;
  } catch (err) {
    console.error('[NotificationService] Error creating notification:', err);
    throw err;
  }
}
