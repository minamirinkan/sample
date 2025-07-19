import { useState, useRef, useEffect } from 'react';

const SuperAdminHeader = ({ onToggleSidebar }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // 外部クリックでドロップダウンを閉じる
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="header flex justify-between items-center p-4 bg-gray-200">
            <div className="left-section flex items-center space-x-2">
                <button
                    onClick={onToggleSidebar}
                    className="text-2xl px-2 py-1 rounded hover:bg-gray-300"
                >
                    ☰
                </button>
                <a href="/superadmin/dashboard" className="text-xl font-bold">
                    ATOM
                </a>
            </div>
            <div className="right-section relative" ref={dropdownRef}>
                <button
                    className="px-4 py-2 bg-gray-300 rounded"
                    onClick={() => setIsDropdownOpen(prev => !prev)}
                >
                    管理者ページ
                </button>
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border shadow z-50">
                        <a
                            href="/superadmin/settings"
                            className="block px-4 py-2 hover:bg-gray-100"
                        >
                            管理者情報
                        </a>
                        <a
                            href="/"
                            className="block px-4 py-2 hover:bg-gray-100"
                        >
                            ログアウト
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminHeader;
