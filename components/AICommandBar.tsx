
import React, { useState, useRef } from 'react';
import { useDb } from '../hooks/useDb';
import { processCommand } from '../services/geminiService';
import { PaperAirplaneIcon, MicrophoneIcon, SparklesIcon } from './icons/Icons';
import { toast, Toaster } from 'react-hot-toast';

// Define the shape of the function call object locally to avoid import errors
interface FunctionCall {
    name: string;
    args: Record<string, unknown>;
}

const AICommandBar: React.FC = () => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const db = useDb();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAction = async (functionCall: FunctionCall) => {
    const { name, args } = functionCall;

    try {
        if (name === 'createTimeRecord') {
            const project = await db.projects.where('name').equalsIgnoreCase(args.projectName as string).first();
            const worker = await db.workers.where('name').equalsIgnoreCase(args.workerName as string).first();
            if (!project || !worker) throw new Error("Projekt nebo pracovník nenalezen.");
            await db.timeRecords.add({
                projectId: project.id!,
                workerId: worker.id!,
                minutes: args.minutes as number,
                note: args.note as string,
                taskUnits: args.taskUnits as number,
                taskUnitPriceCZK: args.taskUnitPriceCZK as number,
                createdAt: Date.now()
            });
            toast.success(`Časový záznam pro ${args.workerName} v projektu ${args.projectName} byl vytvořen.`);
        } else if (name === 'createTask') {
            let projectId: number | undefined;
            if (args.projectName) {
                const project = await db.projects.where('name').equalsIgnoreCase(args.projectName as string).first();
                if(project) projectId = project.id;
            }

            let assigneeIds: number[] | undefined;
            if(args.assigneeNames && Array.isArray(args.assigneeNames)) {
                // FIX: Corrected Dexie method from 'inAnyOfIgnoreCase' to 'anyOfIgnoreCase'.
                const workers = await db.workers.where('name').anyOfIgnoreCase(args.assigneeNames as string[]).toArray();
                assigneeIds = workers.map(w => w.id!);
            }

            // Handle due date like "tomorrow"
            let dueDate: string | undefined;
            if(args.due) {
                 if((args.due as string).toLowerCase() === 'zítra') {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    dueDate = tomorrow.toISOString().split('T')[0];
                } else {
                    dueDate = new Date(args.due as string).toISOString().split('T')[0];
                }
            }

            await db.tasks.add({
                title: args.title as string,
                projectId,
                assigneeIds,
                due: dueDate,
                status: 'todo',
            });
            toast.success(`Úkol "${args.title}" byl vytvořen.`);
        } else {
            throw new Error(`Neznámá akce: ${name}`);
        }
    } catch (error) {
        console.error("Error executing action:", error);
        toast.error((error as Error).message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    const loadingToast = toast.loading('Zpracovávám příkaz...');

    try {
      const functionCalls = await processCommand(input);
      if (functionCalls) {
        // Force cast to our local interface as we know the shape matches
        for(const call of functionCalls as unknown as FunctionCall[]) {
             await handleAction(call);
        }
        setInput('');
      } else {
         toast.error('Příkazu nebylo porozuměno.');
      }
    } catch (error) {
      console.error('Error processing command:', error);
      toast.error('Došlo k chybě při zpracování příkazu.');
    } finally {
      setIsProcessing(false);
      toast.dismiss(loadingToast);
    }
  };

  return (
    <>
      <Toaster position="bottom-center" reverseOrder={false} />
      <div className="sticky bottom-0 bg-gray-800/80 backdrop-blur-md p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="relative">
          <SparklesIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="AI příkaz (např. 'Zapiš 8 hodin pro Romana na Krekenavě...')"
            disabled={isProcessing}
            className="w-full bg-gray-900 border border-gray-700 rounded-full py-3 pl-10 pr-28 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            <button type="button" className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition" disabled={isProcessing}>
                <MicrophoneIcon className="h-5 w-5" />
            </button>
            <button type="submit" className="p-2 text-white bg-indigo-600 rounded-full hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed transition" disabled={isProcessing || !input.trim()}>
               {isProcessing ? (
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
               ) : (
                   <PaperAirplaneIcon className="h-5 w-5" />
               )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AICommandBar;
