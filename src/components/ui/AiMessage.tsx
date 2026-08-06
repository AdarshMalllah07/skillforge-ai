'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { useUi } from './UiProvider';

function prefersReducedMotion() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const { toast } = useUi();
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ message: 'Copied to clipboard', variant: 'success' });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ message: 'Copy failed', variant: 'error' });
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-sf-muted hover:text-sf hover:bg-sf-surface-2 transition-colors min-h-8"
      title={label}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : label}
    </button>
  );
}

function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const text = String(children).replace(/\n$/, '');
  const lang = /language-(\w+)/.exec(className || '')?.[1];
  return (
    <div className="relative group my-3 rounded-xl border border-sf overflow-hidden bg-slate-950 text-slate-100">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <span>{lang || 'code'}</span>
        <CopyButton text={text} />
      </div>
      <pre className="p-3 overflow-x-auto text-xs font-mono leading-relaxed">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

export function AiLoadingBubble({ label = 'Gemini is thinking…' }: { label?: string }) {
  return (
    <div className="flex items-start gap-3 max-w-xl">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-sf-glow shrink-0" />
      <div className="flex-1 rounded-2xl border border-sf bg-sf-surface p-4 shadow-sf-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-sf-accent">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
          </span>
          {label}
        </div>
        <div className="space-y-2">
          <div className="h-2.5 rounded-full ai-shimmer w-full" />
          <div className="h-2.5 rounded-full ai-shimmer w-5/6" />
          <div className="h-2.5 rounded-full ai-shimmer w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function AiMessage({
  content,
  typing = false,
  onRegenerate,
  className = '',
}: {
  content: string;
  typing?: boolean;
  onRegenerate?: () => void;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState(typing ? '' : content);

  useEffect(() => {
    if (!typing || prefersReducedMotion()) {
      setDisplayed(content);
      return;
    }
    setDisplayed('');
    let i = 0;
    const step = Math.max(1, Math.ceil(content.length / 120));
    const id = window.setInterval(() => {
      i = Math.min(content.length, i + step);
      setDisplayed(content.slice(0, i));
      if (i >= content.length) window.clearInterval(id);
    }, 16);
    return () => window.clearInterval(id);
  }, [content, typing]);

  const markdown = useMemo(
    () => (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code({ className, children, ...props }) {
            const isBlock = Boolean(className) || String(children).includes('\n');
            if (!isBlock) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-sf-surface-2 text-[12px] font-mono text-sf-accent"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return <CodeBlock className={className}>{children}</CodeBlock>;
          },
          pre({ children }) {
            return <>{children}</>;
          },
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noreferrer" className="text-indigo-500 underline underline-offset-2">
                {children}
              </a>
            );
          },
          ul({ children }) {
            return <ul className="list-disc pl-5 space-y-1 my-2">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 space-y-1 my-2">{children}</ol>;
          },
          p({ children }) {
            return <p className="my-2 leading-relaxed">{children}</p>;
          },
        }}
      >
        {displayed}
      </ReactMarkdown>
    ),
    [displayed]
  );

  return (
    <div className={`rounded-2xl border border-sf bg-sf-surface shadow-sf-sm overflow-hidden ${className}`}>
      <div className="px-4 py-3 text-sm text-sf prose-invert max-w-none">{markdown}</div>
      <div className="px-3 py-2 border-t border-sf bg-sf-surface-2/50 flex items-center justify-end gap-1">
        <CopyButton text={content} label="Copy" />
        {onRegenerate ? (
          <button
            type="button"
            onClick={onRegenerate}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-sf-muted hover:text-sf hover:bg-sf-surface transition-colors min-h-8"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate
          </button>
        ) : null}
      </div>
    </div>
  );
}
