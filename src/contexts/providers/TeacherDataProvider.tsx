import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "../AuthContext";
import { useStudents } from "../hooks/useStudents";
import { useDailySchedules } from "../hooks/useDailySchedules";
import { useClassroom } from "../hooks/useClassroom";
import useTeacher from "../hooks/useTeacher";

const TeacherDataContext = createContext<any>(null);

export const TeacherDataProvider = ({ children }: { children: React.ReactNode }) => {
    const { userData } = useAuth();
    const teacherUid = userData?.uid;
    const teacher = useTeacher(teacherUid ?? '');
    const classroomCode = userData?.classroomCode;
    const classroom = useClassroom(classroomCode);

    // 生徒データと日次スケジュールを取得
    const students = useStudents(classroomCode ?? undefined);
    const dailySchedules = useDailySchedules();

    // value をメモ化して毎回新しいオブジェクトが作られないようにする
    const value = useMemo(() => ({
        classroomCode,
        classroom,
        teacher,
        students,
        dailySchedules,
    }), [classroomCode, classroom, teacher, students, dailySchedules]);

    return (
        <TeacherDataContext.Provider value={value}>
            {children}
        </TeacherDataContext.Provider>
    );
};

export const useTeacherData = () => useContext(TeacherDataContext);
