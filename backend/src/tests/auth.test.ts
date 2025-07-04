import request from 'supertest';
import express from 'express';
import { authRoutes } from '../routes/auth';
import { createTestUser } from './setup';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'player'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.role).toBe(userData.role);
      expect(response.body.user).not.toHaveProperty('password_hash');
    });

    it('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser'
          // Missing email and password
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('All fields are required');
    });

    it('should reject registration with invalid role', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          role: 'invalid_role'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid role');
    });

    it('should reject duplicate username', async () => {
      const userData = {
        username: 'duplicateuser',
        email: 'first@example.com',
        password: 'password123',
        role: 'player'
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Duplicate registration
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...userData,
          email: 'second@example.com' // Different email, same username
        })
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Username or email already exists');
    });

    it('should reject duplicate email', async () => {
      const userData = {
        username: 'firstuser',
        email: 'duplicate@example.com',
        password: 'password123',
        role: 'player'
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Duplicate email registration
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...userData,
          username: 'seconduser' // Different username, same email
        })
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Username or email already exists');
    });

    it('should default to player role when not specified', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'defaultroleuser',
          email: 'defaultrole@example.com',
          password: 'password123'
          // No role specified
        })
        .expect(201);

      expect(response.body.user.role).toBe('player');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser: any;

    beforeEach(async () => {
      // Create a test user for login tests
      testUser = await createTestUser({
        username: 'loginuser',
        email: 'login@example.com',
        role: 'player'
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'loginuser',
          password: 'password123' // This should match the test password
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe('loginuser');
      expect(response.body.user).not.toHaveProperty('password_hash');
    });

    it('should reject login with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'loginuser'
          // Missing password
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Username and password are required');
    });

    it('should reject login with invalid username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'password123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'loginuser',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/verify', () => {
    let testUser: any;
    let validToken: string;

    beforeEach(async () => {
      // Register a user and get their token
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'verifyuser',
          email: 'verify@example.com',
          password: 'password123',
          role: 'architect'
        });

      testUser = response.body.user;
      validToken = response.body.token;
    });

    it('should verify valid token successfully', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(testUser.id);
      expect(response.body.user.username).toBe(testUser.username);
      expect(response.body.user.role).toBe(testUser.role);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('No token provided');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid token');
    });

    it('should reject malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('No token provided');
    });
  });
});