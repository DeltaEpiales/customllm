import React from 'react';
import { Plus, MessageSquare, Settings } from 'lucide-react';
import { API_CONFIG } from '../config';
import type { Conversation } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
}

export function Sidebar({ 
  conversations, 
  currentConversationId, 
  onNewChat, 
  onSelectConversation 
}: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-800 transition-colors ${
              currentConversationId === conv.id ? 'bg-gray-800' : ''
            }`}
          >
            <MessageSquare className="w-5 h-5 flex-shrink-0" />
            <div className="truncate flex-1">
              <div className="font-medium truncate">{conv.title}</div>
              <div className="text-xs text-gray-400">
                {API_CONFIG.AVAILABLE_MODELS.find(m => m.id === conv.model)?.name}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-800">
        <button className="w-full flex items-center gap-2 text-gray-400 hover:text-white px-4 py-2 rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </div>
    </aside>
  );
}