"use client";

import React, { useState } from "react";
import { Send, Paperclip, Check, ChevronRight, Phone, Video, Info } from "lucide-react";
import { MOCK_CONVERSATIONS, MOCK_CHAT_THREAD } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function Messages() {
  const [activeConvId, setActiveConvId] = useState("conv-1");
  const [inputText, setInputText] = useState("");
  const [chatThread, setChatThread] = useState(MOCK_CHAT_THREAD);

  const activeConv = MOCK_CONVERSATIONS.find((c) => c.id === activeConvId) || MOCK_CONVERSATIONS[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      direction: "outgoing" as const,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };

    setChatThread((prev) => [...prev, newMsg]);
    setInputText("");
  };

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white border border-slate-100 rounded-card shadow-sm overflow-hidden">
      
      {/* Left Pane: Conversations List */}
      <div className="w-full md:w-80 flex flex-col border-r border-slate-100 shrink-0">
        <div className="p-4 border-b border-slate-100">
          <h1 className="text-base font-bold text-slate-800 font-display">
            Department Chats
          </h1>
          <p className="text-xs text-slate-400">Direct communication with city offices</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {MOCK_CONVERSATIONS.map((c) => {
            const isActive = c.id === activeConvId;
            return (
              <div
                key={c.id}
                onClick={() => setActiveConvId(c.id)}
                className={cn(
                  "p-4 flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors",
                  isActive && "bg-primary-tint/30 border-l-4 border-primary"
                )}
              >
                {/* Avatar / initial */}
                <div 
                  className="h-10 w-10 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm"
                  style={{ backgroundColor: c.departmentColor }}
                >
                  {c.departmentInitial}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <h3 className="text-xs font-bold text-slate-800 truncate">
                      {c.department}
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                      {c.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-1">
                    {c.lastMessage}
                  </p>
                </div>

                {c.unreadCount && c.unreadCount > 0 && !isActive && (
                  <span className="h-5 w-5 rounded-full bg-primary text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                    {c.unreadCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Pane: Active Chat Thread */}
      <div className="hidden md:flex flex-1 flex-col bg-slate-50/50">
        {/* Chat Header */}
        <div className="bg-white px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="h-10 w-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: activeConv.departmentColor }}
            >
              {activeConv.departmentInitial}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">{activeConv.department}</h2>
              <span className="text-[10px] font-semibold text-green-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <button className="p-2 hover:bg-slate-50 hover:text-slate-600 rounded-control transition-colors">
              <Phone className="h-4.5 w-4.5" />
            </button>
            <button className="p-2 hover:bg-slate-50 hover:text-slate-600 rounded-control transition-colors">
              <Video className="h-4.5 w-4.5" />
            </button>
            <button className="p-2 hover:bg-slate-50 hover:text-slate-600 rounded-control transition-colors">
              <Info className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatThread.map((msg) => {
            const isOutgoing = msg.direction === "outgoing";
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[70%] space-y-1",
                  isOutgoing ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div 
                  className={cn(
                    "px-4 py-2.5 text-xs shadow-sm leading-relaxed",
                    isOutgoing ? "chat-bubble-outgoing" : "chat-bubble-incoming"
                  )}
                >
                  {msg.text}
                </div>
                
                <span className="text-[9px] font-semibold text-slate-400 px-1 flex items-center gap-0.5">
                  {msg.time}
                  {isOutgoing && <Check className="h-3 w-3 text-green-500" />}
                </span>
              </div>
            );
          })}
        </div>

        {/* Message Input Bar */}
        <form onSubmit={handleSend} className="bg-white p-4 border-t border-slate-100 flex items-center gap-3">
          <button 
            type="button" 
            className="p-2.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-control transition-colors"
          >
            <Paperclip className="h-4.5 w-4.5" />
          </button>
          
          <input
            type="text"
            placeholder={`Message ${activeConv.department}...`}
            className="flex-1 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 border border-slate-200 rounded-control focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-slate-400"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <button 
            type="submit" 
            className="btn-primary p-2.5 flex items-center justify-center shrink-0"
            style={{ borderRadius: "var(--radius-control)" }}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
