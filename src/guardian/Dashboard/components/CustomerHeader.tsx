// components/SuperAdminHeader.tsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { auth } from '../../../firebase';
import { useAuth } from '../../../contexts/AuthContext';
import useCustomer from '../../../contexts/hooks/useCustomer';
import { useStudents } from '../../../contexts/hooks/useStudents';

interface CustomerHeaderProps {
    onToggleSidebar: () => void;
    role: 'superadmin' | 'admin' | 'customer' | 'teacher';
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ onToggleSidebar, role }) => {
    const { setUserPassword, userData } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const customerUid = userData?.uid
    const { customer } = useCustomer(customerUid);
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
    console.log('userData', userData)
console.log('customer', customer)
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
                    👤 {customer?.guardianfullName ?? "教室名を取得中..."}
                </button>
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border shadow z-50">
                        <button
                            className="block px-4 py-2 hover:bg-gray-100"
                            onClick={() => {
                                setIsDropdownOpen(false); // まず閉じる
                                navigate("/"); // その後に遷移
                            }}
                        >
                            管理者情報
                        </button>
                        <button
                            className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                            onClick={async () => {
                                await auth.signOut();
                                setUserPassword(null)
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

export default CustomerHeader;
