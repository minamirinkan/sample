import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "../AuthContext";
import { useStudents } from "../hooks/useStudents";
import useTeachers from "../hooks/useTeachers";
import { useCustomers } from "../hooks/useCustomers";
import { usePeriodLabelsByClassroomCode } from "../hooks/usePeriodLabelsBySchool";
import { useSchoolClosures } from "../hooks/useSchoolClosures";
import { useDailySchedules } from "../hooks/useDailySchedules";
import { useClassroom } from "../hooks/useClassroom";

const AdminDataContext = createContext<any>(null);

export const AdminDataProvider = ({ children }: { children: React.ReactNode }) => {
    // ▼▼▼【変更点 1】▼▼▼
    // すべてのフックをコンポーネントの先頭に集める
    const { userData, loading: isAuthLoading } = useAuth();

    // userDataが存在しない場合に備え、オプショナルチェイニング(?.)で安全にclassroomCodeを取得
    // 最初のレンダリングでは classroomCode は undefined になる
    const classroomCode = userData?.classroomCode;

    // classroomCode が undefined の可能性がある状態でフックを呼び出す
    const classroom = useClassroom(classroomCode);
    const students = useStudents(classroomCode);
    const teachers = useTeachers(classroomCode);
    const customers = useCustomers(undefined, classroomCode);
    const periodLabels = usePeriodLabelsByClassroomCode(classroomCode);
    const currentYear = new Date().getFullYear().toString();
    const { closures, deletedClosures } = useSchoolClosures(currentYear, classroomCode);
    const { schedules } = useDailySchedules();

    const filteredSchedules = useMemo(() => {
        // classroomCode や schedules がまだ無い場合を考慮
        if (!schedules || !classroomCode) {
            return [];
        }
        return schedules.filter((s) => s.id.startsWith(`${classroomCode}_`));
    }, [schedules, classroomCode]);


    // ▼▼▼【変更点 2】▼▼▼
    // すべてのフックを呼び出した後に、条件分岐を行う
    if (isAuthLoading || !userData) {
        return <div>Authenticating...</div>; // ここでアプリ全体のローディング画面などを表示
    }

    // --- この行以降は、isAuthLoadingがfalseで、userDataが存在する場合のみ実行される ---

    const value = {
        userData,
        classroom,
        students,
        teachers,
        customers,
        periodLabels,
        closures,
        deletedClosures,
        dailySchedules: filteredSchedules,
    };

    return (
        <AdminDataContext.Provider value={value}>
            {children}
        </AdminDataContext.Provider>
    );
};

export const useAdminData = () => useContext(AdminDataContext);
