import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket = null;

/**
 * Initializes and connects the socket with JWT authentication.
 * @param {string} token - The JWT token for authentication.
 * @returns {Socket} The connected socket instance.
 */
export function connectSocket(token) {
    if (socket?.connected) {
        console.log('[Socket] Already connected.');
        return socket;
    }

    // If socket exists but is disconnected, ensure we close it properly before reconnecting
    if (socket) {
        socket.close();
        socket = null;
    }

    console.log('[Socket] Connecting to:', SOCKET_URL);

    socket = io(SOCKET_URL, {
        auth: { token },
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
        console.log('[Socket] Connected successfully! ID:', socket.id);
    });

    socket.on('connect_error', (err) => {
        console.error('[Socket] Connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
    });

    return socket;
}

/**
 * Returns the current socket instance.
 * @returns {Socket|null}
 */
export function getSocket() {
    return socket;
}

/**
 * Disconnects the socket.
 */
export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('[Socket] Manually disconnected.');
    }
}

/**
 * Emits an event with data.
 * @param {string} event - The event name.
 * @param {any} data - The payload.
 * @param {Function} [callback] - Optional acknowledgment callback.
 */
export function emitEvent(event, data, callback) {
    if (!socket || !socket.connected) {
        console.warn('[Socket] Cannot emit, not connected.');
        return;
    }
    socket.emit(event, data, callback);
}

/**
 * Subscribes to an event.
 * @param {string} event - The event name.
 * @param {Function} handler - The event callback.
 */
export function onEvent(event, handler) {
    if (!socket) {
        console.warn('[Socket] Cannot subscribe, socket not initialized.');
        return;
    }
    socket.on(event, handler);
}

/**
 * Unsubscribes from an event.
 * @param {string} event - The event name.
 * @param {Function} [handler] - The specific handler to remove (optional).
 */
export function offEvent(event, handler) {
    if (!socket) return;
    socket.off(event, handler);
}
