import React, { useState, useRef, useEffect } from 'react';
import { Brain } from 'lucide-react';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';
import { Sidebar } from './components/Sidebar';
import { ModelSelector } from './components/ModelSelector';
import { API_CONFIG } from './config';
import type { ChatState, Message, Conversation } from './types';

const INITIAL_STATE: ChatState = {
  conversations: [],
  currentConversationId: null,
  isLoading: false,
  error: null
};

function createNewConversation(model: string = API_CONFIG.DEFAULT_MODEL): Conversation {
  return {
    id: Date.now().toString(),
    title: 'New Chat',
    model,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

function App() {
  const [state, setState] = useState<ChatState>(INITIAL_STATE);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const currentConversation = state.currentConversationId 
    ? state.conversations.find(c => c.id === state.currentConversationId)
    : null;

  useEffect(() => {
    // Create initial conversation if none exists
    if (state.conversations.length === 0) {
      const newConversation = createNewConversation();
      setState(prev => ({
        ...prev,
        conversations: [newConversation],
        currentConversationId: newConversation.id
      }));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  const handleNewChat = () => {
    const newConversation = createNewConversation();
    setState(prev => ({
      ...prev,
      conversations: [...prev.conversations, newConversation],
      currentConversationId: newConversation.id
    }));
  };

  const handleModelChange = (modelId: string) => {
    if (!state.currentConversationId) return;
    
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv => 
        conv.id === prev.currentConversationId
          ? { ...conv, model: modelId }
          : conv
      )
    }));
  };

  const updateConversationTitle = async (conversationId: string, firstMessage: string) => {
    try {
      const response = await fetch(API_CONFIG.OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: currentConversation?.model || API_CONFIG.DEFAULT_MODEL,
          prompt: `Generate a very brief title (max 4 words) for a conversation that starts with this message: "${firstMessage}". Response should be just the title, nothing else.`
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate title');
      
      const data = await response.json();
      const title = data.response.trim().replace(/["']/g, '');

      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, title }
            : conv
        )
      }));
    } catch (error) {
      console.error('Failed to update conversation title:', error);
    }
  };

  const handleSend = async (content: string) => {
    if (!currentConversation) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv =>
        conv.id === prev.currentConversationId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              updatedAt: Date.now()
            }
          : conv
      ),
      isLoading: true,
      error: null
    }));

    // Update title if this is the first message
    if (currentConversation.messages.length === 0) {
      updateConversationTitle(currentConversation.id, content);
    }

    try {
      const response = await fetch(API_CONFIG.OLLAMA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: currentConversation.model,
          prompt: content,
          stream: false
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(response.status === 404 
          ? `Model ${currentConversation.model} not found. Please ensure it's installed.`
          : 'Failed to connect to Ollama. Please ensure the service is running.');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: Date.now()
      };

      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv =>
          conv.id === prev.currentConversationId
            ? {
                ...conv,
                messages: [...conv.messages, assistantMessage],
                updatedAt: Date.now()
              }
            : conv
        ),
        isLoading: false
      }));
    } catch (error) {
      if (error instanceof Error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.name === 'AbortError' 
            ? 'Request cancelled'
            : error.message || 'Failed to get response'
        }));
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        conversations={state.conversations}
        currentConversationId={state.currentConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={(id) => setState(prev => ({ ...prev, currentConversationId: id }))}
      />

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 py-4">
          <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-semibold">Local AI Chat</h1>
            </div>
            
            <ModelSelector
              currentModel={currentConversation?.model || API_CONFIG.DEFAULT_MODEL}
              onModelChange={handleModelChange}
              disabled={state.isLoading}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            {!currentConversation?.messages.length ? (
              <div className="text-center text-gray-500 mt-8">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-semibold mb-2">Start a New Conversation</h2>
                <p className="mb-2">Using {API_CONFIG.AVAILABLE_MODELS.find(m => m.id === currentConversation?.model)?.name}</p>
                <p className="text-sm">Connected to your local Ollama instance</p>
              </div>
            ) : (
              currentConversation.messages.map(message => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
            {state.isLoading && (
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <div className="animate-pulse">Thinking...</div>
              </div>
            )}
            {state.error && (
              <div className="text-red-500 text-center my-4 p-4 bg-red-50 rounded-lg">
                {state.error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        <ChatInput onSend={handleSend} disabled={state.isLoading} />
      </div>
    </div>
  );
}

export default App;