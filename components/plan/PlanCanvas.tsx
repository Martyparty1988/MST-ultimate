
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SolarTable, Worker, TableAssignment } from '../../types';
import SolarTableComponent from './SolarTableComponent';

interface PlanCanvasProps {
    tables: SolarTable[];
    workers?: Worker[];
    assignments?: TableAssignment[];
    selectedTableId?: number | null;
    onTableSelect?: (id: number) => void;
}

const PlanCanvas: React.FC<PlanCanvasProps> = ({ tables, workers = [], assignments = [], selectedTableId = null, onTableSelect }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            setScale(prev => Math.min(Math.max(0.1, prev * delta), 4));
        };

        container.addEventListener('wheel', onWheel, { passive: false });
        return () => container.removeEventListener('wheel', onWheel);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };
    
    const assignmentsMap = useMemo(() => {
        const map = new Map<number, number[]>();
        assignments.forEach(a => map.set(a.tableId, a.workerIds));
        return map;
    }, [assignments]);

    const workersMap = useMemo(() => {
        const map = new Map<number, Worker>();
        workers.forEach(w => map.set(w.id!, w));
        return map;
    }, [workers]);

    const getAssignedWorkers = (tableId: number) => {
        const workerIds = assignmentsMap.get(tableId) || [];
        return workerIds.map(id => workersMap.get(id)).filter((w): w is Worker => !!w);
    };

    return (
        <div className="relative w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-inner group select-none">
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-gray-800 p-2 rounded-lg shadow-xl border border-gray-700 opacity-90 hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => setScale(s => Math.min(s + 0.2, 4))} 
                    className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-white font-bold transition-colors"
                    title="Přiblížit"
                >
                    +
                </button>
                <button 
                    onClick={() => { setScale(1); setPosition({x: 50, y: 50}); }} 
                    className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-white text-xs font-bold transition-colors"
                    title="Resetovat pohled"
                >
                    1:1
                </button>
                <button 
                    onClick={() => setScale(s => Math.max(s - 0.2, 0.1))} 
                    className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-white font-bold transition-colors"
                    title="Oddálit"
                >
                    -
                </button>
            </div>

            <div 
                ref={containerRef}
                className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div 
                    style={{ 
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: '0 0',
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                        width: '100%',
                        height: '100%',
                    }}
                >
                    {tables.map(table => (
                        <div 
                            key={table.id}
                            style={{ 
                                position: 'absolute', 
                                left: table.x, 
                                top: table.y, 
                            }}
                        >
                            <SolarTableComponent 
                                table={table}
                                assignedWorkers={getAssignedWorkers(table.id!)}
                                isSelected={table.id === selectedTableId}
                                onClick={onTableSelect}
                            />
                        </div>
                    ))}
                </div>
            </div>
             <div className="absolute bottom-4 left-4 z-10 text-xs text-gray-400 bg-gray-800/80 px-3 py-1 rounded-full pointer-events-none backdrop-blur-sm">
                 Posun: Drag & Drop | Zoom: Kolečko myši
            </div>
        </div>
    );
};

export default PlanCanvas;
