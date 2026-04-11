import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getStoredUser } from '../../utils/api';

const FORMAT_OPTIONS = [
  {
    id: 'short',
    label: 'Short Note',
    description: 'Tight revision bullets and key definitions.',
    accent: '#ff8a3d',
  },
  {
    id: 'long',
    label: 'Long Note',
    description: 'Detailed explanations with structure and study focus.',
    accent: '#f97316',
  },
  {
    id: 'mindmap',
    label: 'Mind Map',
    description: 'Fast concept tree for quick recall.',
    accent: '#fb7185',
  },
];

const STARTER_PROMPTS = [
  'Summarize this lecture into exam-ready notes.',
  'Extract definitions, formulas, and important examples.',
  'Create a mind map with the main topics and subtopics.',
];

const EMPTY_MESSAGE = {
  id: 'assistant-welcome',
  role: 'assistant',
  type: 'text',
  content:
    'Upload a lecture PDF, choose a note style, and I will generate notes here. Your chat history will be saved automatically.',
  timestamp: formatTime(new Date()),
};

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatFullDate(date) {
  return new Date(date).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
  const value = bytes / (1024 ** index);
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${sizes[index]}`;
}

function buildStorageKey(user) {
  const identifier = user?._id || user?.id || user?.email || 'guest';
  return `ai-notes-history:${identifier}`;
}

function buildConversationTitle({ fileName, formatLabel, prompt }) {
  if (prompt?.trim()) {
    return prompt.trim().slice(0, 42);
  }

  const base = fileName?.replace(/\.pdf$/i, '') || 'Untitled lecture';
  return `${formatLabel} · ${base}`.slice(0, 42);
}

function createConversation() {
  const now = new Date().toISOString();
  return {
    id: `conversation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: 'New AI note',
    createdAt: now,
    updatedAt: now,
    lastFormat: 'short',
    messages: [EMPTY_MESSAGE],
  };
}

function buildNoteContent({ file, format, prompt }) {
  const title = file.name.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ');
  const topic = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6)
    .join(' ');
  const focus = prompt?.trim() || 'Turn the uploaded lecture into student-friendly notes.';

  if (format === 'short') {
    return [
      `# Short Note: ${title}`,
      '',
      '## Snapshot',
      `${topic || 'This lecture'} introduces the main ideas students should revise first before moving into deeper explanation.`,
      '',
      '## Key Points',
      `- Define the central concept behind ${topic || 'the lecture topic'}.`,
      '- Identify the main process, framework, or method mentioned.',
      '- Note the examples, use cases, and lecturer emphasis.',
      '- Mark any formulas, diagrams, or classifications worth memorizing.',
      '',
      '## Quick Revision Plan',
      '- Memorize the main definitions.',
      '- Explain each subtopic in 2 or 3 sentences.',
      '- Revisit the original PDF and fill missing examples.',
      '',
      `Prompt focus: ${focus}`,
    ].join('\n');
  }

  if (format === 'long') {
    return [
      `# Long Note: ${title}`,
      '',
      '## Overview',
      `${topic || 'This lecture'} should be understood as a connected topic, where the definitions, stages, and applications support each other.`,
      '',
      '## Expanded Notes',
      `1. Introduce the main idea of ${topic || 'the lecture'} and explain why it matters.`,
      '2. Break the lecture into subtopics, steps, or categories.',
      '3. Add examples, comparisons, benefits, limitations, and lecturer explanations.',
      '4. Include formulas, workflows, or diagrams that could appear in exams.',
      '',
      '## Likely Exam Areas',
      '- Definitions and theory questions.',
      '- Process or model-based explanations.',
      '- Advantages, disadvantages, and practical applications.',
      '- Comparison questions and structured long answers.',
      '',
      '## Study Workflow',
      '- Read once for structure.',
      '- Convert each section into recall cards.',
      '- Practice one short answer and one long answer from each subtopic.',
      '',
      `Prompt focus: ${focus}`,
    ].join('\n');
  }

  return [
    `# Mind Map: ${title}`,
    '',
    `${topic || 'Lecture Topic'}`,
    '├─ Foundation',
    '│  ├─ Definition',
    '│  ├─ Purpose',
    '│  └─ Key terminology',
    '├─ Main Concepts',
    '│  ├─ Topic 1',
    '│  ├─ Topic 2',
    '│  └─ Topic 3',
    '├─ Support',
    '│  ├─ Examples',
    '│  ├─ Formulas / diagrams',
    '│  └─ Real-world applications',
    '└─ Revision',
    '   ├─ Definitions to memorize',
    '   ├─ Questions to practice',
    '   └─ Compare / contrast areas',
    '',
    `Prompt focus: ${focus}`,
  ].join('\n');
}

