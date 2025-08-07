import React, { createContext, useContext } from "react";
import { useAuth } from "../AuthContext";
import { useStudents } from "../hooks/useStudents";
import { useDailySchedules } from "../hooks/useDailySchedules";

const TeacherDataContext = createContext<any>(null);

export const TeacherDataProvider = ({ children }: { children: React.ReactNode }) => {
    const { classroomCode, user } = useAuth();
    const teacherUid = user?.uid;

    // 講師の教室コードに基づいて生徒データを取得
    const students = useStudents(classroomCode ?? undefined);
    const dailySchedules = useDailySchedules();

    return (
        <TeacherDataContext.Provider
            value={{
                classroomCode,
                teacherUid,
                students,
                dailySchedules,
                // 他の必要なデータ
            }}
        >
            {children}
        </TeacherDataContext.Provider>
    );
};

export const useTeacherData = () => useContext(TeacherDataContext);
