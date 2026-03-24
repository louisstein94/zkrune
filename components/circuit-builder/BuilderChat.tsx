'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Node, Edge } from 'reactflow';

const chatTransport = new DefaultChatTransport({ api: '/api/ai-circuit' });

interface BuilderChatProps {
  onCircuitGenerated: (nodes: Node[], edges: Edge[], circomCode: string, name: string) => void;
}

export default function BuilderChat({ onCircuitGenerated }: BuilderChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { messages, sendMessage, status } = useChat({
    transport: chatTransport,
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content:
          'Describe what you want to prove and I\'ll design the ZK circuit for you. For example:\n\n• "Prove I have more than 10k tokens"\n• "Age verification without revealing birthday"\n• "Anonymous membership proof"',
        parts: [
          {
            type: 'text' as const,
            text: 'Describe what you want to prove and I\'ll design the ZK circuit for you. For example:\n\n• "Prove I have more than 10k tokens"\n• "Age verification without revealing birthday"\n• "Anonymous membership proof"',
          },
        ],
      },
    ],
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setInputValue('');
    await sendMessage({ text });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  function getToolName(part: any): string {
    if (part.toolName) return part.toolName;
    if (typeof part.type === 'string' && part.type.startsWith('tool-')) return part.type.slice(5);
    return '';
  }

  const handleApplyCircuit = useCallback(
    (input: any) => {
      try {
        const nodes: Node[] = JSON.parse(input.nodes_json);
        const edges: Edge[] = JSON.parse(input.edges_json);
        onCircuitGenerated(nodes, edges, input.circom_code, input.name);
      } catch (err) {
        console.error('Failed to parse circuit data:', err);
      }
    },
    [onCircuitGenerated],
  );

  function renderToolPart(part: any) {
    const toolName = getToolName(part);
    if (toolName !== 'generate_circuit') return null;

    const input = part.input || part.args || {};
    const state = part.state;

    if (state === 'input-streaming') {
      return (
        <div className="mx-3 my-2 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-violet-300">
            <div className="w-3.5 h-3.5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
            Designing circuit...
          </div>
        </div>
      );
    }

    return (
      <div className="mx-3 my-2 space-y-2">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-emerald-300 text-xs font-medium">{input.name || 'Circuit'}</span>
          </div>
          {input.description && (
            <p className="text-zinc-400 text-xs">{input.description}</p>
          )}
          <button
            onClick={() => handleApplyCircuit(input)}
            className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-medium rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Apply to Canvas
          </button>
        </div>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium rounded-2xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 transition-all"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
        AI Circuit Designer
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[520px] flex flex-col bg-zinc-900 border border-zinc-700/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/95">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white text-xs font-semibold">AI Circuit Designer</h3>
            <p className="text-zinc-500 text-[10px]">Describe → Design → Deploy</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-zinc-500 hover:text-white transition-colors p-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-1">
            {msg.parts?.map((part: any, i: number) => {
              if (part.type === 'text' && part.text) {
                return (
                  <div
                    key={`${msg.id}-t-${i}`}
                    className={`${msg.role === 'user' ? 'ml-8' : 'mr-4'}`}
                  >
                    <div
                      className={`px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-violet-600 text-white rounded-br-sm ml-auto'
                          : 'bg-zinc-800/80 text-zinc-300 rounded-bl-sm border border-zinc-700/30'
                      }`}
                    >
                      {part.text}
                    </div>
                  </div>
                );
              }

              const partToolName = (() => {
                if (part.toolName) return part.toolName;
                if (typeof part.type === 'string' && part.type.startsWith('tool-')) return part.type.slice(5);
                return '';
              })();
              if (partToolName || part.type === 'dynamic-tool') {
                return <div key={`${msg.id}-tool-${i}`}>{renderToolPart(part)}</div>;
              }

              return null;
            })}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800/60 rounded-xl rounded-bl-sm border border-zinc-700/30 w-fit">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-1">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your circuit..."
            rows={1}
            className="w-full px-3 py-2.5 pr-10 bg-zinc-800/70 border border-zinc-700/40 rounded-xl text-white text-xs placeholder-zinc-500 resize-none focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
            style={{ minHeight: '38px', maxHeight: '80px' }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md bg-violet-600 text-white hover:bg-violet-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
