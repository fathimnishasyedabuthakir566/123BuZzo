import { useState, useEffect } from 'react';
import { socketService } from '@/services/socketService';
import { notificationService } from '@/services/notificationService';
import { savedRouteService, type SavedRoute } from '@/services/savedRouteService';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

export const useProximityAlerts = () => {
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
    const [notifiedBuses, setNotifiedBuses] = useState<Set<string>>(new Set());

    useEffect(() => {
        const init = async () => {
            const user = await authService.getCurrentUser();
            if (!user) return;
            const uid = user.id || user._id || '';
            
            const routes = await savedRouteService.getRoutes(uid);
            setSavedRoutes(routes.filter(r => r.notifyOnApproach));

            // Start Geolocation watch
            if ('geolocation' in navigator) {
                const watchId = navigator.geolocation.watchPosition(
                    (pos) => {
                        setUserLocation({
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude
                        });
                    },
                    (err) => console.error('Geolocation error:', err),
                    { enableHighAccuracy: true }
                );
                return () => navigator.geolocation.clearWatch(watchId);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (!userLocation || savedRoutes.length === 0) return;

        // Connect to location updates
        socketService.connect();
        socketService.subscribeToLocation((data) => {
            // Check if any bus is near the user's saved route start/end or current location
            savedRoutes.forEach(async (route) => {
                if (!route.notifyOnApproach) return;

                // Simple check: is this bus on the route?
                // For now, we'll just check if the bus is within 500m of the user's location
                // and if the bus's route matches the saved route's name or endpoints.
                const dist = calculateDistance(userLocation.lat, userLocation.lng, data.lat, data.lng);
                
                if (dist < (route.notifyRadius || 500) / 1000) { // dist in km
                    const busId = data.busId || data.routeId;
                    if (!notifiedBuses.has(`${route._id}_${busId}`)) {
                        // Trigger notification
                        toast.info(`Bus ${data.busNumber || 'Alert'} is approaching your location!`, {
                            description: `Incoming bus is within ${Math.round(dist * 1000)}m.`,
                            duration: 10000,
                        });

                        // Log to system notifications
                        const user = await authService.getCurrentUser();
                        if (user) {
                            await notificationService.createNotification({
                                userId: user.id || user._id,
                                title: 'Proximity Alert',
                                message: `Bus ${data.busNumber || ''} is near your saved route: ${route.name}`,
                                type: 'proximity',
                                priority: 'high'
                            });
                        }

                        setNotifiedBuses(prev => new Set(prev).add(`${route._id}_${busId}`));
                    }
                }
            });
        });

        return () => socketService.unsubscribeFromLocation();
    }, [userLocation, savedRoutes, notifiedBuses]);

    // Haversine distance formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    const deg2rad = (deg: number) => deg * (Math.PI / 180);

    return { userLocation };
};
