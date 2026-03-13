const API_URL = '/api/notifications';

export interface Notification {
    _id: string;
    userId: string;
    type: 'bus_arrival' | 'delay' | 'platform_change' | 'proximity' | 'system' | 'route_alert' | 'chat';
    title: string;
    message: string;
    busId?: string;
    routeFrom?: string;
    routeTo?: string;
    isRead: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    metadata?: Record<string, unknown>;
    createdAt: string;
}

export const notificationService = {
    async getNotifications(userId: string, unreadOnly = false): Promise<{ notifications: Notification[]; unreadCount: number }> {
        try {
            const res = await fetch(`${API_URL}/${userId}?unreadOnly=${unreadOnly}`);
            if (!res.ok) throw new Error('Failed to fetch');
            return await res.json();
        } catch {
            return { notifications: [], unreadCount: 0 };
        }
    },

    async markAsRead(notificationId: string): Promise<void> {
        await fetch(`${API_URL}/${notificationId}/read`, { method: 'PUT' });
    },

    async markAllAsRead(userId: string): Promise<void> {
        await fetch(`${API_URL}/read-all/${userId}`, { method: 'PUT' });
    },

    async deleteNotification(notificationId: string): Promise<void> {
        await fetch(`${API_URL}/${notificationId}`, { method: 'DELETE' });
    },

    async createNotification(data: Partial<Notification>): Promise<Notification | null> {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch {
            return null;
        }
    }
};
