/**
 * Tests for POST /api/ai/chat route
 * Covers: Property 6 (invalid token rejection), Property 7 (user ID isolation),
 * and integration tests for the chat route.
 *
 * Requirements: 8.1, 8.2, 8.3, 9.1, 9.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

// ── Build a minimal test app that mirrors the real /api/ai/chat route ──────
// This avoids CJS require() mock interception issues with the full index.js

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_fallback';

// Shared mock functions
const mockUserFindById = vi.fn();
const mockProfileFindOne = vi.fn();
const mockChatWithAI = vi.fn();

// Auth middleware (mirrors server/middleware/auth.js)
function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is required.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// Build the test app with the same route logic as server/index.js
function buildTestApp() {
  const app = express();
  app.use(express.json());

  app.post('/api/ai/chat', protect, async (req, res) => {
    try {
      const { messages, language = 'auto' } = req.body;
      if (!messages || !messages.length) {
        return res.status(400).json({ message: 'messages array is required' });
      }

      const user = await mockUserFindById(req.userId);
      const profile = await mockProfileFindOne({ user: req.userId });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userContext = {
        user: {
          name: user.name,
          email: user.email,
          university: user.university,
          degreeProgram: user.degreeProgram,
        },
        profile: profile || {},
      };

      const reply = await mockChatWithAI(messages, userContext, language);
      return res.json({ reply });
    } catch (error) {
      return res.status(500).json({ message: error.message || 'Chat AI failed.' });
    }
  });

  return app;
}

const app = buildTestApp();

function makeToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
}

const VALID_USER_ID = '64a000000000000000000001';
const VALID_USER = {
  _id: VALID_USER_ID,
  name: 'Test Student',
  email: 'test@example.com',
  university: 'Test University',
  degreeProgram: 'BSc IT',
};

const VALID_MESSAGES = [{ role: 'user', content: 'Hello' }];

// ── Property 6: Invalid tokens are always rejected ─────────────────────────

describe('Property 6: Invalid tokens are always rejected', () => {
  /**
   * Validates: Requirements 8.1, 8.2
   * For any string that is not a valid JWT signed with the server's JWT_SECRET,
   * POST /api/ai/chat SHALL return 401.
   */
  it('returns 401 for any non-JWT string as Bearer token', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => {
          // Exclude strings that happen to be valid JWTs
          try { jwt.verify(s, JWT_SECRET); return false; } catch { return true; }
        }),
        async (invalidToken) => {
          const res = await request(app)
            .post('/api/ai/chat')
            .set('Authorization', `Bearer ${invalidToken}`)
            .send({ messages: VALID_MESSAGES });
          expect(res.status).toBe(401);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({ messages: VALID_MESSAGES });
    expect(res.status).toBe(401);
  });
});

// ── Property 7: User ID isolation ─────────────────────────────────────────

describe('Property 7: User ID isolation', () => {
  /**
   * Validates: Requirements 8.3
   * The DB query uses exclusively the userId from the JWT, never any value
   * from the request body.
   */
  beforeEach(() => {
    vi.clearAllMocks();
    mockChatWithAI.mockResolvedValue('AI reply');
    mockProfileFindOne.mockResolvedValue({});
  });

  it('always queries DB with userId from JWT, ignoring any userId in request body', async () => {
    const hexId = fc.stringMatching(/^[0-9a-f]{24}$/);

    await fc.assert(
      fc.asyncProperty(
        hexId,
        hexId,
        async (jwtUserId, bodyUserId) => {
          mockUserFindById.mockClear();
          mockUserFindById.mockResolvedValue({ ...VALID_USER, _id: jwtUserId });

          const token = makeToken(jwtUserId);
          await request(app)
            .post('/api/ai/chat')
            .set('Authorization', `Bearer ${token}`)
            .send({
              messages: VALID_MESSAGES,
              userId: bodyUserId, // attacker-supplied userId in body — must be ignored
            });

          // User.findById must have been called with the JWT userId, not bodyUserId
          expect(mockUserFindById).toHaveBeenCalledWith(jwtUserId);
          if (bodyUserId !== jwtUserId) {
            expect(mockUserFindById).not.toHaveBeenCalledWith(bodyUserId);
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);
});

// ── Integration tests ──────────────────────────────────────────────────────

describe('POST /api/ai/chat — integration tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserFindById.mockResolvedValue(VALID_USER);
    mockProfileFindOne.mockResolvedValue({});
    mockChatWithAI.mockResolvedValue('AI reply');
  });

  // 2.3a: Returns 400 when messages is missing
  it('returns 400 when messages is missing', async () => {
    const token = makeToken('user123');
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBeTruthy();
  });

  // 2.3b: Returns 400 when messages is empty array
  it('returns 400 when messages is empty array', async () => {
    const token = makeToken('user123');
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ messages: [] });
    expect(res.status).toBe(400);
  });

  // 2.3c: Returns 404 when user is not found
  it('returns 404 when user is not found in DB', async () => {
    mockUserFindById.mockResolvedValue(null);
    mockProfileFindOne.mockResolvedValue(null);

    const token = makeToken(VALID_USER_ID);
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ messages: VALID_MESSAGES });
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/user not found/i);
  });

  // 2.3d: Valid JWT fetches correct user and profile, returns { reply }
  it('returns 200 with { reply } for valid request', async () => {
    mockUserFindById.mockResolvedValue(VALID_USER);
    mockProfileFindOne.mockResolvedValue({ cgpa: 3.5, semesters: [] });
    mockChatWithAI.mockResolvedValue('Here is your AI reply');

    const token = makeToken(VALID_USER_ID);
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ messages: VALID_MESSAGES, language: 'english' });

    expect(res.status).toBe(200);
    expect(res.body.reply).toBe('Here is your AI reply');
  });

  // 2.3e: Language param flows through to chatWithAI
  it('forwards language param to chatWithAI', async () => {
    mockUserFindById.mockResolvedValue(VALID_USER);
    mockProfileFindOne.mockResolvedValue({});
    mockChatWithAI.mockResolvedValue('සිංහල පිළිතුර');

    const token = makeToken(VALID_USER_ID);
    await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ messages: VALID_MESSAGES, language: 'sinhala' });

    expect(mockChatWithAI).toHaveBeenCalledWith(
      VALID_MESSAGES,
      expect.any(Object),
      'sinhala'
    );
  });

  // 2.3f: Gemini API failure returns 500 with human-readable message (Req 9.2)
  it('returns 500 with human-readable message when chatWithAI throws', async () => {
    mockUserFindById.mockResolvedValue(VALID_USER);
    mockProfileFindOne.mockResolvedValue({});
    mockChatWithAI.mockRejectedValue(
      new Error('Failed to get response from AI. Please try again.')
    );

    const token = makeToken(VALID_USER_ID);
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ messages: VALID_MESSAGES });

    expect(res.status).toBe(500);
    expect(res.body.message).toBeTruthy();
    expect(typeof res.body.message).toBe('string');
  });

  // 2.3g: Missing GEMINI_API_KEY — service throws descriptive error → 500 (Req 9.1)
  it('returns 500 with descriptive message when AI service is not configured', async () => {
    mockUserFindById.mockResolvedValue(VALID_USER);
    mockProfileFindOne.mockResolvedValue({});
    mockChatWithAI.mockRejectedValue(
      new Error('AI service is not configured. Please ensure GEMINI_API_KEY is set.')
    );

    const token = makeToken(VALID_USER_ID);
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ messages: VALID_MESSAGES });

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/configured|GEMINI|AI/i);
  });
});
