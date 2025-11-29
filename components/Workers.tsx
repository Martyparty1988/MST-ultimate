
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useDb } from '../hooks/useDb';
import { Worker } from '../types';

const Workers: React.FC = () => {
    const db = useDb();
    const [newWorkerName, setNewWorkerName] = useState('');
    const [newWorkerColor, setNewWorkerColor] = useState('#ffffff');
    
    const workers = useLiveQuery(() => db.workers.toArray(), [db]);

    const handleAddWorker = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWorkerName.trim()) return;

        const newWorker: Worker = {
            name: newWorkerName,
            active: true,
            color: newWorkerColor,
        };

        try {
            await db.workers.add(newWorker);
            setNewWorkerName('');
            setNewWorkerColor('#ffffff');
        } catch (error) {
            console.error('Failed to add worker:', error);
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-white">Pracovníci</h1>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-xl font-semibold mb-4 text-white">Přidat pracovníka</h2>
                <form onSubmit={handleAddWorker} className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        value={newWorkerName}
                        onChange={(e) => setNewWorkerName(e.target.value)}
                        placeholder="Jméno pracovníka"
                        className="flex-grow bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-4 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                    <div className="flex items-center gap-2">
                         <label htmlFor="color" className="text-gray-300">Barva:</label>
                        <input
                            type="color"
                            value={newWorkerColor}
                            onChange={(e) => setNewWorkerColor(e.target.value)}
                            className="bg-gray-700 rounded-md"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-150"
                    >
                        Přidat
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {workers?.map(worker => (
                    <div key={worker.id} className="bg-gray-800 p-5 rounded-lg shadow-lg flex items-center space-x-4">
                        <div style={{ backgroundColor: worker.color }} className="w-4 h-4 rounded-full flex-shrink-0"></div>
                        <div>
                           <p className="text-lg font-semibold text-white">{worker.name}</p>
                           <p className={`text-sm ${worker.active ? 'text-green-400' : 'text-red-400'}`}>
                                {worker.active ? 'Aktivní' : 'Neaktivní'}
                           </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Workers;
