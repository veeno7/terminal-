// ============================================================
// Chat Interface — Main conversation view
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../hooks/api';
import { Send, Bot, User, ChevronDown, ChevronRight, Brain } from 'lucide-react';

export default function ChatInterface() {
  const { chatMessages, addChatMessage, isTyping, setIsTyping, toggleReasoning } = useStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history on mount
  useEffect(() => {
    api.getChatHistory().then((msgs) => {
      msgs.forEach((msg: any) => addChatMessage(msg));
    }).catch(console.error);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg) return;

    setInput('');
    setIsTyping(true);

    // Optimistically add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: msg,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMsg);

    try {
      const { agentMessage } = await api.sendMessage(msg);
      addChatMessage(agentMessage);
    } catch (err) {
      console.error('Failed to send message:', err);
      addChatMessage({
        id: `err-${Date.now()}`,
        role: 'agent',
        content: 'I encountered an error processing your message. Please try again.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-cortex-border bg-cortex-surface/50">
        <Brain className="w-5 h-5 text-brain-400 brain-glow" />
        <h1 className="text-lg font-semibold">CortexForge</h1>
        <span className="text-xs text-cortex-muted ml-2">— Autonomous AI Agent</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-cortex-muted space-y-4">
            <Brain className="w-16 h-16 text-brain-400/30 brain-glow" />
            <p className="text-lg font-medium">CortexForge is ready</p>
            <p className="text-sm max-w-md text-center">
              Your autonomous AI agent is operational. Send a message to start a conversation or give me a goal to work on.
            </p>
          </div>
        )}

        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message-enter flex gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user'
                  ? 'bg-brain-600/20 text-brain-400'
                  : 'bg-cortex-accent/20 text-cortex-accent'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            {/* Message Content */}
            <div className={`flex-1 max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div
                className={`inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brain-600/20 text-cortex-text border border-brain-500/20'
                    : 'bg-cortex-card text-cortex-text border border-cortex-border'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Reasoning toggle (agent messages only) */}
                {msg.role === 'agent' && msg.reasoning && (
                  <div className="mt-2">
                    <button
                      onClick={() => toggleReasoning(msg.id)}
                      className="flex items-center gap-1 text-xs text-cortex-muted hover:text-cortex-accent transition-colors"
                    >
                      {msg.showReasoning ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                      {msg.showReasoning ? 'Hide reasoning' : 'Show reasoning'}
                    </button>

                    {msg.showReasoning && (
                      <div className="reasoning-bubble mt-2 px-3 py-2 rounded text-xs text-cortex-muted leading-relaxed animate-fade-in">
                        <span className="text-cortex-accent font-medium">Reasoning: </span>
                        {msg.reasoning}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 chat-message-enter">
            <div className="w-8 h-8 rounded-full bg-cortex-accent/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-cortex-accent" />
            </div>
            <div className="bg-cortex-card rounded-2xl px-4 py-3 border border-cortex-border">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-cortex-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-cortex-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-cortex-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-cortex-border bg-cortex-surface/50 p-4">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message to CortexForge..."
            rows={1}
            className="flex-1 bg-cortex-card border border-cortex-border rounded-xl px-4 py-3 text-sm text-cortex-text placeholder-cortex-muted resize-none focus:outline-none focus:border-brain-500 focus:ring-1 focus:ring-brain-500/30 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-brain-600 hover:bg-brain-500 disabled:bg-cortex-border disabled:text-cortex-muted text-white rounded-xl px-4 py-3 transition-all disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}