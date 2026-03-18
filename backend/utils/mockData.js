const mockBuses = [
    {
        _id: "mock-1",
        id: "mock-1",
        name: "Nellai Express",
        busNumber: "TN-72-N-1234",
        routeFrom: "Tirunelveli",
        routeTo: "Chennai",
        status: "on-time",
        capacity: 45,
        availableSeats: 12,
        ac: true,
        type: "Ultra Deluxe",
        speed: 55,
        location: { lat: 8.7139, lng: 77.7567 },
        scheduledTime: ["08:00", "20:00"],
        intermediateStops: [
            { name: "Tirunelveli", lat: 8.7139, lng: 77.7567, order: 1 },
            { name: "Madurai", lat: 9.9252, lng: 78.1198, order: 2 },
            { name: "Trichy", lat: 10.7905, lng: 78.7047, order: 3 },
            { name: "Chennai", lat: 13.0827, lng: 80.2707, order: 4 }
        ],
        currentStop: "Madurai",
        nextStop: "Trichy",
        crowdLevel: "medium",
        isActive: true
    },
    {
        _id: "mock-2",
        id: "mock-2",
        name: "Semi-Sleeper",
        busNumber: "TN-72-N-5678",
        routeFrom: "Tirunelveli",
        routeTo: "Bangalore",
        status: "delayed",
        capacity: 36,
        availableSeats: 5,
        ac: true,
        type: "AC Sleeper",
        speed: 45,
        location: { lat: 9.0, lng: 77.8 },
        scheduledTime: ["19:30"],
        intermediateStops: [
            { name: "Tirunelveli", lat: 8.7139, lng: 77.7567, order: 1 },
            { name: "Salem", lat: 11.6643, lng: 78.1460, order: 2 },
            { name: "Bangalore", lat: 12.9716, lng: 77.5946, order: 3 }
        ],
        currentStop: "Tirunelveli",
        nextStop: "Salem",
        crowdLevel: "high",
        isActive: true
    },
    {
        _id: "mock-3",
        id: "mock-3",
        name: "Town Bus 10A",
        busNumber: "TN-72-N-9999",
        routeFrom: "New Bus Stand",
        routeTo: "High Ground",
        status: "arriving",
        capacity: 50,
        availableSeats: 25,
        ac: false,
        type: "Town Bus",
        speed: 25,
        location: { lat: 8.72, lng: 77.74 },
        scheduledTime: ["06:00", "06:30", "07:00"],
        intermediateStops: [],
        currentStop: "Palayamkottai",
        nextStop: "High Ground",
        crowdLevel: "low",
        isActive: true
    }
];

const mockStats = {
    total: 35,
    active: 28,
    onRoute: 15,
    delayed: 4,
    inactive: 7
};

const mockUser = {
    _id: "mock-user-1",
    id: "mock-user-1",
    name: "Premium Tester",
    email: "test@example.com",
    role: "admin",
    phone: "9876543210",
    city: "Tirunelveli",
    profilePhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    token: "mock-jwt-token"
};

module.exports = {
    mockBuses,
    mockStats,
    mockUser
};
