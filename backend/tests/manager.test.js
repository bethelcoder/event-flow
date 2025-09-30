const request = require('supertest');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const router = require('../routes/managerRoutes'); // Adjust path to your router file
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Event = require('../models/Event');
const Venue = require('../models/Venue');
const Session = require('../models/Session');
const chat = require('../models/chat');
const { sendStaffInvite } = require('../services/emailService');
const { registerGuest } = require('../controllers/guestsController');
const { cloudinary, VenueUpload } = require('../config/cloudinary');
const path = require('path');

// Constants for routes and environment
const ROUTES = {
  HOME: '/home',
  CHAT: '/chat',
  VENUE_SELECTION: '/venue-selection',
  GUEST_INVITE: '/guest-invite',
  SEND_GUEST_INVITE: '/send-guest-invite',
  SEND_STAFF_INVITE: '/send-staff-invite',
  PROGRAM: '/program',
  MAP: '/map',
  ANNOUNCEMENTS: '/announcements',
  TASK_ASSIGNMENT: '/task_assignment',
  VENUE_UPLOAD: '/venue/upload',
  CREATE_EVENT: '/create-event',
  SELECT_VENUE: '/select-venue',
  DELETE_SESSION: '/program/:sessionID'
};
const JWT_SECRET = 'test-secret';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../models/User');
jest.mock('../models/Event');
jest.mock('../models/Venue');
jest.mock('../models/Session');
jest.mock('../models/chat');
jest.mock('../services/emailService');
jest.mock('../controllers/guestsController');
jest.mock('../config/cloudinary', () => ({
  cloudinary: {
    uploader: {
      upload_stream: jest.fn().mockImplementation((options, callback) => ({
        end: jest.fn((buffer) => callback(null, { secure_url: 'http://cloudinary.com/test', public_id: 'test-id' }))
      }))
    }
  },
  VenueUpload: {
    single: jest.fn(() => (req, res, next) => {
      if (typeof req._mockFile !== 'undefined') {
        req.file = req._mockFile;
      } else {
        req.file = { buffer: Buffer.from('test'), originalname: 'test.jpg' };
      }
      if (typeof req._mockBody !== 'undefined') {
        req.body = req._mockBody;
      } else {
        req.body = {
          name: 'Test Venue',
          address: '123 Street',
          capacity: '100',
          facilities: 'WiFi',
          city: 'Test City',
          rating: '4',
          typeofvenue: 'Conference'
        };
      }
      next();
    }),
    fields: jest.fn(() => (req, res, next) => {
      if (typeof req._mockFiles !== 'undefined') {
        req.files = req._mockFiles;
      } else {
        req.files = {
          venueImage: [{ buffer: Buffer.from('test'), originalname: 'test.jpg' }],
          mapImage: [{ buffer: Buffer.from('test-map'), originalname: 'test-map.jpg' }]
        };
      }
      if (typeof req._mockBody !== 'undefined') {
        req.body = req._mockBody;
      } else {
        req.body = {
          name: 'Test Venue',
          address: '123 Street',
          capacity: '100',
          facilities: 'WiFi',
          city: 'Test City',
          rating: '4',
          typeofvenue: 'Conference'
        };
      }
      next();
    })
  }
}));

