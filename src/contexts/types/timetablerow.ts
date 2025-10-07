//src/contexts/types/timetablerow.ts

import { Student, RowStudent } from './student';

export type Teacher = {
  code?: string;
  name?: string;
  fullname?: string;
};

export type RowData = {
  teacher: Teacher | null;
  status: string;
  periods: (Student | RowStudent)[][];
};

export type TimetableRowProps = {
  rowIndex: number;
  row: RowData;
  onChange: (index: number, updatedRow: RowData) => void;
  allTeachers: Teacher[];
  allRows: RowData[];
};

export type TimetableCellProps = {
  periodIdx: number;
  students: Student[];
  rowIndex: number;
  row: RowData;
  allRows: RowData[];
  onChange: (rowIndex: number, updatedRow: RowData) => void;
};

export type Period = {
  label: string;
  time: string;
};
