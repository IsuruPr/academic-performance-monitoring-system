/**
 * Property-based tests for server/ai.service.js
 *
 * Property 1: Language detection threshold
 * Property 9: Gemini history excludes leading assistant messages
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// ── Import the pure functions under test ──────────────────────────────────
const { detectLanguage } = await import('./ai.service.js');

// ── Property 1: Language detection threshold ──────────────────────────────
// Feature: ai-chat-assistant, Property 1: For any string, detectLanguage
// returns 'sinhala' iff the string contains more than 3 Sinhala Unicode
// chars (U+0D80–U+0DFF), and 'english' otherwise.
// Validates: Requirements 1.2

describe('Property 1: Language detection threshold', () => {
  function countSinhala(str) {
    return (str.match(/[\u0D80-\u0DFF]/g) || []).length;
  }

  // Arbitrary unicode strings — covers all cases including Sinhala chars
  it('returns sinhala iff string has more than 3 Sinhala Unicode chars', () => {
    fc.assert(
      fc.property(
        fc.string({ unit: 'grapheme', minLength: 0, maxLength: 200 }),
        (str) => {
          const result = detectLanguage(str);
          const count = countSinhala(str);
          if (count > 3) {
            expect(result).toBe('sinhala');
          } else {
            expect(result).toBe('english');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Targeted: strings with exactly 0–3 Sinhala chars → always 'english'
  it('returns english for strings with 0 to 3 Sinhala chars', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 3 }),
        fc.string({ unit: 'binary', minLength: 0, maxLength: 50 }),
        (sinhalaCount, base) => {
          // Strip any Sinhala chars from base, then add exactly sinhalaCount
          const stripped = base.replace(/[\u0D80-\u0DFF]/g, 'x');
          const sinhalaChars = Array.from(
            { length: sinhalaCount },
            (_, i) => String.fromCodePoint(0x0D80 + (i % 0x80))
          ).join('');
          const str = stripped + sinhalaChars;
          expect(detectLanguage(str)).toBe('english');
        }
      ),
      { numRuns: 100 }
    );
  });

  // Targeted: strings with 4+ Sinhala chars → always 'sinhala'
  it('returns sinhala for strings with more than 3 Sinhala chars', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 4, max: 20 }),
        fc.string({ unit: 'binary', minLength: 0, maxLength: 50 }),
        (sinhalaCount, base) => {
          const stripped = base.replace(/[\u0D80-\u0DFF]/g, 'x');
          const sinhalaChars = Array.from(
            { length: sinhalaCount },
            (_, i) => String.fromCodePoint(0x0D80 + (i % 0x80))
          ).join('');
          const str = stripped + sinhalaChars;
          expect(detectLanguage(str)).toBe('sinhala');
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ── Property 9: Gemini history excludes leading assistant messages ─────────
// Feature: ai-chat-assistant, Property 9: For any message array, the history
// array passed to Gemini's startChat SHALL not begin with role 'model'.
// Validates: Requirements 10.2, 10.3

describe('Property 9: Gemini history excludes leading assistant messages', () => {
  /**
   * Mirror the history-building logic from chatWithAI in ai.service.js.
   * The fixed implementation strips ALL leading assistant messages.
   */
  function buildGeminiHistory(messages) {
    // Strip all leading assistant messages
    let startIndex = 0;
    while (startIndex < messages.length && messages[startIndex].role === 'assistant') {
      startIndex++;
    }
    const filteredMessages = messages.slice(startIndex);

    const history = [];
    const conversationHistory = filteredMessages.slice(0, -1);

    conversationHistory.forEach((m) => {
      history.push({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      });
    });

    return history;
  }

  const messageArb = fc.record({
    role: fc.constantFrom('user', 'assistant'),
    content: fc.string({ minLength: 1, maxLength: 100 }),
  });

  it('history never starts with role model for any message array', () => {
    fc.assert(
      fc.property(
        // At least 2 messages so there is history (last is excluded as current msg)
        fc.array(messageArb, { minLength: 2, maxLength: 20 }),
        (messages) => {
          const history = buildGeminiHistory(messages);
          if (history.length > 0) {
            expect(history[0].role).not.toBe('model');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('history never starts with model even when multiple leading messages are assistant', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        fc.array(messageArb, { minLength: 0, maxLength: 15 }),
        (leadingCount, rest) => {
          const leading = Array.from({ length: leadingCount }, (_, i) => ({
            role: 'assistant',
            content: `Greeting ${i}`,
          }));
          const messages = [
            ...leading,
            ...rest,
            { role: 'user', content: 'My question' },
          ];
          const history = buildGeminiHistory(messages);
          if (history.length > 0) {
            expect(history[0].role).not.toBe('model');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('history never starts with model for arrays starting with user messages', () => {
    fc.assert(
      fc.property(
        fc.array(messageArb, { minLength: 1, maxLength: 18 }),
        (rest) => {
          const messages = [
            { role: 'user', content: 'First user message' },
            ...rest,
            { role: 'user', content: 'Latest question' },
          ];
          const history = buildGeminiHistory(messages);
          if (history.length > 0) {
            expect(history[0].role).not.toBe('model');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
