// src/admin/components/AdminProfile.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAdminData } from "../../contexts/providers/AdminDataProvider";
import { formatDate } from "../dateFormatter";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";

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

    if (!classroom || !classroom.classroom) {
        return <p className="text-gray-500 animate-pulse">読み込み中...</p>;
    }

    const admin = classroom.classroom as AdminData & { addressInfo: any }; // 型を簡単に拡張

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

                <p>氏名: {admin.fullname}</p>
                <p>
                    氏名（カナ）: {admin.leaderLastKana} {admin.leaderFirstKana}
                </p>
                <p>メール: {admin.email}</p>
                <p>管理者コード: {admin.code}</p>
                <p>UID: {admin.adminUid}</p>
                <p>登録日: {formatDate(admin.createdAt)}</p>
                <p>最終ログイン: {formatDate(admin.lastLogin)}</p>
            </div>

            {/* 教室情報 */}
            <div className="bg-white shadow-md rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                        <AvatarFallback>🏫</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold">教室情報</h2>
                </div>

                <p>教室名: {admin.name}</p>
                <p>郵便番号: {admin.addressInfo?.postalCode}</p>
                <p>
                    住所: {admin.addressInfo?.prefecture} {admin.addressInfo?.city} {admin.addressInfo?.streetAddress}{" "}
                    {admin.addressInfo?.buildingName}
                </p>
                <p>電話番号: {admin.phoneNumber}</p>
                <p>FAX: {admin.faxNumber}</p>
            </div>

            {/* 設定 */}
            <div className="bg-white shadow-md rounded-2xl p-6 md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                        <AvatarFallback>⚙️</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold">設定</h2>
                </div>

                <p>最低賃金: {admin.minimumWage} 円</p>
                <p>授業料表示名:
                    <Link to={`/admin/tuition/${admin.tuitionName}`}
                        className="text-blue-600 hover:underline"
                    >
                        {admin.tuitionName}
                    </Link>
                </p>
                <p>講師給与表示名:
                    <Link to={`/admin/work-fees/${admin.name}`}
                        className="text-blue-600 hover:underline"
                    >
                        {admin.teacherFeeName}
                    </Link>
                </p>
                <p>時限名: {admin.periodTimeName}</p>
            </div>
        </div>
    );
};

export default AdminProfile;
