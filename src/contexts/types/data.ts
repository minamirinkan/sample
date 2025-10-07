// types/date.ts
import { Teacher } from './timetablerow'

export type SelectedDate = {
    year: number;
    month: number;
    date: number;
    weekday: string;
    type: 'date' | 'weekday';
  };

export type DateInfo = {
    type: "date" | "weekday";
    year: number;
    month: number;
    date: number;  // ❗undefined 許容
    weekday: string;
  };
  export interface TimetableStudent {
    studentId: string;
    grade: string;
    name: string;
    seat: string;
    subject: string;
    classType: string;
    duration?: string;
    status: string; // "予定" または "振替" など
  }
  
  export interface TimetableRow {
    teacher: Teacher | null;
    periods: TimetableStudent[][];
    status: string;
  }