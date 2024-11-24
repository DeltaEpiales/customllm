export const API_CONFIG = {
  OLLAMA_URL: 'http://localhost:11500/api/generate',
  DEFAULT_MODEL: 'mistral',
  AVAILABLE_MODELS: [
    {
      id: 'mistral',
      name: 'Mistral',
      description: 'Fast and efficient 7B base model',
      contextLength: '8k',
    },
    {
      id: 'llama2',
      name: 'Llama 2',
      description: "Meta's general-purpose chat model",
      contextLength: '4k',
    },
    {
      id: 'codellama',
      name: 'Code Llama',
      description: 'Specialized for programming tasks',
      contextLength: '16k',
    },
  ],
};
