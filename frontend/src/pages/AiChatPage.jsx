import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const API_BASE = "http://127.0.0.1:5000";

const SUGGESTED_QUESTIONS = [
  "How does GPA calculation work in AcadamiX?",
  "What is the What-If Simulator?",
  "How do I improve my priority subjects?",
  "How does the Study Timer work?",
  "What does 'High Risk' mean on a subject?",
];

export default function AiChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm **AcadamiX AI**. I know everything about this system — your GPA, subjects, study timer, analytics, and more. Ask me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported] = useState(() => "webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;

    const newMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: `⚠️ Sorry, something went wrong: ${e.message}` },
      ]);
    } finally {
      setLoading(false);
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
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      inputRef.current?.focus();
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

  return (
    <div className="min-h-screen text-white pt-16 relative z-10">
      <div className="mx-auto max-w-4xl p-6 flex flex-col h-[calc(100vh-4rem)]">

        {/* Header */}
        <div className="mb-6 flex items-center gap-4 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.15)]">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              AcadamiX <span className="text-[#22c55e]">AI</span>
            </h1>
            <p className="text-sm text-white/50 font-medium">
              Your academic assistant — knows the whole system
            </p>
          </div>
          {voiceSupported && (
            <div className={`ml-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors ${isListening ? 'text-[#22c55e] border-[#22c55e]/40 bg-[#22c55e]/10 animate-pulse' : 'text-white/40 border-[#333333]'}`}>
              <span>{isListening ? "🎙️ Listening..." : "🎙️ Voice Ready"}</span>
            </div>
          )}
        </div>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="mb-4 flex flex-wrap gap-2 animate-slide-up stagger-1">
            {SUGGESTED_QUESTIONS.map((q, i) => (
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

        {/* Messages */}
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
                  <span className="text-sm font-black text-black">U</span>
                </div>
              )}
            </div>
          ))}

          {/* Loading bubble */}
          {loading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center shrink-0 mr-3 mt-1">
                <span className="text-sm">🤖</span>
              </div>
              <div className="bg-[#1e1e1e] border border-[#333333] rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="glass rounded-2xl p-3 flex items-end gap-3 border-[#333333] shadow-lg">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AcadamiX AI anything... (Enter to send)"
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm text-white placeholder-white/30 font-medium leading-relaxed py-1 px-2 max-h-32"
            style={{ scrollbarWidth: 'none' }}
          />

          {/* Voice Button */}
          {voiceSupported && (
            <button
              onClick={handleVoice}
              title={isListening ? "Stop listening" : "Voice input"}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                isListening
                  ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse"
                  : "bg-[#232323] border border-[#444444] text-white/60 hover:text-white hover:border-[#666666]"
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v7a2 2 0 1 0 4 0V5a2 2 0 0 0-2-2zm-1 15.93V21h2v-2.07A7 7 0 0 0 19 12h-2a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93z"/>
              </svg>
            </button>
          )}

          {/* Send Button */}
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-[#22c55e] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
