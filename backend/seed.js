const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Bus = require('./models/busModel');

dotenv.config({ path: path.join(__dirname, '.env') });

// ============================================================
//  TIRUNELVELI OMNI BUS STAND — COMPLETE SEED DATA
//  59 buses total | 5 platforms | 10-19 buses per platform
// ============================================================

// Intermediate stop coordinates for each major route
const stopCoords = {
  Tirunelveli:   { lat: 8.7139, lng: 77.7567 },
  Nagercoil:     { lat: 8.1833, lng: 77.4119 },
  Kanyakumari:   { lat: 8.0883, lng: 77.5385 },
  Nanguneri:     { lat: 8.4897, lng: 77.6617 },
  Valliyur:      { lat: 8.3847, lng: 77.6167 },
  Madurai:       { lat: 9.9252, lng: 78.1198 },
  Kovilpatti:    { lat: 9.1760, lng: 77.8643 },
  Virudhunagar:  { lat: 9.5810, lng: 77.9622 },
  Thoothukudi:   { lat: 8.8049, lng: 78.1460 },
  Vagaikulam:    { lat: 8.7246, lng: 77.9392 },
  Tiruchendur:   { lat: 8.4965, lng: 78.1270 },
  Srivaikuntam:  { lat: 8.6296, lng: 77.9148 },
  Tenkasi:       { lat: 8.9591, lng: 77.3115 },
  Alangulam:     { lat: 8.8711, lng: 77.5029 },
  Pavoorchatram: { lat: 8.9075, lng: 77.3683 },
  Chennai:       { lat: 13.0827, lng: 80.2707 },
  Trichy:        { lat: 10.7905, lng: 78.7047 },
  Coimbatore:    { lat: 11.0168, lng: 76.9558 },
  Palakkad:      { lat: 10.7867, lng: 76.6548 },
  Courtallam:    { lat: 8.9368, lng: 77.2714 },
  Kollam:        { lat: 8.8932, lng: 76.6141 },
  Trivandrum:    { lat: 8.5241, lng: 76.9366 },
  Rajapalayam:   { lat: 9.4530, lng: 77.5575 },
  Sankarankovil: { lat: 9.1691, lng: 77.5444 },
  Puliyangudi:   { lat: 9.1729, lng: 77.3958 },
  Kadayanallur:  { lat: 9.0766, lng: 77.3486 },
  Sivakasi:      { lat: 9.4536, lng: 77.8004 },
  Salem:         { lat: 11.6643, lng: 78.1460 },
  Ooty:          { lat: 11.4102, lng: 76.6950 },
  Rameshwaram:   { lat: 9.2882, lng: 79.3129 },
  Rameswaram:    { lat: 9.2882, lng: 79.3129 },
  Kumbakonam:    { lat: 10.9634, lng: 79.3788 },
};

