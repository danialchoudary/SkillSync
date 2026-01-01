import jwt from 'jsonwebtoken';
import User from '../../models/User.js';

/**
 * Socket.IO authentication middleware.
 * Validates the JWT token passed in the handshake `auth` object.
 * On success, attaches `socket.user` for use in handlers.
 */
export async function socketAuthMiddleware(socket, next) {
    try {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(new Error('Authentication error: Token missing'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }

        // Attach user to socket for use in handlers
        socket.user = user;
        next();
    } catch (err) {
        // console.error('[Socket Auth] Error:', err.message);
        next(new Error('Authentication error: Invalid token'));
    }
}
