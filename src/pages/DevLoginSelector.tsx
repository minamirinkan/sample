import React from 'react';
import { useNavigate } from 'react-router-dom';

const DevLoginSelector: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-gray-100">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">ログイン画面選択（開発用）</h1>
            <button className="btn" onClick={() => navigate('/superadmin-login')}>🔑 SuperAdminログイン</button>
            <button className="btn" onClick={() => navigate('/admin-login')}>🏫 Adminログイン</button>
            <button className="btn" onClick={() => navigate('/customer-login')}>👤 Customerログイン</button>
            <button className="btn" onClick={() => navigate('/teacher-login')}>👤 Teacherログイン</button>
        </div>
    );
};

export default DevLoginSelector;
