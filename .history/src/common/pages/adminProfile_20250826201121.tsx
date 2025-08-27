// src/admin/components/AdminProfile.tsx
import React from "react";
import { useAdminData } from "../../contexts/providers/AdminDataProvider";

type AdminData = {
    fullname: string;
    leaderLastName: string;
    leaderFirstName: string;
    leaderLastKana: string;
    leaderFirstKana: string;
    email: string;
    code: string;
    adminUid: string;
    createdAt: string;
    lastLogin: string;
    name: string;
    prefecture: string;
    city: string;
    streetAddress: string;
    buildingName: string;
    postalCode: string;
    phoneNumber: string;
    faxNumber: string;
    tuitionName: string;
    teacherFeeName: string;
    periodTimeName: string;
    minimumWage: number;
};

const AdminProfile: React.FC = () => {
    const { classroom } = useAdminData();
    const admin = classroom.classroom as AdminData;

    return (
        <div className="p-6 grid gap-6 md:grid-cols-2">
            {/* 基本情報 */}
            <div className="bg-white shadow-md rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">👤 基本情報</h2>
                <p>氏名: {admin.fullname}</p>
                <p>
                    氏名（カナ）: {admin.leaderLastKana} {admin.leaderFirstKana}
                </p>
                <p>メール: {admin.email}</p>
                <p>管理者コード: {admin.code}</p>
                <p>UID: {admin.adminUid}</p>
                <p>登録日: {admin.createdAt}</p>
                <p>最終ログイン: {admin.lastLogin}</p>
            </div>

            {/* 教室情報 */}
            <div className="bg-white shadow-md rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">🏫 教室情報</h2>
                <p>教室名: {admin.name}</p>
                <p>
                    住所: {admin.prefecture} {admin.city} {admin.streetAddress}{" "}
                    {admin.buildingName}
                </p>
                <p>郵便番号: {admin.postalCode}</p>
                <p>電話番号: {admin.phoneNumber}</p>
                <p>FAX: {admin.faxNumber}</p>
            </div>

            {/* 設定 */}
            <div className="bg-white shadow-md rounded-2xl p-6 md:col-span-2">
                <h2 className="text-xl font-bold mb-4">⚙️ 設定</h2>
                <p>最低賃金: {admin.minimumWage} 円</p>
                <p>授業料表示名: {admin.tuitionName}</p>
                <p>講師給与表示名: {admin.teacherFeeName}</p>
                <p>時限名: {admin.periodTimeName}</p>
            </div>
        </div>
    );
};

export default AdminProfile;
