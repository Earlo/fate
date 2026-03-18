/**
 * Test Cases: Empty Password Registration Vulnerability
 * Goal: Verify registration endpoint properly rejects empty passwords
 *
 * BUG: Current implementation allows empty password registration (security vulnerability)
 * FIX: All empty password tests should return 400 error after fix
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/auth/register/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/schemas/user', () => ({
  getUserByUsername: vi.fn(),
  createUser: vi.fn(),
}));

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
}));

import { getUserByUsername, createUser } from '@/schemas/user';
import { hash } from 'bcrypt';

const mockGetUserByUsername = getUserByUsername as ReturnType<typeof vi.fn>;
const mockCreateUser = createUser as ReturnType<typeof vi.fn>;
const mockHash = hash as ReturnType<typeof vi.fn>;

describe('POST /api/auth/register - Password Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks
    mockGetUserByUsername.mockResolvedValue(null);
    mockCreateUser.mockResolvedValue({
      id: 'test-user-id',
      username: 'testuser',
      admin: false,
      created: new Date(),
      updated: new Date(),
    });
    mockHash.mockResolvedValue('hashed-password');
  });

  async function makeRequest(body: { username?: string; password?: string }) {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return POST(request);
  }

  it('should reject empty string password', async () => {
    const response = await makeRequest({
      username: 'testuser',
      password: '',
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Password is required');

    // Should not hash password or create user
    expect(mockHash).not.toHaveBeenCalled();
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it('should reject whitespace-only password', async () => {
    const response = await makeRequest({
      username: 'testuser',
      password: '   ',
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Password is required');

    // Should not hash password or create user
    expect(mockHash).not.toHaveBeenCalled();
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it('should reject short password (less than 8 characters)', async () => {
    const response = await makeRequest({
      username: 'testuser',
      password: '1234567',
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Password must be at least 8 characters long');

    // Should not hash password or create user
    expect(mockHash).not.toHaveBeenCalled();
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it('should reject missing password field', async () => {
    const response = await makeRequest({
      username: 'testuser',
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Password is required');

    // Should not hash password or create user
    expect(mockHash).not.toHaveBeenCalled();
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it('should accept valid password (successful registration)', async () => {
    const response = await makeRequest({
      username: 'testuser',
      password: 'SecurePass123',
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.id).toBe('test-user-id');

    // Should hash password and create user
    expect(mockHash).toHaveBeenCalledWith('SecurePass123', 10);
    expect(mockCreateUser).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'hashed-password',
    });
  });

  it('should return 400 when username already exists', async () => {
    mockGetUserByUsername.mockResolvedValue({
      id: 'existing-user',
      username: 'existinguser',
      admin: false,
      created: new Date(),
      updated: new Date(),
    });

    const response = await makeRequest({
      username: 'existinguser',
      password: 'SecurePass123',
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Username already exists');
  });

  it('should return 500 when user creation fails', async () => {
    mockCreateUser.mockResolvedValue(null);

    const response = await makeRequest({
      username: 'testuser',
      password: 'SecurePass123',
    });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to create user');
  });
});

/**
 * Test Execution:
 *
 * Run tests: npm test
 *
 * Expected results BEFORE fix:
 * - Tests 1-4: FAIL (currently accepts empty passwords)
 * - Tests 5-7: PASS (normal registration flow works)
 *
 * Expected results AFTER fix:
 * - All tests: PASS
 */
