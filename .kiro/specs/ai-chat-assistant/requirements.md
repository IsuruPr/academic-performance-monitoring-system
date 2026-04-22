# Requirements Document

## Introduction

The AI Chat Assistant is a complete replacement for the existing `AiChatPage.jsx` in the AcadamiX academic management system. It provides students with a smart, context-aware conversational interface powered by Google Gemini. The assistant understands both Sinhala and English, has full knowledge of the student's academic data (GPA history, module grades, CA marks, forecasting, warnings, what-if analysis, study habits, and upcoming events), and can answer any question a student has about their academic performance or how to use the system's features.

## Glossary

- **AcadamiX_AI**: The AI chat assistant component, powered by Google Gemini 1.5 Flash, embedded in the AcadamiX system.
- **Chat_Interface**: The React frontend page (`AiChatPage.jsx`) that renders the conversation UI.
- **Chat_API**: The backend endpoint `POST /api/ai/chat` that processes messages and returns AI responses.
- **AI_Service**: The server-side module (`ai.service.js`) that communicates with the Google Gemini API.
- **Student_Context**: The full academic profile of the authenticated student, including CGPA, semester history, module grades, CA marks, study habits, and upcoming events.
- **System_Knowledge**: The AI's built-in understanding of all AcadamiX features: Dashboard, GPA Analytics, Forecasting, Warnings, What-If Analysis, Study Timer, Risk Analyzer, Final Analyzer, and Semester Setup.
- **Message_History**: The ordered list of user and assistant messages in the current chat session.
- **Language_Mode**: The active language setting — `auto`, `english`, or `sinhala` — that controls the AI's response language.
- **Suggested_Question**: A pre-defined prompt shown to the student to help them start a conversation.
- **Voice_Input**: Browser-based speech recognition that converts spoken words into text input.

---

## Requirements

### Requirement 1: Bilingual Conversational AI

**User Story:** As a student, I want to chat with the AI assistant in either Sinhala or English, so that I can get academic help in the language I am most comfortable with.

#### Acceptance Criteria

1. THE Chat_Interface SHALL provide three language mode buttons: `Auto`, `EN` (English), and `SI` (Sinhala).
2. WHEN the language mode is set to `auto`, THE AI_Service SHALL detect the language of the student's message using Unicode character analysis and respond in the detected language.
3. WHEN the language mode is set to `english`, THE AI_Service SHALL respond exclusively in English regardless of the input language.
4. WHEN the language mode is set to `sinhala`, THE AI_Service SHALL respond exclusively in Sinhala regardless of the input language.
5. WHEN the student switches the language mode, THE Chat_Interface SHALL apply the new mode to all subsequent messages without clearing the existing conversation.

---

### Requirement 2: Student Context Injection

**User Story:** As a student, I want the AI to know my full academic history, so that its advice is personalized and relevant to my actual situation.

#### Acceptance Criteria

1. WHEN the Chat_API receives a chat request, THE Chat_API SHALL fetch the authenticated student's user profile and GPA profile from the database before calling the AI_Service.
2. THE AI_Service SHALL include the student's name, university, degree program, and overall CGPA in the system prompt sent to Gemini.
3. THE AI_Service SHALL include the full semester-by-semester academic history — including semester GPA, target GPA, module names, module codes, grades, credits, and CA marks — in the system prompt.
4. THE AI_Service SHALL include the student's recorded study habits and upcoming academic events in the system prompt.
5. IF the student has no saved GPA profile, THEN THE Chat_API SHALL still respond using a general academic context without student-specific data.

---

### Requirement 3: System Feature Knowledge

**User Story:** As a student, I want the AI to explain and guide me through any feature in AcadamiX, so that I can make full use of the system.

#### Acceptance Criteria

1. THE AI_Service system prompt SHALL include descriptions of all AcadamiX features: Dashboard, GPA Analytics, Forecasting, What-If Analysis, Academic Warnings, Study Timer, Risk Analyzer, Final Analyzer, and Semester Setup.
2. WHEN a student asks how a feature works, THE AcadamiX_AI SHALL provide a clear, accurate explanation of that feature based on the system knowledge in its prompt.
3. WHEN a student asks for navigation guidance (e.g., "where do I find the What-If tool?"), THE AcadamiX_AI SHALL describe the correct location and steps within the AcadamiX interface.

---

### Requirement 4: Chat Message Sending and Display

**User Story:** As a student, I want to type and send messages to the AI and see the conversation clearly, so that I can have a smooth back-and-forth interaction.

#### Acceptance Criteria

