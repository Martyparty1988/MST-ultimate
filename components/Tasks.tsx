
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useDb } from '../hooks/useDb';
import { Task, TaskStatus } from '../types';

const Tasks: React.FC = () => {
  const db = useDb();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const { tasks, projects, workers } = useLiveQuery(async () => {
    const tasks = await db.tasks.orderBy('status').toArray();
    const projects = await db.projects.toArray();
    const workers = await db.workers.toArray();
    return { tasks, projects, workers };
  }, [db]) ?? {};

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await db.tasks.add({ title: newTaskTitle, status: 'todo' });
    setNewTaskTitle('');
  };

  const updateTaskStatus = (task: Task, status: TaskStatus) => {
    db.tasks.update(task.id!, { status });
  };
  
  const getProjectName = (id?: number) => projects?.find(p => p.id === id)?.name || 'N/A';
  const getWorkerNames = (ids?: number[]) => {
    if (!ids) return 'N/A';
    return workers?.filter(w => ids.includes(w.id!)).map(w => w.name).join(', ') || 'N/A';
  }

  const getStatusClasses = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'border-l-4 border-blue-500';
      case 'doing': return 'border-l-4 border-yellow-500';
      case 'done': return 'border-l-4 border-green-500 text-gray-500 line-through';
      default: return '';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-white">Úkoly</h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-white">Nový úkol</h2>
        <form onSubmit={handleAddTask} className="flex gap-4">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Co je potřeba udělat?"
            className="flex-grow bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-4 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <button type="submit" className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition">
            Přidat úkol
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {tasks?.map(task => (
          <div key={task.id} className={`bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-between ${getStatusClasses(task.status)}`}>
            <div>
              <p className="font-semibold text-white">{task.title}</p>
              <div className="text-sm text-gray-400 mt-1 flex gap-4">
                  <span>Projekt: {getProjectName(task.projectId)}</span>
                  <span>Přiřazeno: {getWorkerNames(task.assigneeIds)}</span>
                  <span>Termín: {task.due ? new Date(task.due).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <select 
                value={task.status} 
                onChange={(e) => updateTaskStatus(task, e.target.value as TaskStatus)}
                className="bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:ring-indigo-500"
              >
                <option value="todo">Todo</option>
                <option value="doing">Doing</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
