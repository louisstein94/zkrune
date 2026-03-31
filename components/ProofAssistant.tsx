'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect, useCallback } from 'react';
import { generateClientProof } from '@/lib/clientZkProof';
import { usePublishBlink } from '@/lib/blinks/usePublishBlink';
import { findTemplateById, TEMPLATE_SPECS } from '@/lib/ai/templates';

const chatTransport = new DefaultChatTransport({ api: '/api/ai-chat' });

interface ProofState {
  status: 'idle' | 'generating' | 'success' | 'error';
  templateId?: string;
  params?: Record<string, string>;
  result?: any;
  error?: string;
}

export default function ProofAssistant() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [proofState, setProofState] = useState<ProofState>({ status: 'idle' });
  const { publish, isPublishing, result: blinkResult, error: blinkError, reset: resetBlink } = usePublishBlink();

  const welcomeText = 'Hey! I\'m zkBlink — your zero-knowledge proof builder. Tell me what you want to prove privately, and I\'ll craft the proof for you.\n\nFor example:\n\n- "Prove I\'m over 18"\n- "Show I have more than 10,000 tokens"\n- "I want to vote privately in a DAO"\n- "Prove I\'m a member of a group anonymously"';
  const { messages, sendMessage, status } = useChat({
    transport: chatTransport,
    messages: [
      {
        id: 'welcome',
        role: 'assistant' as const,
        parts: [{ type: 'text' as const, text: welcomeText }],
      },
    ] as import('ai').UIMessage[],
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, proofState]);

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

  const handleGenerateProof = useCallback(async (templateId: string, params: Record<string, string>) => {
    setProofState({ status: 'generating', templateId, params });

    try {
      const circuitInputs: Record<string, string> = {};
      const spec = findTemplateById(templateId);
      if (spec) {
        for (const key of spec.circuitInputKeys) {
          if (params[key] !== undefined) circuitInputs[key] = params[key];
        }
      }

      const result = await generateClientProof(templateId, circuitInputs);

      if (result.success && result.proof) {
        setProofState({ status: 'success', templateId, params, result: result.proof });
      } else {
        setProofState({ status: 'error', templateId, params, error: result.error || 'Proof generation failed' });
      }
    } catch (err: any) {
      setProofState({ status: 'error', templateId, params, error: err.message });
    }
  }, []);

  const handlePublishBlink = useCallback(async () => {
    if (!proofState.result?.groth16Proof || !proofState.templateId || proofState.result.isValid !== true) return;
    const spec = findTemplateById(proofState.templateId);
    await publish({
      circuitName: proofState.templateId,
      proof: proofState.result.groth16Proof,
      publicSignals: proofState.result.publicSignals,
      label: spec ? `${spec.name} — zkRune` : 'zkRune Proof',
      description: 'ZK proof generated via zkBlink',
    });
  }, [proofState, publish]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const quickPrompts = [
    { label: '18+ Proof', prompt: 'I want to prove that I am 18 years old or older' },
    { label: 'Proof of Balance', prompt: 'Prove my balance is more than 10,000 tokens' },
    { label: 'Private Voting', prompt: 'I want to vote privately in a DAO' },
    { label: 'Proof of NFT Ownership', prompt: 'Prove I own an NFT from a collection' },
  ];

  function getToolName(part: any): string {
    if (part.toolName) return part.toolName;
    if (typeof part.type === 'string' && part.type.startsWith('tool-')) return part.type.slice(5);
    return '';
  }

  function renderToolPart(part: any) {
    const toolName = getToolName(part);
    if (toolName === 'prepare_proof') {
      const { templateId, params_json, summary } = part.input || part.args || {};
      if (!templateId) return null;
      const spec = findTemplateById(templateId);
      let params: Record<string, string> | undefined;
      try {
        params = typeof params_json === 'string' ? JSON.parse(params_json) : params_json;
      } catch {
        params = undefined;
      }

      return (
        <div className="flex gap-3 justify-start">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div className="max-w-[85%] space-y-3">
            <div className="bg-zinc-800/70 border border-zinc-700/30 rounded-2xl rounded-bl-md p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 text-xs font-medium px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  {spec?.name || templateId}
                </span>
                {spec && <span className="text-zinc-500 text-xs">{spec.category}</span>}
              </div>
              {summary && <p className="text-zinc-300 text-sm">{summary}</p>}

              {params && (
                <div className="bg-black/30 rounded-xl p-3 space-y-2">
                  <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Parameters</p>
                  {Object.entries(params).map(([key, value]) => {
                    const paramSpec = spec?.params.find(p => p.name === key);
                    return (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-zinc-400">{paramSpec?.label || key}</span>
                        <span className="text-white font-mono">{value as string}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {proofState.status === 'idle' && params && (
                <button
                  onClick={() => handleGenerateProof(templateId, params)}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Generate ZK Proof
                </button>
              )}

              {proofState.status === 'generating' && proofState.templateId === templateId && (
                <div className="w-full py-2.5 bg-zinc-700/50 text-zinc-300 text-sm rounded-xl flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-zinc-500 border-t-emerald-400 rounded-full animate-spin" />
                  Generating proof in browser...
                </div>
              )}

              {proofState.status === 'error' && proofState.templateId === templateId && (
                <div className="space-y-2">
                  <div className="py-2 px-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                    {proofState.error}
                  </div>
                  <button
                    onClick={() => { setProofState({ status: 'idle' }); if (params) handleGenerateProof(templateId, params); }}
                    className="w-full py-2 bg-zinc-700 text-white text-sm rounded-xl hover:bg-zinc-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

            {proofState.status === 'success' && proofState.templateId === templateId && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-emerald-300 text-sm font-medium">Proof Generated!</span>
                  <span className="text-xs px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300">REAL ZK-SNARK</span>
                </div>

                {proofState.result?.proofHash && (
                  <div className="text-xs text-zinc-400">
                    Hash: <span className="font-mono text-zinc-300">{proofState.result.proofHash.substring(0, 24)}...</span>
                  </div>
                )}

                {proofState.result?.note && (
                  <p className="text-xs text-emerald-400/70">{proofState.result.note}</p>
                )}

                {proofState.result?.groth16Proof && !blinkResult && (
                  <button
                    onClick={handlePublishBlink}
                    disabled={isPublishing || proofState.result?.isValid !== true}
                    className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isPublishing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Share as Solana Blink
                      </>
                    )}
                  </button>
                )}

                {blinkError && (
                  <p className="text-xs text-red-400">{blinkError}</p>
                )}

                {blinkError && (
                  <div className="py-2 px-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs whitespace-pre-wrap break-all">
                    {blinkError}
                  </div>
                )}

                {blinkResult && (
                  <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 space-y-2">
                    <p className="text-violet-300 text-xs font-medium">Blink Ready!</p>
                    <div className="bg-black/30 rounded-lg p-2 font-mono text-xs text-violet-300 break-all select-all">
                      {blinkResult.blinkUrl}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => { try { await navigator.clipboard.writeText(blinkResult.blinkUrl); } catch {} }}
                        className="flex-1 py-1.5 bg-violet-600 text-white text-xs rounded-lg hover:bg-violet-500 transition-colors"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => {
                          const spec = proofState.templateId ? findTemplateById(proofState.templateId) : null;
                          const proofLabel = spec?.name || 'ZK proof';
                          const text = encodeURIComponent(
                            `I just generated a ${proofLabel} using @rune_zk — verified entirely in my browser with zero-knowledge cryptography.\n\nVerify it:\n${blinkResult.blinkUrl}`
                          );
                          window.open(`https://x.com/intent/tweet?text=${text}`, '_blank');
                        }}
                        className="px-3 py-1.5 bg-zinc-700 text-white text-xs rounded-lg hover:bg-zinc-600 transition-colors"
                      >
                        Tweet
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => { setProofState({ status: 'idle' }); resetBlink(); }}
                  className="w-full py-2 text-zinc-400 text-xs hover:text-white transition-colors"
                >
                  Generate another proof
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (toolName === 'suggest_templates') {
      const category = (part.input || part.args)?.category;
      const filtered = category
        ? TEMPLATE_SPECS.filter(t => t.category.toLowerCase() === category.toLowerCase())
        : TEMPLATE_SPECS;

      return (
        <div className="flex gap-3 justify-start">
          <div className="w-7 h-7 flex-shrink-0" />
          <div className="grid grid-cols-2 gap-2 max-w-[85%]">
            {filtered.slice(0, 8).map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setInputValue(t.examplePrompts[0]);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="text-left p-3 bg-zinc-800/50 border border-zinc-700/30 rounded-xl hover:border-violet-500/30 hover:bg-zinc-800 transition-all group"
              >
                <p className="text-white text-xs font-medium group-hover:text-violet-300 transition-colors">{t.name}</p>
                <p className="text-zinc-500 text-xs mt-0.5 line-clamp-2">{t.description}</p>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)] bg-zk-darker rounded-2xl border border-zinc-800/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800/50 bg-zinc-900/50">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
        <div>
          <h2 className="text-white font-semibold text-sm">zkBlink</h2>
          <p className="text-zinc-500 text-xs">Create proofs & shareable Blinks through conversation</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-3">
            {msg.parts?.map((part: any, i: number) => {
              if (part.type === 'text' && part.text) {
                return (
                  <div key={`${msg.id}-text-${i}`} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-violet-600 text-white rounded-br-md'
                          : 'bg-zinc-800/70 text-zinc-200 rounded-bl-md border border-zinc-700/30'
                      }`}
                    >
                      {part.text}
                    </div>
                  </div>
                );
              }

              if (part.type?.startsWith('tool-') || part.type === 'dynamic-tool') {
                return <div key={`${msg.id}-tool-${i}`}>{renderToolPart(part)}</div>;
              }

              return null;
            })}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-violet-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-3 bg-zinc-800/70 rounded-2xl rounded-bl-md border border-zinc-700/30">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="px-6 pb-2">
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((qp) => (
              <button
                key={qp.label}
                onClick={() => {
                  setInputValue(qp.prompt);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="px-3 py-1.5 text-xs bg-zinc-800/50 border border-zinc-700/30 text-zinc-400 rounded-full hover:border-violet-500/30 hover:text-violet-300 transition-all"
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-6 pb-5 pt-2">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What do you want to prove?"
            rows={1}
            className="w-full px-4 py-3 pr-12 bg-zinc-800/70 border border-zinc-700/40 rounded-xl text-white text-sm placeholder-zinc-500 resize-none focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
            style={{ minHeight: '44px', maxHeight: '120px' }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
        <p className="text-center text-zinc-600 text-xs mt-2">
          Private inputs never leave your browser. Proofs are generated client-side with snarkjs.
        </p>
      </div>
    </div>
  );
}