function stops(...names) {
  return names.map((name, i) => ({
    name,
    lat: (stopCoords[name] || { lat: 8.7 + i * 0.1, lng: 77.7 + i * 0.1 }).lat,
    lng: (stopCoords[name] || { lat: 8.7 + i * 0.1, lng: 77.7 + i * 0.1 }).lng,
    order: i + 1,
  }));
}

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rndInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rndTime(startH, endH) {
  const h = rndInt(startH, endH);
  const m = rnd([0, 15, 30, 45]);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

const statuses = ['active', 'on-route', 'delayed', 'inactive'];
const crowds   = ['low', 'medium', 'high', 'full'];
const depots   = ['Ranithottam', 'Thoothukudi City', 'Kanyakumari', 'Madurai Central', 'Chennai CMBT'];

// ============================================================
//  PLATFORM 1 — Nagercoil & Kanyakumari routes (10 buses)
// ============================================================
const platform1 = [
  {
    name: 'Nagercoil Direct',
    busNumber: 'TN 72 P1 1001',
    routeFrom: 'Tirunelveli', routeTo: 'Nagercoil',
    scheduledTime: ['05:40', '08:20'],
    platformNumber: 1, busType: 'Mofussil', serviceType: 'Ordinary',
    depot: 'Ranithottam', capacity: 45, ac: false,
    status: 'active', intermediateStops: stops('Tirunelveli','Nanguneri','Valliyur','Nagercoil'),
  },
  {
    name: 'Nagercoil AC Express',
    busNumber: 'TN 72 P1 1002',
    routeFrom: 'Tirunelveli', routeTo: 'Nagercoil',
    scheduledTime: ['09:00', '12:00'],
    platformNumber: 1, busType: 'AC', serviceType: 'EAC',
    depot: 'Ranithottam', capacity: 40, ac: true,
    status: 'on-route', intermediateStops: stops('Tirunelveli','Nanguneri','Nagercoil'),
  },
  {
    name: 'Kanyakumari Deluxe',
    busNumber: 'TN 72 P1 1003',
    routeFrom: 'Tirunelveli', routeTo: 'Kanyakumari',
    scheduledTime: ['06:00', '09:30'],
    platformNumber: 1, busType: 'Deluxe', serviceType: 'Express',
    depot: 'Kanyakumari', capacity: 55, ac: false,
    status: 'on-route', intermediateStops: stops('Tirunelveli','Nanguneri','Valliyur','Nagercoil','Kanyakumari'),
  },
  {
    name: 'Kanyakumari BPR',
    busNumber: 'TN 72 P1 1004',
    routeFrom: 'Tirunelveli', routeTo: 'Kanyakumari',
    scheduledTime: ['07:30', '11:00'],
    platformNumber: 1, busType: 'Express', serviceType: 'BPR',
    depot: 'Kanyakumari', capacity: 50, ac: false,
    status: 'delayed', intermediateStops: stops('Tirunelveli','Valliyur','Kanyakumari'),
  },
  {
    name: 'Nagercoil Night Express',
    busNumber: 'TN 72 P1 1005',
    routeFrom: 'Tirunelveli', routeTo: 'Nagercoil',
    scheduledTime: ['21:00', '23:30'],
    platformNumber: 1, busType: 'Express', serviceType: 'Special',
    depot: 'Ranithottam', capacity: 50, ac: false,
    status: 'inactive', intermediateStops: stops('Tirunelveli','Nanguneri','Nagercoil'),
  },
  {
    name: 'Trivandrum Via Nagercoil',
    busNumber: 'TN 72 P1 1006',
    routeFrom: 'Tirunelveli', routeTo: 'Trivandrum',
    scheduledTime: ['08:00', '14:00'],
    platformNumber: 1, busType: 'Deluxe', serviceType: 'Express',
    depot: 'Ranithottam', capacity: 50, ac: false,
    status: 'active', intermediateStops: stops('Tirunelveli','Nagercoil','Kollam','Trivandrum'),
  },
  {
    name: 'Kollam Express',
    busNumber: 'TN 72 P1 1007',
    routeFrom: 'Tirunelveli', routeTo: 'Kollam',
    scheduledTime: ['10:30', '15:30'],
    platformNumber: 1, busType: 'Mofussil', serviceType: 'Ordinary',
    depot: 'Ranithottam', capacity: 45, ac: false,
    status: 'on-route', intermediateStops: stops('Tirunelveli','Nagercoil','Kollam'),
  },
  {
    name: 'Nagercoil Ultra Deluxe',
    busNumber: 'TN 72 P1 1008',
    routeFrom: 'Tirunelveli', routeTo: 'Nagercoil',
    scheduledTime: ['13:00', '15:30'],
    platformNumber: 1, busType: 'Ultra Deluxe', serviceType: '1to1',
    depot: 'Ranithottam', capacity: 36, ac: true,
    status: 'active', intermediateStops: stops('Tirunelveli','Nanguneri','Nagercoil'),
  },
  {
    name: 'Kanyakumari SFS',
    busNumber: 'TN 72 P1 1009',
    routeFrom: 'Tirunelveli', routeTo: 'Kanyakumari',
    scheduledTime: ['14:00', '17:30'],
    platformNumber: 1, busType: 'SFS', serviceType: 'Special',
    depot: 'Kanyakumari', capacity: 42, ac: true,
    status: 'delayed', intermediateStops: stops('Tirunelveli','Valliyur','Kanyakumari'),
  },
  {
    name: 'Nagercoil Town Bus',
    busNumber: 'TN 72 P1 1010',
    routeFrom: 'Tirunelveli', routeTo: 'Nagercoil',
    scheduledTime: ['17:30', '20:00'],
    platformNumber: 1, busType: 'Town Bus', serviceType: 'Ordinary',
    depot: 'Ranithottam', capacity: 60, ac: false,
    status: 'inactive', intermediateStops: stops('Tirunelveli','Nanguneri','Valliyur','Nagercoil'),
  },
];

// ============================================================
//  PLATFORM 2 — Tiruchendur & Thoothukudi routes (10 buses)
// ============================================================
const platform2 = [
  {
    name: 'Tiruchendur BPR',
    busNumber: 'TN 72 P2 2001',
    routeFrom: 'Tirunelveli', routeTo: 'Tiruchendur',
    scheduledTime: ['05:30', '07:00'],
    platformNumber: 2, busType: 'Mofussil', serviceType: 'BPR',
    depot: 'Tiruchendur', capacity: 45, ac: false,
    status: 'active', intermediateStops: stops('Tirunelveli','Srivaikuntam','Tiruchendur'),
  },
  {
    name: 'Tiruchendur Temple Express',
    busNumber: 'TN 72 P2 2002',
    routeFrom: 'Tirunelveli', routeTo: 'Tiruchendur',
    scheduledTime: ['08:00', '09:30'],
    platformNumber: 2, busType: 'Express', serviceType: 'Express',
    depot: 'Tiruchendur', capacity: 50, ac: false,
    status: 'on-route', intermediateStops: stops('Tirunelveli','Srivaikuntam','Tiruchendur'),
  },
  {
    name: 'Thoothukudi Direct',
    busNumber: 'TN 72 P2 2003',
    routeFrom: 'Tirunelveli', routeTo: 'Thoothukudi',
    scheduledTime: ['05:00', '06:00'],
    platformNumber: 2, busType: 'Mofussil', serviceType: 'Ordinary',
    depot: 'Thoothukudi City', capacity: 45, ac: false,
    status: 'on-route', intermediateStops: stops('Tirunelveli','Vagaikulam','Thoothukudi'),
  },
  {
    name: 'Thoothukudi AC Seater',
    busNumber: 'TN 72 P2 2004',
    routeFrom: 'Tirunelveli', routeTo: 'Thoothukudi',
    scheduledTime: ['10:00', '11:15'],
    platformNumber: 2, busType: 'AC', serviceType: 'EAC',
    depot: 'Thoothukudi City', capacity: 40, ac: true,
    status: 'active', intermediateStops: stops('Tirunelveli','Vagaikulam','Thoothukudi'),
  },
  {
    name: 'Thoothukudi Ultra Deluxe',
    busNumber: 'TN 72 P2 2005',
    routeFrom: 'Tirunelveli', routeTo: 'Thoothukudi',
    scheduledTime: ['14:30', '15:45'],
    platformNumber: 2, busType: 'Ultra Deluxe', serviceType: '1to1',
    depot: 'Thoothukudi City', capacity: 36, ac: true,
    status: 'delayed', intermediateStops: stops('Tirunelveli','Vagaikulam','Thoothukudi'),
  },
  {
    name: 'Tiruchendur Night Service',
    busNumber: 'TN 72 P2 2006',
    routeFrom: 'Tirunelveli', routeTo: 'Tiruchendur',
    scheduledTime: ['20:00', '21:30'],
    platformNumber: 2, busType: 'Mofussil', serviceType: 'Ordinary',
    depot: 'Tiruchendur', capacity: 45, ac: false,
    status: 'inactive', intermediateStops: stops('Tirunelveli','Srivaikuntam','Tiruchendur'),
  },
  {
    name: 'Srivaikuntam Local',
    busNumber: 'TN 72 P2 2007',
    routeFrom: 'Tirunelveli', routeTo: 'Srivaikuntam',
    scheduledTime: ['07:00', '08:00'],
    platformNumber: 2, busType: 'Town Bus', serviceType: 'Ordinary',
    depot: 'Thoothukudi City', capacity: 60, ac: false,
    status: 'active', intermediateStops: stops('Tirunelveli','Seithunganallur','Srivaikuntam'),
  },
  {
    name: 'Thoothukudi Port Express',
    busNumber: 'TN 72 P2 2008',
    routeFrom: 'Tirunelveli', routeTo: 'Thoothukudi',
    scheduledTime: ['06:30', '07:45'],
    platformNumber: 2, busType: 'Express', serviceType: 'Special',
    depot: 'Thoothukudi City', capacity: 50, ac: false,
    status: 'on-route', intermediateStops: stops('Tirunelveli','Vagaikulam','Thoothukudi'),
  },
  {
    name: 'Tiruchendur Deluxe',
    busNumber: 'TN 72 P2 2009',
    routeFrom: 'Tirunelveli', routeTo: 'Tiruchendur',
    scheduledTime: ['12:00', '13:30'],
    platformNumber: 2, busType: 'Deluxe', serviceType: 'Express',
    depot: 'Tiruchendur', capacity: 55, ac: false,
    status: 'delayed', intermediateStops: stops('Tirunelveli','Srivaikuntam','Tiruchendur'),
  },
  {
    name: 'Thoothukudi SFS',
    busNumber: 'TN 72 P2 2010',
    routeFrom: 'Tirunelveli', routeTo: 'Thoothukudi',
    scheduledTime: ['18:00', '19:15'],
    platformNumber: 2, busType: 'SFS', serviceType: 'Special',
    depot: 'Thoothukudi City', capacity: 42, ac: true,
    status: 'inactive', intermediateStops: stops('Tirunelveli','Vagaikulam','Thoothukudi'),
  },
];

// ============================================================
//  PLATFORM 3 — Madurai & Virudhunagar routes (10 buses)
// ============================================================
const platform3 = [
  {
    name: 'Madurai Non-Stop',
    busNumber: 'TN 72 P3 3001',
    routeFrom: 'Tirunelveli', routeTo: 'Madurai',
    scheduledTime: ['05:30', '08:00'],
    platformNumber: 3, busType: 'Express', serviceType: 'Express',
    depot: 'Madurai Central', capacity: 50, ac: false,
    status: 'on-route', intermediateStops: stops('Tirunelveli','Kovilpatti','Virudhunagar','Madurai'),
  },
  {
    name: 'Madurai AC Super',
    busNumber: 'TN 72 P3 3002',
    routeFrom: 'Tirunelveli', routeTo: 'Madurai',
    scheduledTime: ['09:00', '12:00'],
    platformNumber: 3, busType: 'AC', serviceType: 'EAC',
    depot: 'Madurai Central', capacity: 40, ac: true,
    status: 'active', intermediateStops: stops('Tirunelveli','Kovilpatti','Madurai'),
  },
  {
    name: 'Virudhunagar Ordinary',
    busNumber: 'TN 72 P3 3003',
    routeFrom: 'Tirunelveli', routeTo: 'Virudhunagar',
    scheduledTime: ['06:45', '09:00'],
    platformNumber: 3, busType: 'Mofussil', serviceType: 'Ordinary',
    depot: 'Madurai Central', capacity: 45, ac: false,
    status: 'active', intermediateStops: stops('Tirunelveli','Kovilpatti','Virudhunagar'),
  },
  {
    name: 'Rajapalayam Fast',
    busNumber: 'TN 72 P3 3004',
    routeFrom: 'Tirunelveli', routeTo: 'Rajapalayam',
    scheduledTime: ['07:30', '09:30'],
    platformNumber: 3, busType: 'Express', serviceType: 'BPR',
    depot: 'Madurai Central', capacity: 50, ac: false,
    status: 'delayed', intermediateStops: stops('Tirunelveli','Sankarankovil','Rajapalayam'),
  },
  {
    name: 'Sivakasi Fireworks Express',
    busNumber: 'TN 72 P3 3005',
    routeFrom: 'Tirunelveli', routeTo: 'Sivakasi',
    scheduledTime: ['08:15', '11:00'],
    platformNumber: 3, busType: 'Mofussil', serviceType: 'Ordinary',
    depot: 'Madurai Central', capacity: 45, ac: false,
    status: 'on-route', intermediateStops: stops('Tirunelveli','Sankarankovil','Sivakasi'),
  },
  {
    name: 'Madurai Ultra Deluxe',
    busNumber: 'TN 72 P3 3006',
    routeFrom: 'Tirunelveli', routeTo: 'Madurai',
    scheduledTime: ['12:00', '15:00'],
    platformNumber: 3, busType: 'Ultra Deluxe', serviceType: '1to1',
    depot: 'Madurai Central', capacity: 36, ac: true,
    status: 'active', intermediateStops: stops('Tirunelveli','Kovilpatti','Madurai'),
  },
  {
    name: 'Sankarankovil Local',
    busNumber: 'TN 72 P3 3007',
    routeFrom: 'Tirunelveli', routeTo: 'Sankarankovil',
    scheduledTime: ['10:00', '12:00'],
    platformNumber: 3, busType: 'Town Bus', serviceType: 'Ordinary',
    depot: 'Madurai Central', capacity: 60, ac: false,
    status: 'inactive', intermediateStops: stops('Tirunelveli','Manur','Devarkulam','Sankarankovil'),
  },
  {
    name: 'Kovilpatti Mofussil',
    busNumber: 'TN 72 P3 3008',
    routeFrom: 'Tirunelveli', routeTo: 'Kovilpatti',
    scheduledTime: ['13:30', '15:30'],
    platformNumber: 3, busType: 'Mofussil', serviceType: 'Ordinary',
    depot: 'Madurai Central', capacity: 45, ac: false,
    status: 'on-route', intermediateStops: stops('Tirunelveli','Kayathar','Kovilpatti'),
  },
  {
    name: 'Madurai Night Rider',
    busNumber: 'TN 72 P3 3009',
    routeFrom: 'Tirunelveli', routeTo: 'Madurai',
    scheduledTime: ['22:00', '01:00'],
    platformNumber: 3, busType: 'Deluxe', serviceType: 'Special',
    depot: 'Madurai Central', capacity: 55, ac: false,
    status: 'inactive', intermediateStops: stops('Tirunelveli','Kovilpatti','Virudhunagar','Madurai'),
  },
  {
    name: 'Virudhunagar SFS',
    busNumber: 'TN 72 P3 3010',
    routeFrom: 'Tirunelveli', routeTo: 'Virudhunagar',
    scheduledTime: ['16:00', '18:30'],
    platformNumber: 3, busType: 'SFS', serviceType: 'Special',
    depot: 'Madurai Central', capacity: 42, ac: true,
    status: 'delayed', intermediateStops: stops('Tirunelveli','Kovilpatti','Virudhunagar'),
  },
];

// ============================================================
//  PLATFORM 4 — Tenkasi, Courtallam & Inter-State routes (19 buses)
// ============================================================
const platform4 = [
  {
    name: 'Tenkasi Ordinary',
    busNumber: 'TN 72 P4 4001',
    routeFrom: 'Tirunelveli', routeTo: 'Tenkasi',
    scheduledTime: ['06:00', '08:00'],
    platformNumber: 4, busType: 'Mofussil', serviceType: 'Ordinary',
    depot: 'Ranithottam', capacity: 45, ac: false,
    status: 'active', intermediateStops: stops('Tirunelveli','Alangulam','Pavoorchatram','Tenkasi'),
  },
  {
    name: 'Courtallam Waterfalls Express',
    busNumber: 'TN 72 P4 4002',
    routeFrom: 'Tirunelveli', routeTo: 'Courtallam',
    scheduledTime: ['07:00', '09:00'],
    platformNumber: 4, busType: 'Express', serviceType: 'Special',
    depot: 'Ranithottam', capacity: 50, ac: false,
    status: 'on-route', intermediateStops: stops('Tirunelveli','Tenkasi','Courtallam'),
  },
  {
    name: 'Coimbatore Via Tenkasi',
    busNumber: 'TN 72 P4 4003',
    routeFrom: 'Tirunelveli', routeTo: 'Coimbatore',
    scheduledTime: ['08:00', '14:00'],
    platformNumber: 4, busType: 'Deluxe', serviceType: 'Express',
    depot: 'Ranithottam', capacity: 55, ac: false,
    status: 'delayed', intermediateStops: stops('Tirunelveli','Tenkasi','Coimbatore'),
  },
  {
    name: 'Ooty Hill Queen',
    busNumber: 'TN 72 P4 4004',
    routeFrom: 'Tirunelveli', routeTo: 'Ooty',
    scheduledTime: ['09:30', '17:00'],
    platformNumber: 4, busType: 'Ultra Deluxe', serviceType: '1to1',
    depot: 'Ranithottam', capacity: 36, ac: true,
    status: 'active', intermediateStops: stops('Tirunelveli','Tenkasi','Coimbatore','Ooty'),
  },
  {
    name: 'Tenkasi BPR',
    busNumber: 'TN 72 P4 4005',
    routeFrom: 'Tirunelveli', routeTo: 'Tenkasi',
    scheduledTime: ['11:00', '13:00'],
    platformNumber: 4, busType: 'Mofussil', serviceType: 'BPR',
    depot: 'Ranithottam', capacity: 45, ac: false,
    status: 'on-route', intermediateStops: stops('Tirunelveli','Alangulam','Tenkasi'),
  },
  {
    name: 'Alangulam Local',
    busNumber: 'TN 72 P4 4006',
    routeFrom: 'Tirunelveli', routeTo: 'Alangulam',
    scheduledTime: ['10:00', '11:30'],
    platformNumber: 4, busType: 'Town Bus', serviceType: 'Ordinary',
    depot: 'Ranithottam', capacity: 60, ac: false,
    status: 'inactive', intermediateStops: stops('Tirunelveli','Maranthai','Alangulam'),
  },
  {
    name: 'Courtallam Season Special',
    busNumber: 'TN 72 P4 4007',
    routeFrom: 'Tirunelveli', routeTo: 'Courtallam',
    scheduledTime: ['14:00', '16:00'],
    platformNumber: 4, busType: 'Express', serviceType: 'Special',
    depot: 'Ranithottam', capacity: 50, ac: false,
    status: 'active', intermediateStops: stops('Tirunelveli','Tenkasi','Courtallam'),
  },
  {
    name: 'Coimbatore AC Star',
    busNumber: 'TN 72 P4 4008',
    routeFrom: 'Tirunelveli', routeTo: 'Coimbatore',
    scheduledTime: ['18:00', '00:00'],
    platformNumber: 4, busType: 'AC', serviceType: 'EAC',
    depot: 'Ranithottam', capacity: 40, ac: true,
    status: 'delayed', intermediateStops: stops('Tirunelveli','Tenkasi','Palakkad','Coimbatore'),
  },
  {
    name: 'Pavoorchatram Ordinary',
    busNumber: 'TN 72 P4 4009',
    routeFrom: 'Tirunelveli', routeTo: 'Pavoorchatram',
    scheduledTime: ['16:30', '18:00'],
    platformNumber: 4, busType: 'Mofussil', serviceType: 'Ordinary',
    depot: 'Ranithottam', capacity: 45, ac: false,
    status: 'on-route', intermediateStops: stops('Tirunelveli','Alangulam','Pavoorchatram'),
  },
  {
    name: 'Tenkasi Night Rider',
    busNumber: 'TN 72 P4 4010',
    routeFrom: 'Tirunelveli', routeTo: 'Tenkasi',
    scheduledTime: ['21:30', '23:30'],
    platformNumber: 4, busType: 'Mofussil', serviceType: 'Ordinary',
    depot: 'Ranithottam', capacity: 45, ac: false,
    status: 'inactive', intermediateStops: stops('Tirunelveli','Alangulam','Pavoorchatram','Tenkasi'),
  },
  {
    name: 'TNSTC Ordinary',
    busNumber: 'TN-74E5490',
    routeFrom: 'Sankarankovil', routeTo: 'Tenkasi',
    scheduledTime: ['04:30', '06:00'],
    platformNumber: 4, busType: 'Mofussil', serviceType: 'Ordinary',
    depot: 'Sankarankovil', capacity: 60, ac: false,
    status: 'active', intermediateStops: stops('Sankarankovil','Puliyangudi','Kadayanallur','Tenkasi'),
  },
  {
    name: 'TNSTC Ordinary',
    busNumber: 'TN-74E5490',
    routeFrom: 'Sankarankovil', routeTo: 'Tenkasi',
    scheduledTime: ['05:20', '06:50'],
    platformNumber: 4, busType: 'Mofussil', serviceType: 'Ordinary',
    depot: 'Sankarankovil', capacity: 60, ac: false,
    status: 'on-route', intermediateStops: stops('Sankarankovil','Puliyangudi','Kadayanallur','Tenkasi'),
  },
  {
    name: 'TNSTC Ordinary',
    busNumber: 'TN-74E5490',
    routeFrom: 'Sankarankovil', routeTo: 'Tenkasi',
    scheduledTime: ['05:45', '07:15'],
    platformNumber: 4, busType: 'Mofussil', serviceType: 'Ordinary',
    depot: 'Sankarankovil', capacity: 60, ac: false,
    status: 'active', intermediateStops: stops('Sankarankovil','Puliyangudi','Kadayanallur','Tenkasi'),
  },
  {
    name: 'TNSTC Ordinary',
    busNumber: 'TN-74E5490',
    routeFrom: 'Sankarankovil', routeTo: 'Tenkasi',
    scheduledTime: ['08:35', '10:05'],
    platformNumber: 4, busType: 'Mofussil', serviceType: 'Ordinary',
    depot: 'Sankarankovil', capacity: 60, ac: false,
    status: 'delayed', intermediateStops: stops('Sankarankovil','Puliyangudi','Kadayanallur','Tenkasi'),
  },
  {
    name: 'TNSTC Ordinary',
    busNumber: 'TN-74E5490',
    routeFrom: 'Sankarankovil', routeTo: 'Tenkasi',
    scheduledTime: ['10:00', '11:30'],
    platformNumber: 4, busType: 'Mofussil', serviceType: 'Ordinary',
    depot: 'Sankarankovil', capacity: 60, ac: false,
    status: 'active', intermediateStops: stops('Sankarankovil','Puliyangudi','Kadayanallur','Tenkasi'),
  },
  {
    name: 'TNSTC Ordinary',
    busNumber: 'TN-74E5490',
    routeFrom: 'Sankarankovil', routeTo: 'Tenkasi',
    scheduledTime: ['13:15', '14:45'],
    platformNumber: 4, busType: 'Mofussil', serviceType: 'Ordinary',
    depot: 'Sankarankovil', capacity: 60, ac: false,
    status: 'on-route', intermediateStops: stops('Sankarankovil','Puliyangudi','Kadayanallur','Tenkasi'),
  },
  {
    name: 'TNSTC Ordinary',
    busNumber: 'TN-74E5490',
    routeFrom: 'Sankarankovil', routeTo: 'Tenkasi',
    scheduledTime: ['16:10', '17:40'],
    platformNumber: 4, busType: 'Mofussil', serviceType: 'Ordinary',
    depot: 'Sankarankovil', capacity: 60, ac: false,
    status: 'delayed', intermediateStops: stops('Sankarankovil','Puliyangudi','Kadayanallur','Tenkasi'),
  },
  {
    name: 'TNSTC Ordinary',
    busNumber: 'TN-74E5490',
    routeFrom: 'Sankarankovil', routeTo: 'Tenkasi',
    scheduledTime: ['16:40', '18:10'],
    platformNumber: 4, busType: 'Mofussil', serviceType: 'Ordinary',
    depot: 'Sankarankovil', capacity: 60, ac: false,
    status: 'active', intermediateStops: stops('Sankarankovil','Puliyangudi','Kadayanallur','Tenkasi'),
  },
  {
    name: 'TNSTC Ordinary',
    busNumber: 'TN-74E5490',
    routeFrom: 'Sankarankovil', routeTo: 'Tenkasi',
    scheduledTime: ['20:20', '21:50'],
    platformNumber: 4, busType: 'Mofussil', serviceType: 'Ordinary',
    depot: 'Sankarankovil', capacity: 60, ac: false,
    status: 'inactive', intermediateStops: stops('Sankarankovil','Puliyangudi','Kadayanallur','Tenkasi'),
  },
];

// ============================================================
//  PLATFORM 5 — Chennai, Trichy, Salem & Long-Distance (10 buses)
// ============================================================
const platform5 = [
  {
    name: 'Chennai Super Express',
    busNumber: 'TN 72 P5 5001',
    routeFrom: 'Tirunelveli', routeTo: 'Chennai',
    scheduledTime: ['18:00', '06:00'],
    platformNumber: 5, busType: 'Ultra Deluxe', serviceType: '1to1',
    depot: 'Chennai CMBT', capacity: 36, ac: true,
    status: 'active', intermediateStops: stops('Tirunelveli','Madurai','Trichy','Chennai'),
  },
  {
    name: 'Chennai AC Sleeper',
    busNumber: 'TN 72 P5 5002',
    routeFrom: 'Tirunelveli', routeTo: 'Chennai',
    scheduledTime: ['20:00', '08:00'],
    platformNumber: 5, busType: 'AC', serviceType: 'EAC',
    depot: 'Chennai CMBT', capacity: 40, ac: true,
    status: 'on-route', intermediateStops: stops('Tirunelveli','Madurai','Trichy','Kumbakonam','Chennai'),
  },
  {
    name: 'Trichy Express',
    busNumber: 'TN 72 P5 5003',
    routeFrom: 'Tirunelveli', routeTo: 'Trichy',
    scheduledTime: ['06:00', '12:30'],
    platformNumber: 5, busType: 'Express', serviceType: 'Express',
    depot: 'Chennai CMBT', capacity: 50, ac: false,
    status: 'active', intermediateStops: stops('Tirunelveli','Madurai','Trichy'),
  },
  {
    name: 'Salem Via Madurai',
    busNumber: 'TN 72 P5 5004',
    routeFrom: 'Tirunelveli', routeTo: 'Salem',
    scheduledTime: ['07:30', '15:00'],
    platformNumber: 5, busType: 'Deluxe', serviceType: 'Express',
    depot: 'Chennai CMBT', capacity: 55, ac: false,
    status: 'delayed', intermediateStops: stops('Tirunelveli','Madurai','Trichy','Salem'),
  },
  {
    name: 'Rameshwaram Pilgrim',
    busNumber: 'TN 72 P5 5005',
    routeFrom: 'Tirunelveli', routeTo: 'Rameshwaram',
    scheduledTime: ['05:00', '12:00'],
    platformNumber: 5, busType: 'Express', serviceType: 'Special',
    depot: 'Madurai Central', capacity: 50, ac: false,
    status: 'on-route', intermediateStops: stops('Tirunelveli','Kovilpatti','Madurai','Rameshwaram'),
  },
  {
    name: 'Chennai Night King',
    busNumber: 'TN 72 P5 5006',
    routeFrom: 'Tirunelveli', routeTo: 'Chennai',
    scheduledTime: ['21:30', '09:00'],
    platformNumber: 5, busType: 'SFS', serviceType: 'Special',
    depot: 'Chennai CMBT', capacity: 42, ac: true,
    status: 'inactive', intermediateStops: stops('Tirunelveli','Madurai','Trichy','Chennai'),
  },
  {
    name: 'Trichy Deluxe Night',
    busNumber: 'TN 72 P5 5007',
    routeFrom: 'Tirunelveli', routeTo: 'Trichy',
    scheduledTime: ['22:00', '04:30'],
    platformNumber: 5, busType: 'Deluxe', serviceType: 'Express',
    depot: 'Chennai CMBT', capacity: 55, ac: false,
    status: 'inactive', intermediateStops: stops('Tirunelveli','Madurai','Trichy'),
  },
  {
    name: 'Kumbakonam Pilgrim',
    busNumber: 'TN 72 P5 5008',
    routeFrom: 'Tirunelveli', routeTo: 'Kumbakonam',
    scheduledTime: ['08:00', '16:00'],
    platformNumber: 5, busType: 'Mofussil', serviceType: 'Ordinary',
    depot: 'Chennai CMBT', capacity: 45, ac: false,
    status: 'on-route', intermediateStops: stops('Tirunelveli','Madurai','Trichy','Kumbakonam'),
  },
  {
    name: 'Chennai Premium AC',
    busNumber: 'TN 72 P5 5009',
    routeFrom: 'Tirunelveli', routeTo: 'Chennai',
    scheduledTime: ['17:00', '05:00'],
    platformNumber: 5, busType: 'AC', serviceType: 'EAC',
    depot: 'Chennai CMBT', capacity: 40, ac: true,
    status: 'delayed', intermediateStops: stops('Tirunelveli','Madurai','Trichy','Chennai'),
  },
  {
    name: 'Salem Night Express',
    busNumber: 'TN 72 P5 5010',
    routeFrom: 'Tirunelveli', routeTo: 'Salem',
    scheduledTime: ['20:30', '04:30'],
    platformNumber: 5, busType: 'Ultra Deluxe', serviceType: '1to1',
    depot: 'Chennai CMBT', capacity: 36, ac: true,
    status: 'active', intermediateStops: stops('Tirunelveli','Madurai','Salem'),
  },
];

// Combine all platforms = 59 buses
const ALL_BUSES = [
  ...platform1,
  ...platform2,
  ...platform3,
  ...platform4,
  ...platform5,
].map(bus => ({
  ...bus,
  // Auto-generate realistic crowd & seat data
  crowdLevel: rnd(crowds),
  availableSeats: rndInt(0, bus.capacity - 5),
  speed: (bus.status === 'active' || bus.status === 'on-route') ? rndInt(40, 80) : 0,
  isActive: bus.status === 'active' || bus.status === 'on-route',
  driverName: `Driver ${rnd(['Kumar', 'Rajan', 'Selvam', 'Murugan', 'Arjun', 'Durai', 'Senthil', 'Vijay', 'Anand', 'Karthik'])}`,
  driverPhone: `9${rndInt(600000000, 999999999)}`,
  driverRating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
  estimatedArrivalTime: `${rndInt(3, 45)} mins`,
  location: {
    lat: bus.intermediateStops[0].lat + (Math.random() - 0.5) * 0.05,
    lng: bus.intermediateStops[0].lng + (Math.random() - 0.5) * 0.05,
    lastUpdated: new Date().toISOString(),
  },
  currentStop: bus.intermediateStops[0].name,
  nextStop: bus.intermediateStops[1]?.name || bus.routeTo,
}));

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    await Bus.deleteMany();
    console.log('🗑️  Cleared existing buses');

    await Bus.insertMany(ALL_BUSES);

    // Print summary
    const total = ALL_BUSES.length;
    console.log(`\n🚌 Seeded ${total} buses across 5 platforms:\n`);
    [1, 2, 3, 4, 5].forEach(p => {
      const count = ALL_BUSES.filter(b => b.platformNumber === p).length;
      console.log(`   Platform ${p}: ${count} buses`);
    });
    console.log('\n✅ Seeding complete!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();
