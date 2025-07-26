import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSuperAdminData } from "../contexts/providers/SuperAdminDataProvider";
import { useAdminData } from "../contexts/providers/AdminDataProvider";
import { useTeacherData } from "../contexts/providers/TeacherDataProvider";
import { useCustomerData } from "../contexts/providers/CustomerDataProvider";
import { useStudents } from "../contexts/hooks/useStudents";
import { useClassrooms } from "../contexts/hooks/useClassrooms";
import { filterStudentsByClassrooms } from "../contexts/utils/filterStudents";
import { useClassroomSelection } from "../contexts/ClassroomSelectionContext";

const superadminTabs = [
    "superadmins",
    "admins",
    "classrooms",
    "customers",
    "students",
    "dailySchedules",
    "closures",
] as const;

const adminTabs = ["students", "customers", "periodLabels", "closures", "dailySchedules"] as const;
const teacherTabs = ["students", "dailySchedules"] as const;
const customerTabs = ["customers", "students", "dailySchedules"] as const;

const SuperAdminDebugPage: React.FC = () => {
    const { admins, adminsLoading } = useSuperAdminData();
    const [activeTab, setActiveTab] = React.useState<typeof superadminTabs[number]>(superadminTabs[0]);
    const [fetchedData, setFetchedData] = React.useState<Record<string, any>>({});
    const { students: allStudents, loading: studentsLoading } = useStudents();
    const { classrooms } = useClassrooms();
    const { selectedClassroomCodes, setSelectedClassroomCodes } = useClassroomSelection();

    // ローディング＆検索済み判定
    const [loading, setLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);

    if (adminsLoading || studentsLoading) {
        return <div className="p-8">読み込み中...</div>;
    }

    const handleCheckboxChange = (code: string) => {
        setSelectedClassroomCodes((prev: string[]) =>
            prev.includes(code) ? prev.filter((c: string) => c !== code) : [...prev, code]
        );
    };

    const handleSearch = async () => {
        setLoading(true);
        setHasSearched(false);

        // 疑似待機（本来はAPIやDB読み込み待ちなど）
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const results: Record<string, any> = {};

        if (selectedClassroomCodes.length > 0) {
            results.students = filterStudentsByClassrooms(allStudents, selectedClassroomCodes);
            results.classrooms = classrooms.filter((c) => selectedClassroomCodes.includes(c.code));
        } else {
            results.students = allStudents;
            results.classrooms = classrooms;
        }

        setFetchedData(results);
        setLoading(false);
        setHasSearched(true);
    };

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-xl font-bold">SuperAdmin Debug Page</h1>
            <div className="space-y-2">
                <p>教室選択:</p>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedClassroomCodes(admins.map((a) => a.classroomCode))}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        全選択
                    </button>
                    <button
                        onClick={() => setSelectedClassroomCodes([])}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        全解除
                    </button>
                </div>
                <div className="flex flex-wrap gap-4">
                    {admins.map((admin: any) => (
                        <label key={admin.classroomCode} className="flex items-center gap-1">
                            <input
                                type="checkbox"
                                value={admin.classroomCode}
                                checked={selectedClassroomCodes.includes(admin.classroomCode)}
                                onChange={() => handleCheckboxChange(admin.classroomCode)}
                            />
                            {admin.name}（{admin.classroomCode}）
                        </label>
                    ))}
                </div>
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className={`mt-2 px-4 py-2 rounded text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {loading ? "検索中…" : hasSearched ? "再検索" : "検索"}
                </button>
            </div>

            {loading ? (
                <p className="mt-4 text-blue-600 font-semibold">検索中…</p>
            ) : hasSearched ? (
                selectedClassroomCodes.length === 0 ? (
                    <p className="text-red-500 mt-4">※ 教室を1つ以上選択してください。</p>
                ) : (
                    <>
                        <TabButtons tabs={superadminTabs} activeTab={activeTab} setActiveTab={setActiveTab} />
                        <DataDisplay activeTab={activeTab} data={fetchedData} />
                    </>
                )
            ) : (
                <p className="text-gray-500 mt-4">検索ボタンを押して結果を表示してください。</p>
            )}
        </div>
    );
};

const AdminDebugPage: React.FC = () => {
    const data = useAdminData();
    const [activeTab, setActiveTab] = React.useState<typeof adminTabs[number]>(adminTabs[0]);

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-xl font-bold">Admin Debug Page</h1>
            <TabButtons tabs={adminTabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            <DataDisplay activeTab={activeTab} data={data} />
        </div>
    );
};

const TeacherDebugPage: React.FC = () => {
    const data = useTeacherData();
    const [activeTab, setActiveTab] = React.useState<typeof teacherTabs[number]>(teacherTabs[0]);

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-xl font-bold">Teacher Debug Page</h1>
            <TabButtons tabs={teacherTabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            <DataDisplay activeTab={activeTab} data={data} />
        </div>
    );
};

const CustomerDebugPage: React.FC = () => {
    const data = useCustomerData();
    const [activeTab, setActiveTab] = React.useState<typeof customerTabs[number]>(customerTabs[0]);

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-xl font-bold">Customer Debug Page</h1>
            <TabButtons tabs={customerTabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            <DataDisplay activeTab={activeTab} data={data} />
        </div>
    );
};

const TabButtons = <T extends string>({
    tabs,
    activeTab,
    setActiveTab,
}: {
    tabs: readonly T[];
    activeTab: T;
    setActiveTab: (tab: T) => void;
}) => (
    <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
            <button
                key={tab}
                className={`px-4 py-2 rounded border ${activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"
                    }`}
                onClick={() => setActiveTab(tab)}
            >
                {tab}
            </button>
        ))}
    </div>
);

const DataDisplay = ({
    activeTab,
    data,
}: {
    activeTab: string;
    data: Record<string, any>;
}) => (
    <div className="mt-4">
        <h2 className="font-semibold">現在: {activeTab}</h2>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
            {JSON.stringify(data?.[activeTab], null, 2) || "データなし"}
        </pre>
    </div>
);

const RoleBasedDebugPage: React.FC = () => {
    const { role } = useAuth();

    switch (role) {
        case "superadmin":
            return <SuperAdminDebugPage />;
        case "admin":
            return <AdminDebugPage />;
        case "teacher":
            return <TeacherDebugPage />;
        case "customer":
            return <CustomerDebugPage />;
        default:
            return <div>権限がありません</div>;
    }
};

export default RoleBasedDebugPage;
