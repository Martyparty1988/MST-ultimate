import Dexie, { Table } from 'dexie';
import { Worker, Project, SolarTable, TableAssignment, PlanAnnotation, TimeRecord, Attendance, Task, Backup, WorkerSchedule } from './types';

export class MSTUltimateDB extends Dexie {
  workers!: Table<Worker, number>;
  projects!: Table<Project, number>;
  solarTables!: Table<SolarTable, number>;
  tableAssignments!: Table<TableAssignment, number>;
  planAnnotations!: Table<PlanAnnotation, number>;
  timeRecords!: Table<TimeRecord, number>;
  attendance!: Table<Attendance, number>;
  tasks!: Table<Task, number>;
  backups!: Table<Backup, number>;
  workerSchedules!: Table<WorkerSchedule, number>;

  constructor() {
    super('MSTUltimateDB');
    (this as any).version(4).stores({
        workerSchedules: '++id, [workerId+date], projectId',
    });

    (this as any).version(3).stores({
      workers: '++id, name, active',
      projects: '++id, name, status',
      solarTables: '++id, projectId, baseNumber, status, statusUpdatedAt',
      tableAssignments: '++id, tableId, *workerIds',
      planAnnotations: '++id, projectId',
      timeRecords: '++id, projectId, workerId, createdAt',
      attendance: '++id, &[workerId+date]',
      tasks: '++id, projectId, status, *assigneeIds',
      backups: '++id, createdAt',
      workerSchedules: '++id, &[workerId+date], projectId',
    });

    (this as any).version(2).stores({
      workers: '++id, name, active',
      projects: '++id, name, status',
      solarTables: '++id, projectId, baseNumber, status',
      tableAssignments: '++id, tableId, *workerIds',
      planAnnotations: '++id, projectId',
      timeRecords: '++id, projectId, workerId, createdAt',
      attendance: '++id, &[workerId+date]',
      tasks: '++id, projectId, status, *assigneeIds',
      backups: '++id, createdAt',
      workerSchedules: '++id, &[workerId+date], projectId',
    }).upgrade((tx: any) => {
        // This is a new table, no data migration needed from version 1
    });
    
    (this as any).version(1).stores({
      workers: '++id, name, active',
      projects: '++id, name, status',
      solarTables: '++id, projectId, baseNumber, status',
      tableAssignments: '++id, tableId, *workerIds',
      planAnnotations: '++id, projectId',
      timeRecords: '++id, projectId, workerId, createdAt',
      attendance: '++id, &[workerId+date]',
      tasks: '++id, projectId, status, *assigneeIds',
      backups: '++id, createdAt',
    });
  }

  async seed() {
    const projectCount = await this.projects.count();
    if (projectCount > 0) return;

    console.log("Seeding database...");

    const workerIds = await this.workers.bulkAdd([
      { name: 'Roman', active: true, color: '#ef4444' }, // red
      { name: 'Jirka', active: true, color: '#3b82f6' }, // blue
      { name: 'Martin', active: true, color: '#22c55e' }, // green
    ], { allKeys: true }) as number[];

    const projectIds = await this.projects.bulkAdd([
      { name: 'Krekenava', status: 'Active', site: 'Krekenava, Lithuania', createdAt: Date.now() - (30 * 86400000), color: '#8b5cf6' }, // violet - created 30 days ago
      { name: 'Zarasai', status: 'Active', site: 'Zarasai, Lithuania', createdAt: Date.now(), color: '#f97316' }, // orange
    ], { allKeys: true }) as number[];

    const solarTablesToAdd: SolarTable[] = [];
    for (let i = 1; i <= 50; i++) {
        solarTablesToAdd.push({
            projectId: projectIds[0],
            baseNumber: i,
            type: 'small',
            x: (i % 10) * 50,
            y: Math.floor(i / 10) * 80,
            status: 'pending',
        });
    }
     for (let i = 1; i <= 30; i++) {
        solarTablesToAdd.push({
            projectId: projectIds[1],
            baseNumber: i,
            type: 'medium',
            x: (i % 5) * 80,
            y: Math.floor(i / 5) * 100,
            status: 'pending',
        });
    }
    await this.solarTables.bulkAdd(solarTablesToAdd);

     await this.tasks.bulkAdd([
      { projectId: projectIds[0], title: 'Doplnit svorky', assigneeIds: [workerIds[0], workerIds[1]], status: 'todo', due: new Date().toISOString() },
      { projectId: projectIds[1], title: 'Kalibrace invertorů', assigneeIds: [workerIds[2]], status: 'doing', due: new Date(Date.now() + 86400000).toISOString() },
    ]);

    await this.timeRecords.add({
        projectId: projectIds[0],
        workerId: workerIds[1],
        minutes: 480,
        note: 'Příprava materiálu',
        createdAt: Date.now() - 86400000,
    })

    console.log("Database seeded successfully.");
  }
}

export const db = new MSTUltimateDB();

(db as any).on('populate', () => db.seed());

(db as any).open().catch((err: any) => {
  console.error(`Failed to open db: ${err.stack || err}`);
});