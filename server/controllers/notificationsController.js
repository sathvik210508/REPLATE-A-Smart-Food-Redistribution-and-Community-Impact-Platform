import { store } from '../services/store.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = store
      .getNotifications()
      .filter((n) => String(n.recipientId) === String(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const unreadCount = notifications.filter((n) => !n.read).length;

    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve notifications.', error: err.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = store.findById('notifications', id);

    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    const updated = store.findByIdAndUpdate('notifications', id, { read: true });

    res.json({
      success: true,
      notification: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark notification read.', error: err.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const list = store.getNotifications();

    list.forEach((n) => {
      if (String(n.recipientId) === String(userId)) {
        n.read = true;
      }
    });
    store.persist();

    res.json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark all as read.', error: err.message });
  }
};
