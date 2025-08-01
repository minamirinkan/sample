import React from "react";
import { useState } from "react";
import { useSuperAdminData } from "./TestSuperAdminDataProvider"; // 適宜パス調整

const TABS = [
    { key: "userData", label: "ユーザーデータ" },
    { key: "classrooms", label: "教室情報" },
    { key: "students", label: "生徒情報" },
    { key: "customers", label: "保護者情報" },
    { key: "periodLabels", label: "時限ラベル" },
    { key: "closures", label: "休校日" },
    { key: "dailySchedules", label: "時間割" },
];

const AdminTestComponent = () => {
    const {
        userData,
        classrooms,
        students,
        customers,
        periodLabels,
        closures,
        dailySchedules,
    } = useSuperAdminData();

    const dataMap: Record<string, any> = {
        userData,
        classrooms,
        students,
        customers,
        periodLabels,
        closures,
        dailySchedules,
    };

    const [activeTab, setActiveTab] = useState("userData");

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">AdminData テスト（タブ表示）</h2>

            <div className="flex border-b">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        className={`px-4 py-2 -mb-px border-b-2 ${activeTab === tab.key
                                ? "border-blue-500 text-blue-600 font-semibold"
                                : "border-transparent text-gray-500 hover:text-blue-500"
                            }`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="mt-4 bg-gray-100 p-4 rounded shadow-inner overflow-auto max-h-[600px]">
                <pre className="text-sm whitespace-pre-wrap break-words">
                    {JSON.stringify(dataMap[activeTab], null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default AdminTestComponent;
