import { useEffect, useRef, useState } from 'react';
import api from '../services/api';

function buildSuggestions(doc) {
  const suggestions = [];
  const ai = doc?.aiExtracted;

  if (ai?.expiryDate) suggestions.push('When does this document expire?');
  if (ai?.holderName) suggestions.push('Who is the document holder?');
  if (ai?.documentType) suggestions.push(`What type of document is this?`);
  if (ai?.keyFields && Object.keys(ai.keyFields).length > 0) {
    suggestions.push('List all key fields from this document');
  }
  suggestions.push('Summarize this document in simple terms');

  return [...new Set(suggestions)].slice(0, 4);
}

function ChatBubble({ role, content, isError }) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[75%] ${
          isUser
            ? 'rounded-br-md bg-navy text-white'
            : isError
              ? 'rounded-bl-md border border-red-200 bg-red-50 text-red-700'
              : 'rounded-bl-md border border-gray-100 bg-gray-50 text-navy'
        }`}
      >
        {!isUser && (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-teal-dark">
            Flowgenix AI
          </p>
        )}
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-md border border-gray-100 bg-gray-50 px-4 py-3">
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-teal/60 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-teal/60 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-teal/60" />
        </div>
      </div>
    </div>
  );
}

export default function DocChat({ documentId, doc }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const suggestions = buildSuggestions(doc);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    setMessages([]);
    setInput('');
  }, [documentId]);

  const sendQuestion = async (question) => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', content: trimmed }]);
    setLoading(true);

    try {
      const data = await api.askDocument(documentId, trimmed);
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', content: data.answer || 'No answer returned.' },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content: err.message || 'Failed to get an answer. Try again.',
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendQuestion(input);
  };

  return (
    <section className="card-light flex flex-col overflow-hidden shadow-card">
      <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal/10">
            <svg className="h-5 w-5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-navy">Ask about this document</h2>
            <p className="text-xs text-gray-500">AI answers from extracted fields & summary</p>
          </div>
        </div>
      </div>

      <div className="flex min-h-[280px] max-h-[420px] flex-1 flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
          {messages.length === 0 && !loading && (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
              <p className="mb-4 max-w-xs text-sm text-gray-500">
                Ask anything about {doc?.aiExtracted?.documentType || 'this document'}.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendQuestion(s)}
                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 transition hover:border-teal/40 hover:bg-teal/5 hover:text-teal-dark"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <ChatBubble key={msg.id} role={msg.role} content={msg.content} isError={msg.isError} />
          ))}

          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {messages.length > 0 && suggestions.length > 0 && !loading && (
          <div className="flex flex-wrap gap-2 border-t border-gray-50 px-4 py-2 sm:px-5">
            {suggestions.slice(0, 2).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sendQuestion(s)}
                className="rounded-full border border-gray-100 bg-white px-2.5 py-1 text-[11px] text-gray-500 transition hover:border-teal/30 hover:text-teal-dark"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 border-t border-gray-100 bg-white p-3 sm:p-4"
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask a question…"
            disabled={loading}
            className="input-field-light max-h-24 min-h-[44px] flex-1 resize-none py-2.5 text-sm disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary shrink-0 px-4 py-2.5 disabled:opacity-50"
            aria-label="Send question"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-navy border-t-transparent" />
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
