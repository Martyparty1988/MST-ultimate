
export type ProjectStatus = "Active" | "Done" | "Archived";
export type SolarTableStatus = "pending" | "in_progress" | "done";
export type TaskStatus = "todo" | "doing" | "done";
export type AttendanceStatus = "present" | "sick" | "vacation" | "absent";
export type AnnotationKind = "pen" | "eraser" | "shape" | "text";
export type BackupKind = "local" | "gdrive" | "sheets";
export type SolarTableType = "small" | "medium" | "large" | "unknown";

// New settings types
export type AppLanguage = 'cs' | 'en' | 'de';
export type AppTheme = 'dark' | 'light';
export type Currency = 'CZK' | 'EUR';

export interface StringRules {
    small: number;
    medium: number;
    large: number;
}

export interface AppSettings {
    language: AppLanguage;
    theme: AppTheme;
    currency: Currency;
    stringRules: StringRules;
}

export interface Worker {
  id?: number;
  name: string;
  rateHourlyCZK?: number;
  rateTaskCZK?: number;
  active: boolean;
  color?: string;
  // Rates for compatibility with import/export
  rate?: number;
  panelRate?: number;
  cableRateSmall?: number;
  cableRateMedium?: number;
  cableRateLarge?: number;
}

export interface Project {
  id?: number;
  name: string;
  status: ProjectStatus;
  site?: string;
  createdAt: number;
  color?: string;
}

export interface SolarTable {
  id?: number;
  projectId: number;
  baseNumber: number;
  variant?: ".1" | null;
  type: SolarTableType;
  x: number;
  y: number;
  status: SolarTableStatus;
  invGroup?: string | null;
  statusUpdatedAt?: number;
}

export interface TableAssignment {
  id?: number;
  tableId: number;
  workerIds: number[];
  updatedAt: number;
}

export interface PlanAnnotation {
  id?: number;
  projectId: number;
  kind: AnnotationKind;
  data: any;
  createdBy: number;
  createdAt: number;
}

export interface TimeRecord {
  id?: number;
  projectId: number;
  workerId: number;
  start?: number;
  end?: number;
  minutes?: number;
  note?: string;
  // Extended fields for domain logic
  type?: 'hourly' | 'task';
  subType?: 'cables' | 'panels' | 'other';
  tableId?: number;
  taskUnits?: number;
  taskUnitPriceCZK?: number;
  linkedTableIds?: number[];
  createdAt: number;
}

export interface Attendance {
  id?: number;
  workerId: number;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

export interface Task {
  id?: number;
  projectId?: number;
  title: string;
  status: TaskStatus;
  assigneeIds?: number[];
  due?: string; // ISO Date
}

export interface Backup {
  id?: number;
  createdAt: number;
  kind: BackupKind;
  location: string;
  checksum?: string;
}

export interface WorkerSchedule {
  id?: number;
  workerId: number;
  projectId: number;
  date: string; // YYYY-MM-DD
}
