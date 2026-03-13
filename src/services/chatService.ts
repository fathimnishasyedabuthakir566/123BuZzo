const API_URL = '/api/chat';

export interface ChatMessage {
    _id: string;
    roomId: string;
    senderId: string;
    senderName: string;
    senderRole: 'user' | 'driver' | 'admin' | 'support';
    message: string;
    messageType: 'text' | 'system' | 'alert';
    isRead: boolean;
    createdAt: string;
}

export interface ChatRoom {
    _id: string; // roomId
    lastMessage: string;
    lastSender: string;
    lastTime: string;
    messageCount: number;
    unreadCount: number;
}

export const chatService = {
    async getMessages(roomId: string): Promise<ChatMessage[]> {
        try {
            const res = await fetch(`${API_URL}/${roomId}`);
            if (!res.ok) throw new Error('Failed');
            return await res.json();
        } catch {
            return [];
        }
    },

    async sendMessage(data: Partial<ChatMessage>): Promise<ChatMessage | null> {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed');
            return await res.json();
        } catch {
            return null;
        }
    },

    async getActiveRooms(): Promise<ChatRoom[]> {
        try {
            const res = await fetch(`${API_URL}/rooms/active`);
            if (!res.ok) throw new Error('Failed');
            return await res.json();
        } catch {
            return [];
        }
    }
};
