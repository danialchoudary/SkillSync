import { Server } from 'socket.io';
import { socketAuthMiddleware } from './middleware/socketAuth.js';
import { registerMessageHandlers } from './handlers/messageHandler.js';

let io = null;
const userConnectionCounts = new Map();
const socketToUserId = new Map();

function markUserConnected(userId) {
    const nextCount = (userConnectionCounts.get(userId) || 0) + 1;
    userConnectionCounts.set(userId, nextCount);

    if (nextCount === 1) {
        io.emit('user_online', { userId });
    }
}

function markUserDisconnected(userId) {
    const currentCount = userConnectionCounts.get(userId) || 0;
    if (currentCount <= 1) {
        userConnectionCounts.delete(userId);
        io.emit('user_offline', { userId });
        return;
    }

    userConnectionCounts.set(userId, currentCount - 1);
}

function getOnlineUserIds() {
    return Array.from(userConnectionCounts.keys());
}

/**
 * Initializes the Socket.IO server.
 * @param {http.Server} httpServer - The HTTP server instance.
 * @returns {Server} The Socket.IO server instance.
 */
export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: [
                'http://localhost:5173',
                process.env.FRONTEND_URL,
            ].filter(Boolean),
            credentials: true,
        },
        // For production horizontal scaling, uncomment the Redis adapter setup below:
        // adapter: createAdapter(pubClient, subClient),
    });

    // Apply authentication middleware
    io.use(socketAuthMiddleware);

    io.on('connection', (socket) => {
        try {
            console.log(`[Socket] User connected: ${socket.user._id} (${socket.user.name || socket.user.email})`);
            const userId = socket.user._id.toString();

            // Each user automatically joins a private room with their own ID.
            socket.join(userId);
            socketToUserId.set(socket.id, userId);
            markUserConnected(userId);

            // Send online snapshot to the just-connected client.
            socket.emit('online_users', { userIds: getOnlineUserIds() });

            socket.on('request_online_users', () => {
                socket.emit('online_users', { userIds: getOnlineUserIds() });
            });

            // Register event handlers
            registerMessageHandlers(socket, io);

            socket.on('disconnect', (reason) => {
                try {
                    console.log(`[Socket] User disconnected: ${socket.user._id}, reason: ${reason}`);
                    const disconnectedUserId = socketToUserId.get(socket.id) || socket.user._id.toString();
                    socketToUserId.delete(socket.id);
                    markUserDisconnected(disconnectedUserId);
                } catch (err) {
                    console.error('[Socket] Disconnect error:', err);
                }
            });
        } catch (err) {
            console.error('[Socket] Connection error:', err);
            socket.disconnect();
        }
    });

    console.log('[Socket] Socket.IO server initialized');
    return io;
}

/**
 * Returns the active Socket.IO server instance.
 * @returns {Server|null}
 */
export function getIO() {
    if (!io) {
        throw new Error('Socket.IO not initialized. Call initSocket first.');
    }
    return io;
}
