import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import api from "../api";

const INITIAL_GREETING = {
  role: "assistant",
  content:
    "Hello! I'm AcadamiX AI. I know your full academic profile and can help you in Sinhala or English. What would you like to know?",
};

const SUGGESTED_QUESTIONS_EN = [
  "What is my current CGPA?",
  "Which semester was my best?",
  "How can I improve my GPA?",
  "What does the Risk Analyzer do?",
  "Show me my weakest modules",
];

const SUGGESTED_QUESTIONS_SI = [
  "මගේ වත්මන් CGPA කීයද?",
  "මගේ හොඳම සෙමෙස්ටරය කුමක්ද?",
  "GPA දියුණු කරගන්නේ කෙසේද?",
  "Risk Analyzer කරන්නේ කුමක්ද?",
  "මගේ දුර්වල විෂයයන් මොනවාද?",
];

export default function AiChatPage({ user }) {
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState("auto"); // 'auto' | 'english' | 'sinhala'
  const [voiceSupported] = useState(
    () => "webkitSpeechRecognition" in window || "SpeechRecognition" in window,
  );

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);
  // Keep latest state accessible inside recognition callbacks (avoids stale closure)
  const messagesRef = useRef(messages);
  const languageRef = useRef(language);
  const loadingRef = useRef(loading);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const trimmed = (text !== undefined ? text : input).trim();
    if (!trimmed || loading) return;

    const newMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", {
        messages: newMessages,
        language,
      });
      setMessages([...newMessages, { role: "assistant", content: res.data.reply }]);
    } catch (e) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: `⚠️ Sorry, something went wrong: ${e.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear this conversation?")) {
      setMessages([INITIAL_GREETING]);
    }
  };

  const handleVoice = () => {
    if (!voiceSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Use si-LK for sinhala mode, en-US otherwise
    // In auto mode, try si-LK first so Sinhala speech is captured correctly
    recognition.lang = language === "english" ? "en-US" : "si-LK";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);

      // Auto-detect Sinhala from transcript
      const hasSinhala = /[\u0D80-\u0DFF]/.test(transcript);
      const currentLang = languageRef.current;
      const detectedLang = hasSinhala ? 'sinhala' : currentLang === 'auto' ? 'english' : currentLang;
      if (hasSinhala && currentLang === 'auto') setLanguage('sinhala');

      // Send directly using current messages from ref (avoids stale closure)
      if (loadingRef.current) return;
      const newMessages = [...messagesRef.current, { role: 'user', content: transcript }];
      setMessages(newMessages);
      setLoading(true);

      api.post('/ai/chat', { messages: newMessages, language: detectedLang })
        .then(res => {
          setMessages([...newMessages, { role: 'assistant', content: res.data.reply }]);
        })
        .catch(e => {
          setMessages([...newMessages, { role: 'assistant', content: `⚠️ Sorry, something went wrong: ${e.message}` }]);
        })
        .finally(() => setLoading(false));
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions =
    language === "sinhala" ? SUGGESTED_QUESTIONS_SI : SUGGESTED_QUESTIONS_EN;

  return (
    <div className="min-h-screen text-white pt-16 relative z-10">
      <div className="mx-auto max-w-4xl p-6 flex flex-col h-[calc(100vh-4rem)]">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3 animate-fade-in flex-wrap">
          {/* Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.15)] shrink-0">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                AcadamiX <span className="text-[#22c55e]">AI</span>
              </h1>
              <p className="text-xs text-white/50 font-medium truncate">
                Your academic assistant — knows the whole system
              </p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            {[
              { value: "auto", label: "🌍 Auto" },
              { value: "english", label: "EN" },
              { value: "sinhala", label: "SI" },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setLanguage(value)}
                title={value.charAt(0).toUpperCase() + value.slice(1)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
                  language === value
                    ? "bg-[#22c55e] text-black"
                    : "bg-[#232323] border border-[#444444] text-white/60 hover:text-[#22c55e]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Clear button */}
          <button
            onClick={clearChat}
            title="Clear Conversation"
            className="w-9 h-9 rounded-xl bg-[#232323] border border-[#444444] text-white/40 hover:text-red-400 hover:border-red-400/40 flex items-center justify-center transition-all group shrink-0"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:rotate-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>

          {/* Voice status badge */}
          <div
            className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors shrink-0 ${
              isListening
                ? "text-[#22c55e] border-[#22c55e]/40 bg-[#22c55e]/10 animate-pulse"
                : "text-white/40 border-[#333333]"
            }`}
          >
            <span>{isListening ? "🎙️ Listening..." : "🎙️ Voice Ready"}</span>
          </div>
        </div>

        {/* Suggested Questions — shown only when messages.length <= 1 */}
        {messages.length <= 1 && (
          <div className="mb-4 flex flex-wrap gap-2 animate-slide-up">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="rounded-full border border-[#333333] bg-[#1a1a1a] px-4 py-2 text-xs font-bold text-white/60 hover:text-[#22c55e] hover:border-[#22c55e]/40 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Message List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar animate-fade-in mb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center shrink-0 mr-3 mt-1">
                  <span className="text-sm">🤖</span>
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm font-medium leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#22c55e] text-black rounded-tr-sm"
                    : "bg-[#1e1e1e] border border-[#333333] text-white/90 rounded-tl-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:text-white prose-strong:text-[#22c55e] prose-li:marker:text-[#22c55e]">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-[#22c55e] flex items-center justify-center shrink-0 ml-3 mt-1">
                  <span className="text-sm font-black text-black">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Loading Bubble */}
          {loading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center shrink-0 mr-3 mt-1">
                <span className="text-sm">🤖</span>
              </div>
              <div className="bg-[#1e1e1e] border border-[#333333] rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full bg-[#22c55e] animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-[#22c55e] animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-[#22c55e] animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="glass rounded-2xl p-3 flex items-end gap-3 border-[#333333] shadow-lg">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AcadamiX AI anything... (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm text-white placeholder-white/30 font-medium leading-relaxed py-1 px-2 max-h-32"
            style={{ scrollbarWidth: "none" }}
          />

          {/* Mic Button — only if Web Speech API supported */}
          {voiceSupported && (
            <button
              onClick={handleVoice}
              title={isListening ? "Stop listening" : language === "sinhala" ? "සිංහල voice input (si-LK)" : "Voice input"}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                isListening
                  ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse"
                  : language === "sinhala"
                  ? "bg-[#232323] border border-[#22c55e]/40 text-[#22c55e] hover:border-[#22c55e]"
                  : "bg-[#232323] border border-[#444444] text-white/60 hover:text-white hover:border-[#666666]"
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v7a2 2 0 1 0 4 0V5a2 2 0 0 0-2-2zm-1 15.93V21h2v-2.07A7 7 0 0 0 19 12h-2a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93z" />
              </svg>
            </button>
          )}

          {/* Send Button */}
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-[#22c55e] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
          >
            <svg
              className="w-4 h-4 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
