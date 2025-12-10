export const mockWeather = {
    current: {
        temp: 28,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 12,
        rainfall: 0,
    },
    forecast: [
        { day: 'Mon', temp: 29, condition: 'Sunny', icon: 'sun' },
        { day: 'Tue', temp: 27, condition: 'Cloudy', icon: 'cloud' },
        { day: 'Wed', temp: 25, condition: 'Rain', icon: 'rain' },
        { day: 'Thu', temp: 26, condition: 'Partly Cloudy', icon: 'cloud-sun' },
        { day: 'Fri', temp: 28, condition: 'Sunny', icon: 'sun' },
        { day: 'Sat', temp: 30, condition: 'Sunny', icon: 'sun' },
        { day: 'Sun', temp: 29, condition: 'Cloudy', icon: 'cloud' },
    ]
};

export const mockAlerts = [
    {
        id: 1,
        type: 'High Temperature',
        value: '38°C',
        timestamp: '2023-10-25T14:30:00',
        message: 'Temperature exceeds threshold of 35°C',
        smsDelivered: true,
        emailDelivered: true,
    },
    {
        id: 2,
        type: 'Heavy Rainfall',
        value: '45mm',
        timestamp: '2023-10-24T09:15:00',
        message: 'Heavy rainfall expected in next 2 hours',
        smsDelivered: true,
        emailDelivered: false,
    },
    {
        id: 3,
        type: 'Strong Wind',
        value: '45km/h',
        timestamp: '2023-10-22T18:00:00',
        message: 'Strong winds detected, protect young crops',
        smsDelivered: false,
        emailDelivered: true,
    },
    {
        id: 4,
        type: 'Frost Warning',
        value: '2°C',
        timestamp: '2023-10-20T05:00:00',
        message: 'Frost likely tomorrow morning',
        smsDelivered: true,
        emailDelivered: true,
    },
];

export const mockCrops = [
    { id: 1, name: 'Wheat', season: 'Rabi', alertsEnabled: true },
    { id: 2, name: 'Rice', season: 'Kharif', alertsEnabled: true },
    { id: 3, name: 'Corn', season: 'Zaid', alertsEnabled: false },
];

export const mockSettings = {
    thresholds: {
        highTemp: { value: 35, enabled: true },
        lowTemp: { value: 10, enabled: true },
        rainfall: { value: 50, enabled: true },
        windSpeed: { value: 30, enabled: false },
    },
    notifications: {
        sms: true,
        email: true,
        app: true,
        language: 'English',
    },
    profile: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+91 98765 43210',
        location: 'Hyderabad, Telangana',
    }
};
