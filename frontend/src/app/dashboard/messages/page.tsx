"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { Send, Bot, User, Clock, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import {
  ChatMessage,
  QUICK_SUGGESTIONS,
  generateBotResponse
} from "@/lib/civicBot";

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: "online" | "offline";
  lastMessage: string;
  timestamp: string;
}

const STATIC_CONVERSATIONS: Conversation[] = [
  {
    id: "civicbot",
    name: "Civic Assistant (AI)",
    avatar: "🤖",
    role: "CivicBot Chatbot",
    status: "online",
    lastMessage: "Ask me about your complaint status, or...",
    timestamp: "Live",
  },
];

function MessagesContent() {
  const { user } = useAuth();
  const citizenEmail = user?.email || "guest@civicvoice.gov.in";

  // Conversation selection state
  const [activeConvId, setActiveConvId] = useState("civicbot");

  // Message list state (only active for civicbot)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      sender: "bot",
      text: "Hi! I'm CivicBot. Ask me about your complaint status, or tap a suggestion below.",
      timestamp: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userTime = new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text: textToSend.trim(),
      timestamp: userTime,
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulated typing delay between 600ms and 1200ms
    const randomDelay = Math.floor(Math.random() * (1200 - 600 + 1) + 600);
    await new Promise((res) => setTimeout(res, randomDelay));

    try {
      const responseText = generateBotResponse(textToSend, citizenEmail);
      const botTime = new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}-bot`,
        sender: "bot",
        text: responseText,
        timestamp: botTime,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const activeConv = STATIC_CONVERSATIONS.find((c) => c.id === activeConvId) || STATIC_CONVERSATIONS[0];

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden font-sans">
      
      {/* Left Sidebar: Conversations List */}
      <div className="w-full md:w-80 flex flex-col border-r border-slate-100 shrink-0">
        <div className="p-4 border-b border-slate-100">
          <h1 className="text-base font-extrabold text-slate-800 font-display">
            Inbox Messages
          </h1>
          <p className="text-xs text-slate-400">AI-powered civic support</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {STATIC_CONVERSATIONS.map((c) => {
            const isActive = c.id === activeConvId;
            return (
              <button
                key={c.id}
                onClick={() => setActiveConvId(c.id)}
                className={cn(
                  "w-full text-left p-4 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors border-l-4 border-transparent",
                  isActive && "bg-slate-50 border-l-amber-600"
                )}
              >
                <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-lg shadow-inner">
                  {c.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <h3 className="text-xs font-extrabold text-slate-800 truncate">
                      {c.name}
                    </h3>
                    <span className="text-[9px] font-bold text-slate-400 shrink-0">
                      {c.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold truncate mt-1">
                    {c.role}
                  </p>
                  <p className="text-xs text-slate-400 truncate mt-0.5 font-medium italic">
                    {c.lastMessage}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Chat Pane */}
      <div className="flex flex-grow flex-col bg-slate-50/40">
        
        {/* Chat Header */}
        <div className="bg-white px-6 py-3 border-b border-slate-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shadow-inner">
              {activeConv.avatar}
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 leading-none">
                <span>{activeConv.name}</span>
                {activeConv.status === "online" && (
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                )}
              </h2>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">
                {activeConv.role}
              </span>
            </div>
          </div>
        </div>

        {/* Chat Area Body */}
        {/* Functional CivicBot Chat Thread — always shown (only one conversation) */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/25">
            
            {/* Scrollable messages box */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => {
                const isBot = msg.sender === "bot";
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-end gap-2.5 max-w-[85%]",
                      isBot ? "self-start" : "self-end flex-row-reverse ml-auto"
                    )}
                  >
                    {/* Avatar icon bubble */}
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full border shadow-inner flex items-center justify-center text-xs shrink-0",
                        isBot ? "bg-slate-100 border-slate-200" : "bg-emerald-50 border-emerald-150"
                      )}
                    >
                      {isBot ? (
                        <Bot className="h-4.5 w-4.5 text-slate-650" />
                      ) : (
                        <User className="h-4.5 w-4.5 text-emerald-650" />
                      )}
                    </div>

                    {/* Chat Bubble container */}
                    <div className="space-y-1">
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5 text-xs font-semibold leading-relaxed shadow-sm whitespace-pre-wrap",
                          isBot
                            ? "bg-white border border-slate-100 text-slate-700 rounded-bl-none"
                            : "bg-emerald-600 border border-emerald-700 text-white rounded-br-none"
                        )}
                      >
                        {msg.text}
                      </div>
                      
                      <div
                        className={cn(
                          "text-[9px] font-bold text-slate-400 flex items-center gap-1",
                          isBot ? "justify-start pl-1" : "justify-end pr-1"
                        )}
                      >
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-end gap-2.5 max-w-[80%] self-start animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs shrink-0 shadow-inner">
                    <Bot className="h-4.5 w-4.5 text-slate-600" />
                  </div>
                  <div className="space-y-1">
                    <div className="bg-white border border-slate-100 text-slate-500 rounded-2xl rounded-bl-none px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                      <span>CivicBot is typing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-6 py-2 bg-white/50 border-t border-slate-100 flex flex-wrap gap-2 items-center">
              {QUICK_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSendMessage(suggestion)}
                  disabled={isTyping}
                  className="bg-white hover:bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5 text-[10px] font-bold text-slate-600 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Text input form box */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleFormSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message to CivicBot..."
                  disabled={isTyping}
                  className="flex-grow text-xs font-semibold border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer shrink-0 shadow-sm"
                >
                  <Send className="h-4.5 w-4.5" />
                </button>
              </form>
            </div>

          </div>

      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-slate-400">Loading inbox...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
