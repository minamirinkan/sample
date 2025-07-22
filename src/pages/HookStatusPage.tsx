import React from "react";
import { useAdmins } from "../contexts/hooks/useAdmins";
import { useClassrooms } from "../contexts/hooks/useClassrooms";
import { useCustomersByClassroom } from "../contexts/hooks/useCustomers";
import { useDailySchedules } from "../contexts/hooks/useDailySchedules";
import { usePeriodLabelsByClassroomCode } from "../contexts/hooks/usePeriodLabelsBySchool";
import { useSchoolClosures } from "../contexts/hooks/useSchoolClosures";
import { useStudents } from "../contexts/hooks/useStudents";
import { useSuperadmins } from "../contexts/hooks/useSuperadmins";

import { Admin } from "../contexts/types/admin";
import { Classroom } from "../contexts/types/classroom";
import { Customer } from "../contexts/types/customer";
import { PeriodData, TeacherData, DailyScheduleDocument, DailyScheduleRow } from "../contexts/types/dailySchedule";
import { PeriodLabel } from "../contexts/types/periodLabel";
import { SchoolClosure, SchoolClosureType, SchoolClosuresDocument } from "../contexts/types/schoolClosures";
import { Student } from "../contexts/types/student";
import { Superadmin } from "../contexts/types/superadmin";

import { useState } from "react";

const DebugHooksPage: React.FC = () => {
    const tabs = [
        "admins",
        "classrooms",
        "customers",
        "dailySchedules",
        "periodLabels",
        "closures",
        "students",
        "superadmins",
    ] as const;

    const [activeTab, setActiveTab] = useState<typeof tabs[number]>("admins");

    const hooksData = {
        admins: useAdmins(),
        classrooms: useClassrooms(),
        customers: useCustomersByClassroom(),
        dailySchedules: useDailySchedules(),
        periodLabels: usePeriodLabelsByClassroomCode(),
        closures: useSchoolClosures(new Date().getFullYear().toString()).closures,
        students: useStudents(),
        superadmins: useSuperadmins(),
    };

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-xl font-bold">Hooks デバッグページ</h1>

            <div className="flex space-x-2">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`px-4 py-2 rounded border ${activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-100"}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="mt-4">
                <h2 className="font-semibold">現在: {activeTab}</h2>
                <pre className="bg-gray-100 p-4 rounded text-xs">
                    {JSON.stringify(hooksData[activeTab], null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default DebugHooksPage;
