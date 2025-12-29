/**
 * @file AskExpert.tsx
 * @description Parenting Consultant chat interface. 
 * Features real-time messaging UI and CJK Input Method (IME) optimizations.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { createParentingChat } from '../services/geminiService';
import { Message } from '../types';
import { GenerateContentResponse } from '@google/genai';

export const AskExpert: React.FC = () => {
  // Conversation history state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '你好呀！我是你的育兒助手。無論是關於睡眠、餵食還是發展里程碑，我都可以陪你聊聊喔。今天有什麼我可以幫忙的嗎？',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  
  // Refs for DOM interaction and stateful chat session
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);

  /**
   * Text Sanitizer
   * Acts as a fallback filter to strip Markdown symbols (**, ##, etc.) 
   * in case the AI ignores the System Instruction.
   */
  const cleanText = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1')     // Remove *italic*
      .replace(/#{1,6}\s?/g, '')       // Remove # headings
      .replace(/`{1,3}.*?`{1,3}/gs, '') // Remove code blocks
      .replace(/_{1,2}(.*?)_{1,2}/g, '$1') // Remove _underlines_
      .trim();
  };

  // Initialize Chat Session on component mount
  useEffect(() => {
    try {
      chatSessionRef.current = createParentingChat();
      setInitError(null);
    } catch (err: any) {
      console.error("Failed to initialize parenting chat:", err);
      setInitError(err.message);
    }
    scrollToBottom();
  }, []);

  // Auto-scroll to the bottom whenever messages or typing state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Handles message submission
   */
  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      if (!chatSessionRef.current) {
        chatSessionRef.current = createParentingChat();
      }

      // Send message to Gemini and await response
      const result: GenerateContentResponse = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      const rawText = result.text || "抱歉，我暫時無法回答這個問題。";
      
      // Sanitize the response text before updating state
      const responseText = cleanText(rawText);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
      setInitError(null);
    } catch (error: any) {
      console.error("Chat API Error:", error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: `【System Notice】 Encountered an issue while analyzing. Please try again later.`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
      
      // Provide user-friendly feedback for API Key errors
      if (error.message.includes("金鑰") || error.message.includes("API key")) {
        setInitError("API Key error. Please check your project configuration.");
      }
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen pb-[80px] bg-[#FDFBF7]">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md px-6 py-4 border-b border-orange-100 flex items-center gap-3 sticky top-0 z-10">
        <div className="w-10 h-10 bg-gradient-to-tr from-purple-300 to-indigo-400 rounded-full flex items-center justify-center text-white shadow-sm">
          <Sparkles size={20} />
        </div>
        <div>
          <h1 className="font-bold text-gray-800 tracking-tight">AI 育兒顧問</h1>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${initError ? 'bg-red-400' : 'bg-green-400 animate-pulse'}`}></span>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{initError ? 'OFFLINE' : 'ONLINE'}</p>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {initError && (
        <div className="m-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-fade-in">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
          <div className="text-xs text-red-700 whitespace-pre-wrap leading-relaxed">
            {initError}
          </div>
        </div>
      )}

      {/* Message List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm border border-indigo-100">
                <Bot size={16} />
              </div>
            )}
            
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-500 text-white rounded-tr-none'
                  : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {/* Typing Indicator Animation */}
        {isTyping && (
           <div className="flex items-start gap-2.5">
             <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0 border border-indigo-100">
               <Bot size={16} />
             </div>
             <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
               <div className="flex gap-1.5">
                 <div className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-bounce"></div>
                 <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                 <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Control Area */}
      <div className="p-4 bg-white/50 backdrop-blur-sm border-t border-orange-50">
        <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-sm focus-within:border-indigo-300 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              /**
               * CJK Input Method (IME) Optimization
               * e.nativeEvent.isComposing is true while the user is selecting characters (e.g., in Zhuyin or Pinyin).
               * We only trigger handleSend if isComposing is false to prevent early submission during character selection.
               */
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                handleSend();
              }
            }}
            placeholder={initError ? "Please fix API Key..." : "Ask me anything..."}
            disabled={!!initError}
            className="flex-1 bg-transparent outline-none text-sm py-2 disabled:cursor-not-allowed text-gray-700"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping || !!initError}
            className={`p-2 rounded-full transition-all duration-300 ${
              (input.trim() && !initError) 
                ? 'bg-indigo-500 text-white scale-110 shadow-indigo-200 shadow-lg' 
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};