1. THE Chat_Interface SHALL render a scrollable message list showing all messages in the current session, with user messages right-aligned and assistant messages left-aligned.
2. WHEN the student presses Enter (without Shift) or clicks the send button, THE Chat_Interface SHALL send the message to the Chat_API and append it to the message list.
3. WHILE a response is being fetched, THE Chat_Interface SHALL display an animated loading indicator in the assistant message position.
4. WHEN the Chat_API returns a response, THE Chat_Interface SHALL render the assistant's reply using Markdown formatting (bold, lists, headings, code blocks).
5. IF the Chat_API returns an error, THEN THE Chat_Interface SHALL display a user-friendly error message in the assistant message position.
6. THE Chat_Interface SHALL automatically scroll to the latest message after each new message or response is added.

---

### Requirement 5: Suggested Questions

**User Story:** As a student, I want to see example questions I can ask, so that I know what the AI can help me with and can get started quickly.

#### Acceptance Criteria

1. WHEN the chat session has only the initial greeting message, THE Chat_Interface SHALL display a set of suggested question buttons.
2. THE Chat_Interface SHALL show English suggested questions when the language mode is `english` or `auto`, and Sinhala suggested questions when the mode is `sinhala`.
3. WHEN the student clicks a suggested question, THE Chat_Interface SHALL send that question as a message immediately, as if the student had typed and submitted it.
4. WHEN the student sends any message, THE Chat_Interface SHALL hide the suggested questions for the remainder of the session.

---

### Requirement 6: Voice Input

**User Story:** As a student, I want to speak my question instead of typing it, so that I can interact with the AI hands-free.

#### Acceptance Criteria

1. WHERE the browser supports the Web Speech API, THE Chat_Interface SHALL display a microphone button in the input area.
2. WHEN the student clicks the microphone button, THE Chat_Interface SHALL start speech recognition and display a visual indicator that listening is active.
3. WHEN speech recognition produces a result, THE Chat_Interface SHALL populate the text input field with the transcribed text and stop listening.
4. WHEN the language mode is `sinhala`, THE Chat_Interface SHALL configure speech recognition to use the `si-LK` locale.
5. WHEN the language mode is `english` or `auto`, THE Chat_Interface SHALL configure speech recognition to use the `en-US` locale.
6. IF speech recognition encounters an error or ends without a result, THEN THE Chat_Interface SHALL reset the listening state without modifying the input field.

---

### Requirement 7: Conversation Management

**User Story:** As a student, I want to clear my conversation history, so that I can start a fresh session without previous context.

#### Acceptance Criteria

1. THE Chat_Interface SHALL display a clear conversation button in the header area.
2. WHEN the student clicks the clear button, THE Chat_Interface SHALL prompt the student for confirmation before clearing.
3. WHEN the student confirms, THE Chat_Interface SHALL reset the message list to contain only the initial greeting message.
4. WHEN the student cancels, THE Chat_Interface SHALL leave the conversation unchanged.

---

### Requirement 8: Authenticated API Access

**User Story:** As a system, I want the chat endpoint to require authentication, so that student data is only accessible to the student it belongs to.

#### Acceptance Criteria

1. THE Chat_API SHALL require a valid JWT bearer token on every request.
2. IF the request does not include a valid token, THEN THE Chat_API SHALL return a 401 Unauthorized response.
3. THE Chat_API SHALL use the user ID from the verified token to fetch only that student's profile data.

---

### Requirement 9: Graceful AI Service Degradation

**User Story:** As a student, I want to receive a clear message if the AI is unavailable, so that I am not left confused by a silent failure.

#### Acceptance Criteria

1. IF the `GEMINI_API_KEY` environment variable is not set, THEN THE AI_Service SHALL throw a descriptive error indicating the service is not configured.
2. IF the Gemini API call fails for any reason, THEN THE Chat_API SHALL return a 500 response with a human-readable error message.
3. WHEN the Chat_Interface receives an error response from the Chat_API, THE Chat_Interface SHALL display the error message inline in the conversation rather than crashing the page.

---

### Requirement 10: Conversation History Continuity

**User Story:** As a student, I want the AI to remember what was said earlier in the conversation, so that I can ask follow-up questions without repeating context.

#### Acceptance Criteria

1. WHEN the student sends a message, THE Chat_Interface SHALL include the full Message_History of the current session in the request body sent to the Chat_API.
2. THE AI_Service SHALL pass the conversation history to the Gemini chat session so that the model has context from prior turns.
3. THE AI_Service SHALL exclude any leading assistant-only messages (e.g., the initial greeting) from the Gemini history to comply with the model's alternating turn requirement.
