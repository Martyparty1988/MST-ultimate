import React from 'react';
import { SolarTable, SolarTableStatus, Worker } from '../../types';

const getStatusClasses = (status: SolarTableStatus, isSelected: boolean) => {
    let classes = '';
    switch (status) {
        case 'done':
            classes = 'bg-green-500 border-green-300';
            break;
        case 'in_progress':
            classes = 'bg-yellow-500 border-yellow-300 animate-pulse';
            break;
        case 'pending':
        default:
            classes = 'bg-gray-600 border-gray-400';
            break;
    }
    if (isSelected) {
        classes += ' ring-4 ring-indigo-500';
    }
    return classes;
};

interface SolarTableComponentProps {
    table: SolarTable;
    assignedWorkers?: Worker[];
    isSelected?: boolean;
    onClick?: (id: number) => void;
}

const SolarTableComponent: React.FC<SolarTableComponentProps> = ({ table, assignedWorkers = [], isSelected = false, onClick }) => {
    const classes = getStatusClasses(table.status, isSelected);
    
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent canvas drag when selecting a table
        if (onClick) {
            onClick(table.id!);
        }
    };

    return (
        <div 
            onClick={handleClick}
            className={`relative w-10 h-16 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all duration-150 hover:scale-110 ${classes}`}
            title={`Stůl: ${table.baseNumber}${table.variant || ''} - Status: ${table.status}`}
        >
            <span className="text-white font-bold text-sm select-none">
                {table.baseNumber}{table.variant || ''}
            </span>
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex space-x-0.5">
                {assignedWorkers.map(worker => (
                    <div
                        key={worker.id}
                        style={{ backgroundColor: worker.color }}
                        className="w-3 h-3 rounded-full border-2 border-gray-800"
                        title={worker.name}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default SolarTableComponent;