describe('Manager Routes', () => {
  let app;

  const setupApp = () => {
    app = express();
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views')); // Adjust to your views directory
    app.use(cookieParser());
    app.use(
      session({
        secret: JWT_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }
      })
    );
    app.use((req, res, next) => {
      if (req.cookies.jwt) req.session.jwt = req.cookies.jwt;
      next();
    });
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(router); // Mount router directly as routes don't use /manager prefix
    process.env.JWT_SECRET = JWT_SECRET;
  };

  beforeEach(() => {
    setupApp();
    jest.clearAllMocks();
  });

  const setupSession = async (userId = '123') => {
    const token = 'valid-token';
    jwt.verify.mockImplementation((token, secret, callback) => {
      if (token === 'valid-token') {
        callback(null, { id: userId });
      } else {
        callback(new Error('Invalid token'), null);
      }
    });
    return token;
  };

  describe(`GET ${ROUTES.HOME}`, () => {
    test('should render manager_Home with user and event data', async () => {
      const user = { _id: '123', displayName: 'Test Manager' };
      const event = { name: 'Test Event', organizer: { id: '123' } };
      const token = await setupSession();
      User.findById.mockResolvedValue(user);
      Event.findOne.mockResolvedValue(event);
      app.response.render = function(view, options) {
        this.status(200).json({ view, options });
      };
      const response = await request(app)
        .get(ROUTES.HOME)
        .set('Cookie', [`jwt=${token}`]);
      expect(response.status).toBe(200);
      expect(response.body.view).toBe('manager_Home');
      expect(User.findById).toHaveBeenCalledWith('123');
      expect(Event.findOne).toHaveBeenCalledWith({ 'organizer.id': '123' });
    });

    test('should return 401 if no token', async () => {
      const response = await request(app).get(ROUTES.HOME);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized: No token' });
    });

    test('should return 403 if token is invalid', async () => {
      const response = await request(app)
        .get(ROUTES.HOME)
        .set('Cookie', ['jwt=invalid-token']);
      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: 'Forbidden: Invalid token' });
    });

    test('should return 500 on server error', async () => {
      const token = await setupSession();
      User.findById.mockRejectedValue(new Error('Database error'));
      const response = await request(app)
        .get(ROUTES.HOME)
        .set('Cookie', [`jwt=${token}`]);
      expect(response.status).toBe(500);
  expect(response.body).toEqual({});
    });
  });

  describe(`GET ${ROUTES.CHAT}`, () => {
    test('should render manager_chat with user, messages, and senders', async () => {
      const user = { _id: '123', displayName: 'Test Manager' };
      const chatDoc = {
        managerId: '123',
        messages: [
          { senderId: '456', content: 'Hello' },
          { senderId: '789', content: 'Hi' }
        ]
      };
      const senders = [
        { _id: '456', displayName: 'Sender1' },
        { _id: '789', displayName: 'Sender2' }
      ];
      const token = await setupSession();
      User.findById.mockResolvedValue(user);
      chat.findOne.mockResolvedValue(chatDoc);
      User.find.mockResolvedValue(senders);
      app.response.render = function(view, options) {
        this.status(200).json({ view, options });
      };
      const response = await request(app)
        .get(ROUTES.CHAT)
        .set('Cookie', [`jwt=${token}`]);
      expect(response.status).toBe(200);
      expect(response.body.view).toBe('manager_chat');
      expect(User.findById).toHaveBeenCalledWith('123');
      expect(chat.findOne).toHaveBeenCalledWith(
        { managerId: '123' },
        { messages: 1, _id: 0 }
      );
      expect(User.find).toHaveBeenCalledWith({ _id: { $in: ['456', '789'] } });
    });

    test('should render manager_chat with no messages', async () => {
      const user = { _id: '123', displayName: 'Test Manager' };
      const chatDoc = { managerId: '123', messages: [] };
      const token = await setupSession();
      User.findById.mockResolvedValue(user);
      chat.findOne.mockResolvedValue(chatDoc);
      app.response.render = function(view, options) {
        this.status(200).json({ view, options });
      };
      const response = await request(app)
        .get(ROUTES.CHAT)
        .set('Cookie', [`jwt=${token}`]);
      expect(response.status).toBe(200);
      expect(response.body.view).toBe('manager_chat');
      expect(User.findById).toHaveBeenCalledWith('123');
      expect(chat.findOne).toHaveBeenCalledWith(
        { managerId: '123' },
        { messages: 1, _id: 0 }
      );
      expect(User.find).not.toHaveBeenCalled();
    });

    test('should return 401 if no token', async () => {
      const response = await request(app).get(ROUTES.CHAT);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized: No token' });
    });

    test('should return 403 if token is invalid', async () => {
      const response = await request(app)
        .get(ROUTES.CHAT)
        .set('Cookie', ['jwt=invalid-token']);
      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: 'Forbidden: Invalid token' });
    });

    test('should return 500 on server error', async () => {
      const token = await setupSession();
      User.findById.mockRejectedValue(new Error('Database error'));
      const response = await request(app)
        .get(ROUTES.CHAT)
        .set('Cookie', [`jwt=${token}`]);
      expect(response.status).toBe(500);
  expect(response.body).toEqual({});
    });
  });

  describe(`GET ${ROUTES.VENUE_SELECTION}`, () => {
    test('should render manager_venue with venues', async () => {
      const venues = [{ name: 'Venue1' }, { name: 'Venue2' }];
      const token = await setupSession();
      Venue.find.mockResolvedValue(venues);
      app.response.render = function(view, options) {
        this.status(200).json({ view, options });
      };
      const response = await request(app)
        .get(ROUTES.VENUE_SELECTION)
        .set('Cookie', [`jwt=${token}`]);
      expect(response.status).toBe(200);
      expect(response.body.view).toBe('manager_venue');
      expect(Venue.find).toHaveBeenCalled();
    });

    test('should return 401 if no token', async () => {
      const response = await request(app).get(ROUTES.VENUE_SELECTION);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized: No token' });
    });

    test('should return 500 on server error', async () => {
      const token = await setupSession();
      Venue.find.mockRejectedValue(new Error('Database error'));
      const response = await request(app)
        .get(ROUTES.VENUE_SELECTION)
        .set('Cookie', [`jwt=${token}`]);
      expect(response.status).toBe(500);
  expect(response.body).toEqual({});
    });
  });

  describe(`GET ${ROUTES.GUEST_INVITE}`, () => {
    test('should render manager_guests with user and managerName', async () => {
      const user = { _id: '123', displayName: 'Test Manager' };
      const token = await setupSession();
      User.findOne.mockResolvedValue(user);
      app.response.render = function(view, options) {
        this.status(200).json({ view, options });
      };
      const response = await request(app)
        .get(ROUTES.GUEST_INVITE)
        .set('Cookie', [`jwt=${token}`]);
      expect(response.status).toBe(200);
      expect(response.body.view).toBe('manager_guests');
      expect(User.findOne).toHaveBeenCalledWith({ _id: '123' });
    });

    test('should return 401 if no token', async () => {
      const response = await request(app).get(ROUTES.GUEST_INVITE);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized: No token' });
    });

    test('should return 500 on server error', async () => {
      const token = await setupSession();
      User.findOne.mockRejectedValue(new Error('Database error'));
      const response = await request(app)
        .get(ROUTES.GUEST_INVITE)
        .set('Cookie', [`jwt=${token}`]);
      expect(response.status).toBe(500);
  expect(response.body).toEqual({});
    });
  });

  describe(`POST ${ROUTES.SEND_GUEST_INVITE}`, () => {
    test('should call registerGuest and handle success', async () => {
      registerGuest.mockImplementation((req, res) => res.status(200).json({ success: true }));
      const response = await request(app)
        .post(ROUTES.SEND_GUEST_INVITE)
        .send({ email: 'guest@example.com' });
      expect(response.status).toBe(200);
      expect(registerGuest).toHaveBeenCalled();
    });

    test('should handle registerGuest error', async () => {
      registerGuest.mockImplementation((req, res) =>
        res.status(500).json({ success: false, message: 'Guest registration failed' })
      );
      const response = await request(app)
        .post(ROUTES.SEND_GUEST_INVITE)
        .send({ email: 'guest@example.com' });
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ success: false, message: 'Guest registration failed' });
    });
  });

  describe(`POST ${ROUTES.SEND_STAFF_INVITE}`, () => {
    test('should send staff invite and redirect to /manager/home', async () => {
      sendStaffInvite.mockResolvedValue();
      const response = await request(app)
        .post(ROUTES.SEND_STAFF_INVITE)
        .send({ email: 'staff@example.com', name: 'Staff', managerName: 'Manager', managerId: '123' });
      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/manager/home');
      expect(sendStaffInvite).toHaveBeenCalledWith('staff@example.com', 'Staff', 'Manager', '123');
    });

    test('should return 500 on error', async () => {
      sendStaffInvite.mockRejectedValue(new Error('Email error'));
      const response = await request(app)
        .post(ROUTES.SEND_STAFF_INVITE)
        .send({ email: 'staff@example.com', name: 'Staff', managerName: 'Manager', managerId: '123' });
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ success: false, message: 'Failed to send invite' });
    });
  });

  describe(`GET ${ROUTES.PROGRAM}`, () => {
    test('should render manager_program_editor with user and event', async () => {
      const user = { _id: '123' };
      const event = { name: 'Test Event', organizer: { id: '123' } };
      const token = await setupSession();
      User.findById.mockResolvedValue(user);
      Event.findOne.mockResolvedValue(event);
      app.response.render = function(view, options) {
        this.status(200).json({ view, options });
      };
      const response = await request(app)
        .get(ROUTES.PROGRAM)
        .set('Cookie', [`jwt=${token}`]);
      expect(response.status).toBe(200);
      expect(response.body.view).toBe('manager_program_editor');
      expect(User.findById).toHaveBeenCalledWith('123');
      expect(Event.findOne).toHaveBeenCalledWith({ 'organizer.id': '123' });
    });

    test('should return 401 if no token', async () => {
      const response = await request(app).get(ROUTES.PROGRAM);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized: No token' });
    });

    test('should return 500 on server error', async () => {
      const token = await setupSession();
      User.findById.mockRejectedValue(new Error('Database error'));
      const response = await request(app)
        .get(ROUTES.PROGRAM)
        .set('Cookie', [`jwt=${token}`]);
      expect(response.status).toBe(500);
  expect(response.body).toEqual({});
    });
  });

  describe(`GET ${ROUTES.MAP}`, () => {
    test('should render manager_map with user', async () => {
      const token = await setupSession();
      app.response.render = function(view, options) {
        this.status(200).json({ view, options });
      };
      const response = await request(app)
        .get(ROUTES.MAP)
        .set('Cookie', [`jwt=${token}`]);
      expect(response.status).toBe(200);
      expect(response.body.view).toBe('manager_map');
    });

    test('should return 401 if no token', async () => {
      const response = await request(app).get(ROUTES.MAP);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized: No token' });
    });
  });

  describe(`GET ${ROUTES.ANNOUNCEMENTS}`, () => {
    test('should render manager_announcement with user', async () => {
      const token = await setupSession();
      app.response.render = function(view, options) {
        this.status(200).json({ view, options });
      };
      const response = await request(app)
        .get(ROUTES.ANNOUNCEMENTS)
        .set('Cookie', [`jwt=${token}`]);
      expect(response.status).toBe(200);
      expect(response.body.view).toBe('manager_announcement');
    });

    test('should return 401 if no token', async () => {
      const response = await request(app).get(ROUTES.ANNOUNCEMENTS);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized: No token' });
    });
  });

  describe(`GET ${ROUTES.TASK_ASSIGNMENT}`, () => {
    test('should render manager_task with user', async () => {
      const token = await setupSession();
      app.response.render = function(view, options) {
        this.status(200).json({ view, options });
      };
      const response = await request(app)
        .get(ROUTES.TASK_ASSIGNMENT)
        .set('Cookie', [`jwt=${token}`]);
      expect(response.status).toBe(200);
      expect(response.body.view).toBe('manager_task');
    });

    test('should return 401 if no token', async () => {
      const response = await request(app).get(ROUTES.TASK_ASSIGNMENT);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized: No token' });
    });
  });

  describe(`POST ${ROUTES.VENUE_UPLOAD}`, () => {
    test('should upload venue and redirect to /manager/venue-selection', async () => {
      const venueData = {
        name: 'Test Venue',
        address: '123 Street',
        capacity: 100,
        facilities: 'WiFi',
        city: 'Test City',
        rating: 4,
        typeofvenue: 'Conference',
      };
      const venueInstance = { ...venueData, image: { url: 'http://cloudinary.com/test', public_id: 'test-id' }, save: jest.fn().mockResolvedValue() };
      const token = await setupSession();
      Venue.mockImplementation(() => venueInstance);
      VenueUpload.fields.mockImplementation(() => (req, res, next) => {
        req._mockFiles = {
          venueImage: [{ buffer: Buffer.from('test'), originalname: 'test.jpg' }],
          mapImage: [{ buffer: Buffer.from('test'), originalname: 'test-map.jpg' }]
        };
        req._mockBody = {
          name: venueData.name,
          address: venueData.address,
          capacity: venueData.capacity.toString(),
          facilities: venueData.facilities,
          city: venueData.city,
          rating: venueData.rating.toString(),
          typeofvenue: venueData.typeofvenue
        };
        next();
      });
      const response = await request(app)
        .post(ROUTES.VENUE_UPLOAD)
        .set('Cookie', [`jwt=${token}`])
        .field('name', venueData.name)
        .field('address', venueData.address)
        .field('capacity', venueData.capacity.toString())
        .field('facilities', venueData.facilities)
        .field('city', venueData.city)
        .field('rating', venueData.rating.toString())
        .field('typeofvenue', venueData.typeofvenue)
        .attach('venueImage', Buffer.from('test'), 'test.jpg')
        .attach('mapImage', Buffer.from('test'), 'test-map.jpg');
      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/manager/venue-selection');
      expect(venueInstance.save).toHaveBeenCalled();
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
    });

    test('should return 400 if no file uploaded', async () => {
      const token = await setupSession();
      // Simulate missing files for VenueUpload.fields
      VenueUpload.fields.mockImplementation(() => (req, res, next) => {
        console.log('Mock VenueUpload.fields called');
        req.files = {};
        req.body = {
          name: 'Test Venue',
          address: '123 Street',
          capacity: '100',
          facilities: 'WiFi',
          city: 'Test City',
          rating: '4',
          typeofvenue: 'Conference'
        };
        next();
      });
      // Reset modules to clear cache and re-require router after mocking
      jest.resetModules();
      const router = require('../routes/managerRoutes');
      app = express();
      app.set('view engine', 'ejs');
      app.set('views', path.join(__dirname, '../views'));
      app.use(cookieParser());
      app.use(
        session({
          secret: JWT_SECRET,
          resave: false,
          saveUninitialized: false,
          cookie: { secure: false }
        })
      );
      app.use((req, res, next) => {
        if (req.cookies.jwt) req.session.jwt = req.cookies.jwt;
        next();
      });
      app.use('/', router);
      const response = await request(app)
        .post(ROUTES.VENUE_UPLOAD)
        .set('Cookie', [`jwt=${token}`])
        .type('form')
        .send({
          name: 'Test Venue',
          address: '123 Street',
          capacity: '100',
          facilities: 'WiFi',
          city: 'Test City',
          rating: '4',
          typeofvenue: 'Conference'
        });
      expect(response.status).toBe(400);
      expect(response.text).toBe('Both venue and map images are required');
    }, 10000);

    test('should return 500 on upload error', async () => {
      const token = await setupSession();
      cloudinary.uploader.upload_stream.mockImplementation((options, callback) => ({
        end: jest.fn((buffer) => callback(new Error('Upload error'), null))
      }));
      const response = await request(app)
        .post(ROUTES.VENUE_UPLOAD)
        .set('Cookie', [`jwt=${token}`])
        .field('name', 'Test Venue')
        .field('address', '123 Street')
        .field('capacity', 100)
        .field('facilities', ['WiFi'])
        .field('city', 'Test City')
        .field('rating', 4)
        .field('typeofvenue', 'Conference')
        .attach('venueImage', Buffer.from('test'), 'test.jpg');
      expect(response.status).toBe(500);
      expect(response.text).toBe('Upload failed');
    });

    test('should return 401 if no token', async () => {
      const response = await request(app)
        .post(ROUTES.VENUE_UPLOAD)
        .field('name', 'Test Venue')
        .attach('venueImage', Buffer.from('test'), 'test.jpg');
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized: No token' });
    });
  });

  describe(`POST ${ROUTES.CREATE_EVENT}`, () => {
    test('should create event and redirect to /manager/home', async () => {
      const user = { _id: '123', name: 'Test Manager', email: 'test@example.com' };
      const eventData = {
        eventName: 'Test Event',
        eventDate: '2025-10-01',
        eventTime: '10:00',
        Expected: '100',
        eventDescription: 'Test Description'
      };
      const eventInstance = { save: jest.fn().mockResolvedValue() };
      const token = await setupSession();
      User.findById.mockResolvedValue(user);
      Event.mockImplementation(() => eventInstance);
      const response = await request(app)
        .post(ROUTES.CREATE_EVENT)
        .set('Cookie', [`jwt=${token}`])
        .send(eventData);
      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/manager/home');
      expect(eventInstance.save).toHaveBeenCalled();
    });

    test('should return 400 if required fields are missing', async () => {
      const token = await setupSession();
      const response = await request(app)
        .post(ROUTES.CREATE_EVENT)
        .set('Cookie', [`jwt=${token}`])
        .send({ eventName: 'Test Event' });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'All fields are required' });
    });

    test('should return 500 on server error', async () => {
      const eventData = {
        eventName: 'Test Event',
        eventDate: '2025-10-01',
        eventTime: '10:00',
        Expected: '100',
        eventDescription: 'Test Description'
      };
      const token = await setupSession();
      User.findById.mockRejectedValue(new Error('Database error'));
      const response = await request(app)
        .post(ROUTES.CREATE_EVENT)
        .set('Cookie', [`jwt=${token}`])
        .send(eventData);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Server error' });
    });

    test('should return 401 if no token', async () => {
      const eventData = {
        eventName: 'Test Event',
        eventDate: '2025-10-01',
        eventTime: '10:00',
        Expected: '100',
        eventDescription: 'Test Description'
      };
      const response = await request(app)
        .post(ROUTES.CREATE_EVENT)
        .send(eventData);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized: No token' });
    });
  });

  describe(`POST ${ROUTES.PROGRAM}`, () => {
    test('should create session and redirect to /manager/program', async () => {
      const user = { _id: '123' };
      const event = { _id: 'event123', dateTime: new Date('2025-10-01'), organizer: { id: '123' }, sessions: [] };
      const sessionData = {
        title: 'Test Session',
        Speaker: 'Test Speaker',
        start_time: '10:00',
        end_time: '11:00',
        location: 'Room 1',
        description: 'Test Description'
      };
      const sessionInstance = { _id: 'session123', save: jest.fn().mockResolvedValue() };
      const eventInstance = { ...event, save: jest.fn().mockResolvedValue() };
      const token = await setupSession();
      User.findById.mockResolvedValue(user);
      Event.findOne.mockResolvedValue(eventInstance);
      Session.mockImplementation(() => sessionInstance);
      const response = await request(app)
        .post(ROUTES.PROGRAM)
        .set('Cookie', [`jwt=${token}`])
        .send(sessionData);
      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/manager/program');
      expect(sessionInstance.save).toHaveBeenCalled();
      expect(eventInstance.save).toHaveBeenCalled();
    });

    test('should return 400 if required fields are missing', async () => {
      const token = await setupSession();
      const response = await request(app)
        .post(ROUTES.PROGRAM)
        .set('Cookie', [`jwt=${token}`])
        .send({ title: 'Test Session' });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'All fields are required' });
    });

    test('should return 500 on server error', async () => {
      const sessionData = {
        title: 'Test Session',
        Speaker: 'Test Speaker',
        start_time: '10:00',
        end_time: '11:00',
        location: 'Room 1',
        description: 'Test Description'
      };
      const token = await setupSession();
      User.findById.mockRejectedValue(new Error('Database error'));
      const response = await request(app)
        .post(ROUTES.PROGRAM)
        .set('Cookie', [`jwt=${token}`])
        .send(sessionData);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Server error' });
    });

    test('should return 401 if no token', async () => {
      const sessionData = {
        title: 'Test Session',
        Speaker: 'Test Speaker',
        start_time: '10:00',
        end_time: '11:00',
        location: 'Room 1',
        description: 'Test Description'
      };
      const response = await request(app)
        .post(ROUTES.PROGRAM)
        .send(sessionData);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized: No token' });
    });
  });

  describe(`DELETE ${ROUTES.DELETE_SESSION}`, () => {
    test('should delete session and return 200', async () => {
      const user = { _id: '123' };
      const event = { _id: 'event123', organizer: { id: '123' }, sessions: [{ sessionId: 'session123' }] };
      const eventInstance = { ...event, save: jest.fn().mockResolvedValue() };
      const token = await setupSession();
      User.findById.mockResolvedValue(user);
      Event.findOne.mockResolvedValue(eventInstance);
      Session.findByIdAndDelete.mockResolvedValue({});
      const response = await request(app)
        .delete('/program/session123')
        .set('Cookie', [`jwt=${token}`]);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Session deleted successfully' });
      expect(eventInstance.save).toHaveBeenCalled();
      expect(Session.findByIdAndDelete).toHaveBeenCalledWith('session123');
    });

    test('should return 404 if event not found', async () => {
      const token = await setupSession();
      User.findById.mockResolvedValue({ _id: '123' });
      Event.findOne.mockResolvedValue(null);
      const response = await request(app)
        .delete('/program/session123')
        .set('Cookie', [`jwt=${token}`]);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Event not found' });
    });

    test('should return 500 on server error', async () => {
      const token = await setupSession();
      User.findById.mockRejectedValue(new Error('Database error'));
      const response = await request(app)
        .delete('/program/session123')
        .set('Cookie', [`jwt=${token}`]);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Server error' });
    });

    test('should return 401 if no token', async () => {
      const response = await request(app).delete('/program/session123');
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized: No token' });
    });
  });

  describe(`POST ${ROUTES.SELECT_VENUE}`, () => {
    test('should select venue and redirect to /manager/home', async () => {
      const user = { _id: '123' };
      const event = { _id: 'event123', organizer: { id: '123' } };
      const venue = {
        _id: 'venue123',
        name: 'Test Venue',
        address: '123 Street',
        city: 'Test City',
        image: { url: 'http://cloudinary.com/test', public_id: 'test-id' }
      };
      const eventInstance = { ...event, save: jest.fn().mockResolvedValue() };
      const token = await setupSession();
      User.findById.mockResolvedValue(user);
      Event.findOne.mockResolvedValue(eventInstance);
      Venue.findOne.mockResolvedValue(venue);
      const response = await request(app)
        .post(ROUTES.SELECT_VENUE)
        .set('Cookie', [`jwt=${token}`])
        .send({ venue: 'Test Venue' });
      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/manager/home');
      expect(eventInstance.save).toHaveBeenCalled();
      expect(Venue.findOne).toHaveBeenCalledWith({ name: 'Test Venue' });
    });

    test('should return 404 if event not found', async () => {
      const token = await setupSession();
      User.findById.mockResolvedValue({ _id: '123' });
      Event.findOne.mockResolvedValue(null);
      const response = await request(app)
        .post(ROUTES.SELECT_VENUE)
        .set('Cookie', [`jwt=${token}`])
        .send({ venue: 'Test Venue' });
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Event not found' });
    });

    test('should return 500 on server error', async () => {
      const token = await setupSession();
      User.findById.mockRejectedValue(new Error('Database error'));
      const response = await request(app)
        .post(ROUTES.SELECT_VENUE)
        .set('Cookie', [`jwt=${token}`])
        .send({ venue: 'Test Venue' });
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Server error' });
    });

    test('should return 401 if no token', async () => {
      const response = await request(app)
        .post(ROUTES.SELECT_VENUE)
        .send({ venue: 'Test Venue' });
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Unauthorized: No token' });
    });

    test('should return 404 if venue not found', async () => {
      const token = await setupSession();
      User.findById.mockResolvedValue({ _id: '123' });
      Event.findOne.mockResolvedValue({ _id: 'event123', organizer: { id: '123' }, save: jest.fn().mockResolvedValue() });
      Venue.findOne.mockResolvedValue(null);
      const response = await request(app)
        .post(ROUTES.SELECT_VENUE)
        .set('Cookie', [`jwt=${token}`])
        .send({ venue: 'Test Venue' });
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Venue not found' });
    });
  });
});