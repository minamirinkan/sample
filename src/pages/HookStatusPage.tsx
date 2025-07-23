// src/pages/DebugHooksPage.tsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";

import { useSuperAdminData } from "../contexts/providers/SuperAdminDataProvider";
import { useAdminData } from "../contexts/providers/AdminDataProvider";
import { useTeacherData } from "../contexts/providers/TeacherDataProvider";
import { useCustomerData } from "../contexts/providers/CustomerDataProvider";

const superadminTabs = [
    "superadmins",
    "admins",
    "classrooms",
    "customers",
    "students",
    "dailySchedules",
    "closures",
] as const;

const adminTabs = [
    "students",
    "customers",
    "periodLabels",
    "closures",
    "dailySchedules",
] as const;

const teacherTabs = ["students", "dailySchedules"] as const;

const customerTabs = ["customers", "students", "dailySchedules"] as const;

const SuperAdminDebugPage: React.FC = () => {
    const data = useSuperAdminData();
    const [activeTab, setActiveTab] = React.useState<typeof superadminTabs[number]>(superadminTabs[0]);

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-xl font-bold">SuperAdmin Debug Page</h1>
            <TabButtons tabs={superadminTabs} activeTab={activeTab} setActiveTab={setActiveTab} />
            <DataDisplay activeTab={activeTab} data={data} />
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

// 共通コンポーネント：タブボタン群
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

// 共通コンポーネント：データ表示
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
