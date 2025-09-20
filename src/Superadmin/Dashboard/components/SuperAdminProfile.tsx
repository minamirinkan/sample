// src/admin/components/AdminProfile.tsx
import React from "react";
import { formatDate } from "../../../common/dateFormatter";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { useSuperAdminData } from "../../../contexts/providers/SuperAdminDataProvider";
import { Timestamp } from "firebase/firestore";

type SuperAdminData = {
    fullname?: string;
    leaderLastName?: string;
    leaderFirstName?: string;
    leaderLastKana?: string;
    leaderFirstKana?: string;
    email: string;
    code: string;
    adminUid: string;
    createdAt: Timestamp;
    lastLogin: Timestamp;
    name: string;
    prefecture?: string;
    city?: string;
    streetAddress?: string;
    buildingName?: string;
    postalCode?: string;
    phoneNumber: string;
    faxNumber: string;
};

const SuperAdminProfile: React.FC = () => {
    const { classrooms } = useSuperAdminData();

    if (!classrooms){
        return <p className="text-gray-500 animate-pulse">読み込み中...</p>;
    }

    const superadmin = classrooms[0] as SuperAdminData; // 型を簡単に拡張

    return (
        <div className="p-6 grid gap-6 md:grid-cols-2">
            {/* 基本情報 */}
            <div className="bg-white shadow-md rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                        <AvatarFallback>👤</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold">基本情報</h2>
                </div>

                <p>氏名: {superadmin.fullname}</p>
                <p>
                    氏名（カナ）: {superadmin.leaderLastKana} {superadmin.leaderFirstKana}
                </p>
                <p>メール: {superadmin.email}</p>
                <p>管理者コード: {superadmin.code}</p>
                <p>登録日: {formatDate(superadmin.createdAt)}</p>
                <p>最終ログイン: {formatDate(superadmin.lastLogin)}</p>
            </div>

            {/* 教室情報 */}
            <div className="bg-white shadow-md rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                        <AvatarFallback>🏫</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold">教室情報</h2>
                </div>

                <p>教室名: {superadmin.name}</p>
                <p>郵便番号: {superadmin.postalCode}</p>
                <p>
                    住所: {superadmin.prefecture} {superadmin.city} {superadmin.streetAddress}{" "}
                    {superadmin.buildingName}
                </p>
                <p>電話番号: {superadmin.phoneNumber}</p>
                <p>FAX: {superadmin.faxNumber}</p>
            </div>

            {/* 設定 */}
            <div className="bg-white shadow-md rounded-2xl p-6 md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                        <AvatarFallback>⚙️</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold">設定</h2>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminProfile;
