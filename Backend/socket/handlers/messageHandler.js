import Message from '../../models/Message.js';

/**
 * Registers message-related event handlers on a socket connection.
 * @param {Socket} socket - The connected socket instance.
 * @param {Server} io - The Socket.IO server instance.
 */
export function registerMessageHandlers(socket, io) {
    // Join a private room for 1-on-1 chat
    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`[Socket] User ${socket.user._id} joined room ${roomId}`);
    });

    // Leave a room
    socket.on('leave_room', (roomId) => {
        socket.leave(roomId);
        console.log(`[Socket] User ${socket.user._id} left room ${roomId}`);
    });

    /**
     * Expected payload:
     * { receiverId: string, content: string }
     *
     * This handler:
     * 1. Validates payload
     * 2. Persists message via Message model (same logic as REST)
     * 3. Broadcasts to the receiver's room and sender's room
     */
    socket.on('send_message', async (payload, callback) => {
        try {
            const { receiverId, content, messageType, fileUrl, fileName, fileType, fileSize } = payload;
            const senderId = socket.user._id.toString();

            if (!receiverId || (!content && messageType !== 'file')) {
                return callback?.({ error: 'Missing receiverId or content' });
            }

            // Persist message - use correct field names from Message model
            const message = new Message({
                senderId: senderId,
                receiverId: receiverId,
                content: (content || '').trim(),
                messageType: messageType || 'text',
                fileUrl,
                fileName,
                fileType,
                fileSize
            });
            await message.save();

            // Populate sender and receiver for response
            const populatedMessage = await Message.findById(message._id)
                .populate('senderId', 'name profilePicture')
                .populate('receiverId', 'name profilePicture');

            // Emit to both sender and receiver using their user IDs as room names
            io.to(receiverId).emit('receive_message', populatedMessage);
            io.to(senderId).emit('receive_message', populatedMessage);

            callback?.({ success: true, message: populatedMessage });

        } catch (err) {
            console.error('[Socket] send_message error:', err);
            callback?.({ error: 'Failed to send message' });
        }
    });

    // Typing indicator
    socket.on('typing', ({ receiverId, isTyping }) => {
        io.to(receiverId).emit('user_typing', {
            senderId: socket.user._id.toString(),
            isTyping,
        });
    });
}
