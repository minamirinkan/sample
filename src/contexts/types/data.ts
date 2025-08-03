// types/date.ts
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
    date?: number;  // ❗undefined 許容
    weekday: string;
  };