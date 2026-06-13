import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 for performance
    return res.json(notifications);
  } catch (err) {
    console.error('Get notifications error:', err);
    return res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    return res.json(notification);
  } catch (err) {
    console.error('Mark notification as read error:', err);
    return res.status(500).json({ error: 'Failed to mark notification as read.' });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('Mark all notifications as read error:', err);
    return res.status(500).json({ error: 'Failed to mark all notifications as read.' });
  }
};
