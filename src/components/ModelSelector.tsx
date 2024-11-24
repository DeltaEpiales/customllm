import React from 'react';
import { ChevronDown } from 'lucide-react';
import { API_CONFIG } from '../config';
import type { Model } from '../types';

interface ModelSelectorProps {
  currentModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ currentModel, onModelChange, disabled }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const currentModelInfo = API_CONFIG.AVAILABLE_MODELS.find(m => m.id === currentModel);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        <span>{currentModelInfo?.name}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {API_CONFIG.AVAILABLE_MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onModelChange(model.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                currentModel === model.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="font-medium text-gray-900">{model.name}</div>
              <div className="text-sm text-gray-500">{model.description}</div>
              <div className="text-xs text-gray-400 mt-1">Context: {model.contextLength}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}