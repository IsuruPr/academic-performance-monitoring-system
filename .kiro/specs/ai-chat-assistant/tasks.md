# Implementation Plan: AI Chat Assistant

## Overview

Incremental implementation that closes the identified gaps and adds full test coverage. Each task builds on the previous, ending with all components wired together and verified.

## Tasks

- [x] 1. Add AcadamiX feature knowledge block to `server/ai.service.js`
  - Append a `SYSTEM_FEATURE_KNOWLEDGE` constant describing all AcadamiX features (Dashboard, GPA Analytics, Forecasting, What-If Analysis, Academic Warnings, Study Timer, Risk Analyzer, Final Analyzer, Semester Setup) in both English and Sinhala variants
  - Inject the feature knowledge block into both `ACADAMIX_SYSTEM_CONTEXT_ENGLISH` and `ACADAMIX_SYSTEM_CONTEXT_SINHALA` inside `getSystemContext()`
  - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 1.1 Write property test for system prompt completeness (Property 2)
    - **Property 2: System prompt contains all student context fields**
    - For arbitrary user/profile objects, assert the built system prompt contains name, university, degree, CGPA, every semester GPA, every module name/grade, every habit title, every event title
    - **Validates: Requirements 2.2, 2.3, 2.4**

- [x] 2. Verify and harden `POST /api/ai/chat` route in `server/index.js`
  - Confirm the route returns `400` when `messages` is missing or empty
  - Confirm the route returns `404` when the user is not found
  - Confirm the route returns `500` with a human-readable message on Gemini failure
  - Confirm the `language` param is forwarded to `chatWithAI`
  - Confirm user/profile are fetched using `req.userId` (from JWT), never from the request body
  - _Requirements: 8.1, 8.2, 8.3, 9.1, 9.2_

  - [ ]* 2.1 Write property test for invalid token rejection (Property 6)
    - **Property 6: Invalid tokens are always rejected**
    - For any string that is not a valid JWT, assert `POST /api/ai/chat` returns `401`
    - **Validates: Requirements 8.1, 8.2**

  - [ ]* 2.2 Write property test for user ID isolation (Property 7)
    - **Property 7: User ID isolation**
    - Assert the DB query uses exclusively the `userId` from the JWT, never any value from the request body
    - **Validates: Requirements 8.3**

  - [x]* 2.3 Write integration tests for the chat route
    - Valid JWT → fetches correct user and profile from DB, returns `{ reply }`
    - Language param flows through route → service → Gemini call
    - Missing `GEMINI_API_KEY` → returns `500` with descriptive message
    - Gemini API failure → returns `500` with human-readable message
    - _Requirements: 2.1, 9.1, 9.2_

- [x] 3. Checkpoint — Ensure all server-side tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Add `react-markdown` dependency to the client
  - Run `npm install react-markdown` inside `client/`
  - Confirm `react-markdown` is listed in `client/package.json` dependencies
  - _Requirements: 4.4_

- [x] 5. Replace `client/src/pages/AiChatPage.jsx` with the complete bilingual chat UI
  - Implement the full component as specified in the design: Header (title, language selector, clear button, voice status badge), SuggestedQuestions, MessageList with Markdown rendering via `react-markdown`, LoadingBubble, and InputBar
  - Language selector: three pill buttons (`🌍 Auto`, `EN`, `SI`); active state `bg-[#22c55e] text-black`; switching language does not clear conversation
  - `sendMessage(text?)`: appends user message, POSTs `{ messages, language }` to `/api/ai/chat`, appends reply; on error appends inline `⚠️ Sorry, something went wrong: {e.message}` assistant message
  - `clearChat()`: `window.confirm` → reset to initial greeting only on confirm
  - `handleKeyDown`: Enter (no Shift) triggers `sendMessage()`; Shift+Enter inserts newline
  - Voice input: only rendered when `voiceSupported` is true; `si-LK` locale for Sinhala, `en-US` for English/Auto; `recognition.onerror` and `recognition.onend` reset `isListening` without modifying input
  - Suggested questions: shown only when `messages.length <= 1`; English set for `auto`/`english`, Sinhala set for `sinhala`; hidden after first send
  - Auto-scroll to latest message after each update
  - _Requirements: 1.1, 1.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3, 7.4, 9.3, 10.1_

  - [ ]* 5.1 Write property test for message role alignment (Property 3)
    - **Property 3: Message role determines alignment class**
    - For arbitrary message arrays, assert user messages have right-align class and assistant messages have left-align class
    - **Validates: Requirements 4.1**

  - [ ]* 5.2 Write property test for suggested questions by language (Property 4)
    - **Property 4: Suggested questions match language mode**
    - For each language mode value, when `messages.length <= 1`, assert the correct question set is rendered
    - **Validates: Requirements 5.2**

  - [ ]* 5.3 Write property test for voice recognition locale (Property 5)
    - **Property 5: Voice recognition locale matches language mode**
    - For each language mode, assert `recognition.lang` is `si-LK` iff mode is `sinhala`, else `en-US`
    - **Validates: Requirements 6.4, 6.5**

  - [ ]* 5.4 Write property test for full conversation history in request (Property 8)
    - **Property 8: Full conversation history is sent with every message**
    - For conversations of arbitrary length, assert the `messages` array in the API request body contains all prior messages plus the new user message in order
    - **Validates: Requirements 10.1**

  - [ ]* 5.5 Write unit tests for UI interactions
    - Language selector renders 3 buttons (Auto, EN, SI)
    - Switching language preserves existing messages
    - Enter key triggers `sendMessage`; Shift+Enter does not
    - Loading bubble renders while `loading=true`
    - Error response from API renders inline error message
    - Suggested questions hidden after first message sent
    - Clicking a suggested question calls `sendMessage` with that text
    - Clear button triggers `window.confirm`; confirm resets to 1 message; cancel preserves messages
    - Mic button absent when `voiceSupported=false`
    - Speech recognition result populates input field
    - Speech recognition error resets `isListening` without changing input
    - _Requirements: 1.1, 1.5, 4.2, 4.3, 4.5, 5.1, 5.3, 5.4, 6.1, 6.6, 7.2, 7.3, 7.4, 9.3_

- [x] 6. Write property test for `detectLanguage` (Property 1) in `server/ai.service.test.js`
  - **Property 1: Language detection threshold**
  - For any string, assert `detectLanguage` returns `'sinhala'` iff the string contains more than 3 Sinhala Unicode chars (U+0D80–U+0DFF), and `'english'` otherwise
  - Use `fast-check` with a minimum of 100 iterations
  - **Validates: Requirements 1.2**

- [x] 7. Write property test for Gemini history stripping (Property 9) in `server/ai.service.test.js`
  - **Property 9: Gemini history excludes leading assistant messages**
  - For any message array, assert the history array passed to Gemini's `startChat` does not begin with role `'model'`
  - Use `fast-check` with a minimum of 100 iterations
  - **Validates: Requirements 10.2, 10.3**

- [x] 8. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with a minimum of 100 iterations per property
- Unit tests use Vitest + React Testing Library for the frontend
- Integration tests for the API route use Vitest + Supertest
