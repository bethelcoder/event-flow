const request = require('supertest');
const express = require('express');
const session = require('express-session');
const indexRoutes = require('../routes/index');
const jwt = require('jsonwebtoken');

// Mock jwt.sign so it doesn’t throw
jest.spyOn(jwt, 'sign').mockImplementation(() => 'dummy-token');

// Mock middleware
jest.mock('../middleware/authenticateJWT', () => ({
  authenticateJWT: (req, res, next) => {
    req.user = { id: '123' }; // fake logged-in user
    next();
  },
  redirectIfAuthenticated: (req, res, next) => next(),
  onboardingJWT: (req, res, next) => {
    req.user = { id: '123' };
    next();
  }
}));

// Mock models
jest.mock('../models/User', () => ({
  findById: jest.fn().mockResolvedValue({ id: '123', name: 'Test User' }),
  findByIdAndUpdate: jest.fn().mockResolvedValue({}),
  find: jest.fn().mockResolvedValue([{ id: '123', name: 'Sender' }])
}));

jest.mock('../models/chat', () => ({
  findOne: jest.fn().mockResolvedValue({ messages: [], members: [{ userId: '123' }] }),
  create: jest.fn().mockResolvedValue({})
}));

// Setup Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'testsecret', resave: false, saveUninitialized: true }));

// Mock res.render
app.response.render = function(view, options) {
  this.send(`Rendered ${view}`);
};

app.use('/', indexRoutes);

describe('Index routes', () => {
  it('GET /welcome should return 200', async () => {
    const res = await request(app).get('/welcome');
    expect(res.statusCode).toBe(200);
  });

  it('GET /signup should return 200', async () => {
    const res = await request(app).get('/signup');
    expect(res.statusCode).toBe(200);
  });

it('POST /submit-role should update user role and redirect', async () => {
  const res = await request(app)
    .post('/submit-role')
    .send({ role: 'manager' });

  expect(res.statusCode).toBe(302);             
  expect(res.headers.location).toBe('/manager/home');
});


  it('GET /dashboard should return 200', async () => {
    const res = await request(app).get('/dashboard');
    expect(res.statusCode).toBe(200);
  });

  it('GET /logout should redirect to /login', async () => {
    const res = await request(app).get('/logout');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

  it('GET /roles should return 200', async () => {
    const res = await request(app).get('/roles');
    expect(res.statusCode).toBe(200);
  });

  it('GET /report-incident should return 200', async () => {
    const res = await request(app).get('/report-incident');
    expect(res.statusCode).toBe(200);
  });

  it('GET /my-tasks should return 200', async () => {
    const res = await request(app).get('/my-tasks');
    expect(res.statusCode).toBe(200);
  });

  it('GET /announcements should return 200', async () => {
    const res = await request(app).get('/announcements');
    expect(res.statusCode).toBe(200);
  });
});
