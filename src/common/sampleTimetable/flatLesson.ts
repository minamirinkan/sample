// src/contexts/types/flatLesson.ts

export type FlatLesson = {
  date: string;         // 日付 (例: "2025-09-04")
  teacherCode: string;  // 担当講師のコード
  period: number;       // 何限目か (1〜8)
  studentId: string;    // 生徒ID
  studentName: string;  // 生徒名
  subject: string;      // 科目
  classType: string;    // 1名クラス / 2名クラス など
  status: string;       // 予定 / 出席 / 欠席など
};
