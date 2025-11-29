
import React, { useState } from 'react';
import { queryInsights } from '../services/geminiService';
import { PaperAirplaneIcon, LightBulbIcon } from './icons/Icons';

interface Message {
  type: 'user' | 'ai';
  text: string;
}

const AIInsights: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { type: 'ai', text: 'Dobrý den! Na co se chcete zeptat ohledně vašich projektů, pracovníků nebo úkolů?' }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage: Message = { type: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await queryInsights(query);
      const aiMessage: Message = { type: 'ai', text: response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error querying insights:', error);
      const errorMessage: Message = { type: 'ai', text: 'Omlouvám se, došlo k chybě při zpracování vašeho dotazu.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-3xl font-bold mb-4 text-white">AI Insights</h1>
      
      <div className="flex-grow bg-gray-800 rounded-lg p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.type === 'ai' && <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0"><LightBulbIcon className="w-5 h-5 text-white" /></div>}
            <div className={`max-w-xl p-3 rounded-lg ${msg.type === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
              <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
            </div>
          </div>
        ))}
         {isLoading && (
            <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0"><LightBulbIcon className="w-5 h-5 text-white" /></div>
                <div className="max-w-xl p-3 rounded-lg bg-gray-700 text-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                </div>
            </div>
         )}
      </div>

      <div className="mt-4">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Zeptejte se na cokoliv... (např. 'Který pracovník dokončil nejvíc stolů minulý týden?')"
            className="w-full bg-gray-700 border border-gray-600 rounded-full py-3 pl-4 pr-12 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            disabled={isLoading}
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white bg-indigo-600 rounded-full hover:bg-indigo-700 disabled:bg-indigo-800" disabled={isLoading || !query.trim()}>
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIInsights;
