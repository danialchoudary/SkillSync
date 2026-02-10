import { Server } from 'socket.io';
import { socketAuthMiddleware } from './middleware/socketAuth.js';
import { registerMessageHandlers } from './handlers/messageHandler.js';

let io = null;

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

            // Each user automatically joins a private room with their own ID.
            socket.join(socket.user._id.toString());

            // Register event handlers
            registerMessageHandlers(socket, io);

            // User online presence
            io.emit('user_online', { userId: socket.user._id.toString() });

            socket.on('disconnect', (reason) => {
                try {
                    console.log(`[Socket] User disconnected: ${socket.user._id}, reason: ${reason}`);
                    io.emit('user_offline', { userId: socket.user._id.toString() });
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
