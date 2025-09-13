// utils/flattenDailySchedule.ts
import { FlatLesson } from "./flatLesson";

// dailyScheduleDoc: Firestore から取得した dailySchedules ドキュメント
export const flattenDailySchedule = (dailyScheduleDoc: any): FlatLesson[] => {
    const flatLessons: FlatLesson[] = [];
    const date = dailyScheduleDoc.id.split("_")[1]; // 例: "2025-09-04"

    dailyScheduleDoc.rows.forEach((row: any) => {
        const teacherCode = row.teacher.code;

        Object.entries(row.periods).forEach(([periodKey, lessonsArray]: any) => {
            const period = Number(periodKey.replace("period", "")); // "period1" → 1

            lessonsArray.forEach((lesson: any) => {
                flatLessons.push({
                    date,
                    teacherCode,
                    period,
                    studentId: lesson.studentId,
                    studentName: lesson.name,
                    subject: lesson.subject,
                    classType: lesson.classType,
                    status: lesson.status,
                });
            });
        });
    });

    return flatLessons;
};
