
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useDb } from '../hooks/useDb';
import { TimeRecord } from '../types';

const TimeTracking: React.FC = () => {
  const db = useDb();
  const [workerId, setWorkerId] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [minutes, setMinutes] = useState<string>('');
  const [note, setNote] = useState('');
  
  const { workers, projects, timeRecords } = useLiveQuery(async () => {
    const workers = await db.workers.toArray();
    const projects = await db.projects.toArray();
    const timeRecords = await db.timeRecords.orderBy('createdAt').reverse().limit(10).toArray();
    return { workers, projects, timeRecords };
  }, [db]) ?? {};

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerId || !projectId || !minutes) return;

    await db.timeRecords.add({
      workerId: Number(workerId),
      projectId: Number(projectId),
      minutes: Number(minutes),
      note,
      createdAt: Date.now()
    });

    setWorkerId('');
    setProjectId('');
    setMinutes('');
    setNote('');
  };
  
  const getWorkerName = (id: number) => workers?.find(w => w.id === id)?.name || 'N/A';
  const getProjectName = (id: number) => projects?.find(p => p.id === id)?.name || 'N/A';

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-white">Evidence času</h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-white">Nový záznam</h2>
        <form onSubmit={handleAddRecord} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={workerId} onChange={e => setWorkerId(e.target.value)} required className="bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-4 w-full">
              <option value="">Vyberte pracovníka</option>
              {workers?.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <select value={projectId} onChange={e => setProjectId(e.target.value)} required className="bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-4 w-full">
              <option value="">Vyberte projekt</option>
              {projects?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <input
            type="number"
            value={minutes}
            onChange={e => setMinutes(e.target.value)}
            placeholder="Odpracované minuty"
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-4"
            required
          />
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Poznámka (např. 'Hotové stoly: 28.1, TR 36')"
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-4"
            rows={3}
          />
          <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition">
            Uložit záznam
          </button>
        </form>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold p-6 text-white">Poslední záznamy</h2>
        <ul className="divide-y divide-gray-700">
          {timeRecords?.map(record => (
            <li key={record.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-white">{getWorkerName(record.workerId)} - {getProjectName(record.projectId)}</p>
                <p className="text-sm text-gray-400">{record.note || 'Bez poznámky'}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">{record.minutes} min</p>
                <p className="text-xs text-gray-500">{new Date(record.createdAt).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TimeTracking;