function AINotes() {
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);
  const user = useMemo(() => getStoredUser(), []);
  const storageKey = useMemo(() => buildStorageKey(user), [user]);

  const [selectedFormat, setSelectedFormat] = useState('short');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompactLayout, setIsCompactLayout] = useState(() => window.innerWidth < 1120);
  const [history, setHistory] = useState(() => [createConversation()]);
  const [activeConversationId, setActiveConversationId] = useState(() => null);
  const [hasHydratedHistory, setHasHydratedHistory] = useState(false);
  const [pendingDeleteConversationId, setPendingDeleteConversationId] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        const fresh = createConversation();
        setHistory([fresh]);
        setActiveConversationId(fresh.id);
        setHasHydratedHistory(true);
        return;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const fresh = createConversation();
        setHistory([fresh]);
        setActiveConversationId(fresh.id);
        setHasHydratedHistory(true);
        return;
      }

      setHistory(parsed);
      setActiveConversationId(parsed[0].id);
      setHasHydratedHistory(true);
    } catch {
      const fresh = createConversation();
      setHistory([fresh]);
      setActiveConversationId(fresh.id);
      setHasHydratedHistory(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (hasHydratedHistory && history.length) {
      localStorage.setItem(storageKey, JSON.stringify(history));
    }
  }, [hasHydratedHistory, history, storageKey]);

  useEffect(() => {
    const handleResize = () => setIsCompactLayout(window.innerWidth < 1120);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, [activeConversationId, history, isGenerating]);

  const activeConversation =
    history.find((item) => item.id === activeConversationId) || history[0] || createConversation();

  const activeMessages = activeConversation?.messages || [EMPTY_MESSAGE];
  const activeFormat = FORMAT_OPTIONS.find((option) => option.id === selectedFormat) || FORMAT_OPTIONS[0];

  const saveConversationPatch = (conversationId, updater) => {
    setHistory((current) =>
      current.map((conversation) =>
        conversation.id === conversationId ? updater(conversation) : conversation
      )
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    );
  };

  const handleCreateConversation = () => {
    const fresh = createConversation();
    setHistory((current) => [fresh, ...current]);
    setActiveConversationId(fresh.id);
    setUploadedFile(null);
    setPrompt('');
    setSelectedFormat('short');
  };

  const handleDeleteConversation = (conversationId) => {
    setPendingDeleteConversationId(conversationId);
  };

  const confirmDeleteConversation = () => {
    const conversationId = pendingDeleteConversationId;
    if (!conversationId) return;

    setHistory((current) => {
      const next = current.filter((item) => item.id !== conversationId);
      if (next.length) {
        if (activeConversationId === conversationId) {
          setActiveConversationId(next[0].id);
        }
        return next;
      }

      const fresh = createConversation();
      setActiveConversationId(fresh.id);
      return [fresh];
    });

    setPendingDeleteConversationId(null);
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      window.alert('Please upload a PDF file.');
      return;
    }

    setUploadedFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFileSelect(event.dataTransfer.files?.[0]);
  };

  const handleConversationSwitch = (conversation) => {
    setActiveConversationId(conversation.id);
    setSelectedFormat(conversation.lastFormat || 'short');
    setUploadedFile(null);
    setPrompt('');
  };

  const handleSend = async () => {
    if (!uploadedFile) {
      window.alert('Please upload a lecture PDF first.');
      return;
    }

    const outgoingPrompt =
      prompt.trim() || `Create a ${activeFormat.label.toLowerCase()} from this lecture PDF.`;
    const now = new Date().toISOString();
    const title = buildConversationTitle({
      fileName: uploadedFile.name,
      formatLabel: activeFormat.label,
      prompt: outgoingPrompt,
    });

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      type: 'request',
      content: outgoingPrompt,
      file: {
        name: uploadedFile.name,
        size: uploadedFile.size,
      },
      format: activeFormat.label,
      timestamp: formatTime(now),
    };

    saveConversationPatch(activeConversation.id, (conversation) => ({
      ...conversation,
      title,
      updatedAt: now,
      lastFormat: selectedFormat,
      messages: [...conversation.messages, userMessage],
    }));

    setPrompt('');
    setIsGenerating(true);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const assistantMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      type: 'text',
      content: buildNoteContent({
        file: uploadedFile,
        format: selectedFormat,
        prompt: outgoingPrompt,
      }),
      timestamp: formatTime(new Date()),
    };

    saveConversationPatch(activeConversation.id, (conversation) => ({
      ...conversation,
      updatedAt: new Date().toISOString(),
      lastFormat: selectedFormat,
      messages: [...conversation.messages, assistantMessage],
    }));

    setIsGenerating(false);
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 48px)',
        display: 'grid',
        gridTemplateColumns: isCompactLayout ? '1fr' : '330px minmax(0, 1fr)',
        gap: '22px',
        padding: '20px',
        background:
          'radial-gradient(circle at top left, rgba(255, 173, 92, 0.35), transparent 18%), radial-gradient(circle at top right, rgba(251, 113, 133, 0.18), transparent 22%), linear-gradient(180deg, #fff8f1 0%, #eef4ff 56%, #edf6f2 100%)',
      }}
    >
      <aside
        style={{
          order: isCompactLayout ? 2 : 1,
          borderRadius: '32px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,246,237,0.98) 56%, rgba(249,250,255,0.98) 100%)',
          color: '#1f2937',
          padding: '22px',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 28px 90px rgba(148, 163, 184, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -30,
            width: '180px',
            height: '180px',
            borderRadius: '999px',
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.22) 0%, rgba(249, 115, 22, 0) 72%)',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '18px',
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, #ffb36b 0%, #f97316 58%, #fb7185 100%)',
              color: '#1f2937',
              fontWeight: 900,
              letterSpacing: '0.08em',
              marginBottom: '14px',
            }}
          >
            AI
          </div>
          <h1 style={{ margin: 0, fontSize: '27px', lineHeight: 1.05, letterSpacing: '-0.04em' }}>
            Lecture Notes Studio
          </h1>
          <p style={{ margin: '10px 0 0', color: '#6b7280', lineHeight: 1.6 }}>
            Upload lecture PDFs, generate notes in chat, and reopen every saved session later.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '10px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              borderRadius: '18px',
              padding: '14px',
              background: 'rgba(255,255,255,0.72)',
              border: '1px solid rgba(251, 146, 60, 0.18)',
            }}
          >
            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Chats
            </div>
            <div style={{ marginTop: '8px', fontSize: '26px', fontWeight: 800, color: '#111827' }}>{history.length}</div>
          </div>
          <div
            style={{
              borderRadius: '18px',
              padding: '14px',
              background: 'rgba(255,255,255,0.72)',
              border: '1px solid rgba(251, 146, 60, 0.18)',
            }}
          >
            <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Active
            </div>
            <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: 800, color: '#111827' }}>{activeFormat.label}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreateConversation}
          style={{
            border: 'none',
            borderRadius: '18px',
            padding: '15px 16px',
            background: 'linear-gradient(135deg, #fff5eb 0%, #ffd3b0 100%)',
            color: '#7c2d12',
            fontWeight: 800,
            cursor: 'pointer',
            position: 'relative',
            zIndex: 1,
          }}
        >
          + New chat
        </button>

        <div
          style={{
            borderRadius: '24px',
            background: 'rgba(255,255,255,0.72)',
            border: '1px solid rgba(251, 146, 60, 0.16)',
            padding: '16px',
            display: 'grid',
            gap: '10px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#94a3b8' }}>
            Output Style
          </div>
          {FORMAT_OPTIONS.map((option) => {
            const active = option.id === selectedFormat;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedFormat(option.id)}
                style={{
                  textAlign: 'left',
                  borderRadius: '16px',
                  border: active ? `1px solid ${option.accent}` : '1px solid rgba(148, 163, 184, 0.16)',
                  background: active ? 'rgba(255, 237, 213, 0.7)' : '#ffffff',
                  color: '#111827',
                  padding: '14px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <span style={{ fontWeight: 700 }}>{option.label}</span>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '999px',
                      background: option.accent,
                    }}
                  />
                </div>
                <div style={{ marginTop: '6px', color: '#6b7280', fontSize: '13px', lineHeight: 1.5 }}>
                  {option.description}
                </div>
              </button>
            );
          })}
        </div>

        <div
          style={{
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#94a3b8', marginBottom: '12px' }}>
            Saved History
          </div>
          <div style={{ display: 'grid', gap: '10px', overflowY: 'auto', paddingRight: '4px' }}>
            {history.map((conversation) => {
              const active = conversation.id === activeConversationId;

              return (
                <div
                  key={conversation.id}
                  style={{
                    borderRadius: '18px',
                    background: active ? 'rgba(255, 237, 213, 0.72)' : 'rgba(255,255,255,0.78)',
                    border: active ? '1px solid rgba(249, 115, 22, 0.3)' : '1px solid rgba(148, 163, 184, 0.14)',
                    padding: '14px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleConversationSwitch(conversation)}
                    style={{
                      display: 'block',
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      color: '#111827',
                      textAlign: 'left',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700, lineHeight: 1.4 }}>{conversation.title}</div>
                    <div style={{ marginTop: '6px', fontSize: '12px', color: '#6b7280' }}>
                      {formatFullDate(conversation.updatedAt)}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteConversation(conversation.id)}
                    style={{
                      marginTop: '10px',
                      border: 'none',
                      background: '#fff1f2',
                      color: '#e11d48',
                      borderRadius: '999px',
                      padding: '7px 10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      <main
        style={{
          order: 1,
          minWidth: 0,
          borderRadius: '36px',
          background: 'rgba(255,255,255,0.72)',
          border: '1px solid rgba(255,255,255,0.7)',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 30px 100px rgba(148, 163, 184, 0.24)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateRows: 'auto minmax(0, 1fr) auto',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 15% 0%, rgba(255, 184, 113, 0.24), transparent 26%), radial-gradient(circle at 100% 10%, rgba(59, 130, 246, 0.14), transparent 22%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            padding: '24px 26px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.16em', color: '#f97316', fontWeight: 800 }}>
              AI Notes Workspace
            </div>
            <h2 style={{ margin: '8px 0 0', fontSize: '30px', color: '#0f172a', letterSpacing: '-0.05em' }}>
              {activeConversation.title}
            </h2>
            <p style={{ margin: '8px 0 0', color: '#64748b', lineHeight: 1.6 }}>
              Upload a lecture PDF, send prompts like ChatGPT, and keep every study conversation saved.
            </p>
          </div>

          <div
            style={{
              borderRadius: '999px',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.88)',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              color: '#475569',
              fontWeight: 700,
            }}
          >
            Mode: {activeFormat.label}
          </div>
        </div>

        <div
          ref={scrollRef}
          style={{
            overflowY: 'auto',
            padding: '26px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {!uploadedFile && activeMessages.length <= 1 && (
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                borderRadius: '34px',
                border: isDragging ? '2px solid #f97316' : '2px dashed rgba(148, 163, 184, 0.35)',
                background: isDragging
                  ? 'linear-gradient(180deg, rgba(255,237,213,0.95) 0%, rgba(255,255,255,0.92) 100%)'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)',
                padding: '44px 32px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
              }}
            >
              <div
                style={{
                  width: '78px',
                  height: '78px',
                  borderRadius: '26px',
                  margin: '0 auto 18px',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'linear-gradient(135deg, #ffca8e 0%, #f97316 50%, #fb7185 100%)',
                  color: '#fff',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  boxShadow: '0 18px 36px rgba(249, 115, 22, 0.3)',
                }}
              >
                PDF
              </div>
              <h3 style={{ margin: 0, fontSize: '28px', color: '#0f172a', letterSpacing: '-0.04em' }}>
                Drop your lecture PDF to start
              </h3>
              <p style={{ margin: '12px auto 0', maxWidth: '720px', color: '#64748b', lineHeight: 1.75 }}>
                This is the student AI note bot. Upload one lecture file, choose a format, ask for a summary,
                long note, or mind map, and the chat will stay in your saved history.
              </p>
            </div>
          )}

          {uploadedFile && (
            <div
              style={{
                width: 'min(100%, 780px)',
                alignSelf: 'center',
                borderRadius: '22px',
                padding: '16px 18px',
                background: 'linear-gradient(135deg, #fff7ed 0%, #ffe7cf 100%)',
                border: '1px solid #fdba74',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#c2410c', fontWeight: 800 }}>
                  Uploaded Lecture
                </div>
                <div style={{ marginTop: '6px', fontSize: '17px', fontWeight: 800, color: '#7c2d12' }}>
                  {uploadedFile.name}
                </div>
                <div style={{ marginTop: '4px', color: '#9a3412' }}>{formatBytes(uploadedFile.size)}</div>
              </div>

              <button
                type="button"
                onClick={() => setUploadedFile(null)}
                style={{
                  border: 'none',
                  borderRadius: '999px',
                  padding: '10px 14px',
                  background: '#fff',
                  color: '#9a3412',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Remove PDF
              </button>
            </div>
          )}

          {activeMessages.map((message) => {
            const isAssistant = message.role === 'assistant';

            return (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: isAssistant ? 'flex-start' : 'flex-end',
                }}
              >
                <div
                  style={{
                    width: 'min(100%, 780px)',
                    borderRadius: isAssistant ? '26px' : '24px',
                    background: isAssistant
                      ? 'rgba(255,255,255,0.92)'
                      : 'linear-gradient(135deg, #f97316 0%, #ea580c 62%, #fb7185 100%)',
                    color: isAssistant ? '#0f172a' : '#fff',
                    border: isAssistant ? '1px solid rgba(148, 163, 184, 0.16)' : 'none',
                    boxShadow: isAssistant
                      ? '0 16px 36px rgba(148, 163, 184, 0.12)'
                      : '0 24px 46px rgba(249, 115, 22, 0.28)',
                    padding: '20px 22px',
                  }}
                >
                  {!isAssistant && message.file && (
                    <div
                      style={{
                        marginBottom: '14px',
                        borderRadius: '16px',
                        background: 'rgba(255,255,255,0.14)',
                        padding: '12px 14px',
                      }}
                    >
                      <div style={{ fontWeight: 800 }}>{message.file.name}</div>
                      <div style={{ marginTop: '4px', fontSize: '13px', color: 'rgba(255,255,255,0.82)' }}>
                        {message.format} · {formatBytes(message.file.size)}
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.75,
                      fontSize: '15px',
                      fontFamily: isAssistant
                        ? '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace'
                        : 'inherit',
                    }}
                  >
                    {message.content}
                  </div>

                  <div
                    style={{
                      marginTop: '14px',
                      fontSize: '12px',
                      color: isAssistant ? '#94a3b8' : 'rgba(255,255,255,0.76)',
                    }}
                  >
                    {isAssistant ? 'AI Notes Bot' : 'You'} · {message.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isGenerating && (
            <div style={{ width: 'min(100%, 780px)' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(148, 163, 184, 0.18)',
                  boxShadow: '0 12px 28px rgba(148, 163, 184, 0.12)',
                  color: '#475569',
                  fontWeight: 700,
                }}
              >
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '999px',
                    background: '#f97316',
                    boxShadow: '18px 0 0 #fb923c, 36px 0 0 #fdba74',
                  }}
                />
                <span style={{ paddingLeft: '40px' }}>
                  Generating {activeFormat.label.toLowerCase()}...
                </span>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            padding: '20px 22px 22px',
            borderTop: '1px solid rgba(148, 163, 184, 0.18)',
            background: 'rgba(255,255,255,0.45)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              borderRadius: '30px',
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              boxShadow: '0 18px 44px rgba(148, 163, 184, 0.12)',
              padding: '14px',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => handleFileSelect(event.target.files?.[0])}
              style={{ display: 'none' }}
            />

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: 'none',
                  borderRadius: '18px',
                  padding: '14px 16px',
                  minWidth: '112px',
                  background: 'linear-gradient(135deg, #fff4e8 0%, #ffd9bb 100%)',
                  color: '#9a3412',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                + PDF
              </button>

              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Ask the AI note bot what to create from this lecture PDF..."
                rows={1}
                style={{
                  flex: 1,
                  minWidth: '250px',
                  minHeight: '58px',
                  resize: 'none',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: '#0f172a',
                  fontSize: '15px',
                  lineHeight: 1.65,
                  padding: '10px 2px',
                  fontFamily: 'inherit',
                }}
              />

              <button
                type="button"
                onClick={handleSend}
                disabled={isGenerating || !uploadedFile}
                style={{
                  border: 'none',
                  borderRadius: '18px',
                  padding: '15px 20px',
                  minWidth: '126px',
                  background: isGenerating || !uploadedFile
                    ? '#cbd5e1'
                    : 'linear-gradient(135deg, #f97316 0%, #ea580c 62%, #fb7185 100%)',
                  color: '#fff',
                  fontWeight: 800,
                  cursor: isGenerating || !uploadedFile ? 'not-allowed' : 'pointer',
                  boxShadow: isGenerating || !uploadedFile ? 'none' : '0 18px 32px rgba(249, 115, 22, 0.24)',
                }}
              >
                Send
              </button>
            </div>

            <div
              style={{
                marginTop: '12px',
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                color: '#64748b',
                fontSize: '13px',
              }}
            >
              <span>Mode: {activeFormat.label}</span>
              <span>•</span>
              <span>{uploadedFile ? `${uploadedFile.name} ready` : 'Upload a lecture PDF to begin'}</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
              {STARTER_PROMPTS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPrompt(item)}
                  style={{
                    border: '1px solid rgba(148, 163, 184, 0.18)',
                    borderRadius: '999px',
                    padding: '9px 12px',
                    background: '#fff',
                    color: '#475569',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {pendingDeleteConversationId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.2)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '20px',
          }}
          onClick={() => setPendingDeleteConversationId(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              borderRadius: '28px',
              background: '#ffffff',
              border: '1px solid #e6e8ee',
              boxShadow: '0 28px 80px rgba(15, 23, 42, 0.14)',
              padding: isCompactLayout ? '28px 20px' : '34px 36px 38px',
              textAlign: 'center',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                width: isCompactLayout ? '82px' : '108px',
                height: isCompactLayout ? '82px' : '108px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                background: 'linear-gradient(135deg, #ff7a18 0%, #ff6400 100%)',
                color: '#ffffff',
                fontSize: isCompactLayout ? '40px' : '50px',
                fontWeight: 800,
                boxShadow: '0 18px 38px rgba(249, 115, 22, 0.22)',
              }}
            >
              !
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: isCompactLayout ? '28px' : '34px',
                lineHeight: 1.05,
                color: '#25324b',
                letterSpacing: '-0.05em',
                fontWeight: 800,
              }}
            >
              Delete Chat
            </h3>
            <p
              style={{
                margin: '18px auto 0',
                maxWidth: '420px',
                color: '#6b7a96',
                lineHeight: 1.55,
                fontSize: isCompactLayout ? '17px' : '18px',
                fontWeight: 500,
              }}
            >
              Are you sure you want to delete this AI note chat from your saved history?
            </p>

            <div
              style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center',
                marginTop: '28px',
                flexWrap: isCompactLayout ? 'wrap' : 'nowrap',
              }}
            >
              <button
                type="button"
                onClick={() => setPendingDeleteConversationId(null)}
                style={{
                  flex: 1,
                  minWidth: isCompactLayout ? '100%' : '0',
                  border: '1.5px solid #d9e0ec',
                  background: '#f8fafc',
                  color: '#334155',
                  borderRadius: '18px',
                  padding: isCompactLayout ? '16px 18px' : '18px 20px',
                  fontWeight: 700,
                  fontSize: isCompactLayout ? '18px' : '20px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteConversation}
                style={{
                  flex: 1,
                  minWidth: isCompactLayout ? '100%' : '0',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ff7a18 0%, #ff6400 100%)',
                  color: '#fff',
                  borderRadius: '18px',
                  padding: isCompactLayout ? '16px 18px' : '18px 20px',
                  fontWeight: 800,
                  fontSize: isCompactLayout ? '18px' : '20px',
                  cursor: 'pointer',
                  boxShadow: '0 18px 36px rgba(249, 115, 22, 0.24)',
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AINotes;
