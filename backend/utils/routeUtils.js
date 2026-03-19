// Helper to calculate distance between two coordinates in KM
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};

// Function to find nearest, current and next stops
const calculateStops = (currentLat, currentLng, stops) => {
    if (!stops || stops.length === 0) return { currentStop: null, nextStop: null };

    let nearestStopIndex = -1;
    let minDistance = Infinity;

    // Find the nearest stop
    stops.forEach((stop, index) => {
        const dist = getDistance(currentLat, currentLng, stop.lat, stop.lng);
        if (dist < minDistance) {
            minDistance = dist;
            nearestStopIndex = index;
        }
    });

    const nearestStop = stops[nearestStopIndex];

    // Simple logic:
    // If distance to nearest stop is small (< 0.5km), consider the bus AT that stop or just passed it.
    // Last Passed Stop is the nearest stop (if we assume the bus has reached it)
    // Next Stop is the one with order + 1

    let lastPassed = nearestStop.name;
    let next = "Destination";

    // Find the stop with order immediately after the nearest stop's order
    const nextStopObj = stops.find(s => s.order === nearestStop.order + 1);
    if (nextStopObj) {
        next = nextStopObj.name;
    } else if (nearestStop.order === Math.max(...stops.map(s => s.order))) {
        // We are at the last stop
        next = "Trip Completed";
    }

    return {
        currentStop: lastPassed,
        nextStop: next
    };
};

// Function to calculate Smart ETA based on distance, speed, and real-time traffic factors
const calculateSmartETA = (distanceKm, speedKph) => {
    if (!distanceKm || distanceKm <= 0) return "Arriving";
    
    // Base time in hours
    let baseTimeHours = distanceKm / (speedKph || 40); // Default to 40kph if no speed
    
    // --- Traffic Analysis Simulation (AI) ---
    const now = new Date();
    const hour = now.getHours();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    
    let trafficMultiplier = 1.0;
    
    // Peak hours in Tirunelveli (approximate)
    if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
        trafficMultiplier = isWeekend ? 1.3 : 1.8; // Heavy traffic
    } else if (hour >= 10 && hour <= 16) {
        trafficMultiplier = 1.2; // Moderate midday traffic
    } else if (hour >= 22 || hour <= 5) {
        trafficMultiplier = 0.8; // Night time - faster!
    }
    
    // Random "Road Factor" (Construction, minor delays)
    const roadFactor = 0.9 + (Math.random() * 0.4); // 0.9 to 1.3
    
    const finalMinutes = Math.round(baseTimeHours * 60 * trafficMultiplier * roadFactor);
    
    if (finalMinutes < 1) return "Less than 1 min";
    if (finalMinutes < 60) return `${finalMinutes} mins`;
    
    const h = Math.floor(finalMinutes / 60);
    const m = finalMinutes % 60;
    return `${h}h ${m}m`;
};

module.exports = { calculateStops, calculateSmartETA, getDistance };
