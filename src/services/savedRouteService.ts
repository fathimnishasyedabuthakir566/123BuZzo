const API_URL = '/api/saved-routes';

export interface SavedRoute {
    _id: string;
    userId: string;
    name: string;
    fromStop: string;
    toStop: string;
    fromLat?: number;
    fromLng?: number;
    toLat?: number;
    toLng?: number;
    notifyOnApproach: boolean;
    notifyRadius: number;
    isActive: boolean;
    createdAt: string;
}

export const savedRouteService = {
    async getRoutes(userId: string): Promise<SavedRoute[]> {
        try {
            const res = await fetch(`${API_URL}/${userId}`);
            if (!res.ok) throw new Error('Failed');
            return await res.json();
        } catch {
            return [];
        }
    },

    async createRoute(data: Partial<SavedRoute>): Promise<SavedRoute | null> {
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

    async updateRoute(id: string, data: Partial<SavedRoute>): Promise<SavedRoute | null> {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed');
            return await res.json();
        } catch {
            return null;
        }
    },

    async deleteRoute(id: string): Promise<boolean> {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            return res.ok;
        } catch {
            return false;
        }
    }
};
