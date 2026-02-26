import User from '../models/User.js';

export async function listUsersForMessaging(currentUserId) {
  return User.find(
    { _id: { $ne: currentUserId } },
    'name email role companyName companyLogo profilePicture',
  );
}
