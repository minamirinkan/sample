// components/SuperAdminHeader.tsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { auth } from '../../../firebase';
import { useSuperAdminData } from '../../../contexts/providers/SuperAdminDataProvider';
import LoadingSpinner from '../../../common/LoadingSpinner';
interface SuperAdminHeaderProps {
    onToggleSidebar: () => void;
    role: 'superadmin' | 'admin' | 'customer' | 'teacher';
}

const SuperAdminHeader: React.FC<SuperAdminHeaderProps> = ({ onToggleSidebar, role }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { classrooms } = useSuperAdminData();
    const navigate = useNavigate();

    const dashboardPath =
        role === 'superadmin'
            ? '/superadmin/dashboard'
            : role === 'admin'
                ? '/admin/dashboard'
                : role === 'customer'
                    ? '/mypage/dashboard'
                    : '/teacher/dashboard';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!classrooms) return <LoadingSpinner />

    return (
        <div className="header flex justify-between items-center p-4 bg-gray-200">
            <div className="left-section flex items-center space-x-2">
                <button
                    onClick={onToggleSidebar}
                    className="text-2xl px-2 py-1 rounded hover:bg-gray-300"
                >
                    ☰
                </button>
                <a href={dashboardPath} className="text-xl font-bold">
                    ATOM
                </a>
            </div>
            <div className="right-section relative" ref={dropdownRef}>
                <button
                    className="px-4 py-2 bg-gray-300 rounded"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                    👤  {classrooms?.[0]?.name ?? "教室名を取得中..."}
                </button>
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border shadow z-50">
                        <button
                            className="block px-4 py-2 hover:bg-gray-100"
                            onClick={() => {
                                setIsDropdownOpen(false); // まず閉じる
                                navigate("/superadmin/profile"); // その後に遷移
                            }}
                        >
                            管理者情報
                        </button>
                        <button
                            className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                            onClick={async () => {
                                await auth.signOut(); // Firebase Auth のログアウト
                                navigate("/");
                            }}
                        >
                            ログアウト
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminHeader;
