import { useState } from 'react';

const SchoolAccountForm = ({ onAdd }) => {
    const [newName, setNewName] = useState('');
    const [newCode, setNewCode] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleSubmit = () => {
        onAdd({ newName, newCode, newEmail, newPassword });

        //フォームリセットしたい場合は以下を追加
        setNewName('');
        setNewCode('');
        setNewEmail('');
        setNewPassword('');
    };

    return (
        <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col sm:w-32">
                    <label className="mb-1 text-sm font-medium text-gray-700">教室コード</label>
                    <input
                        type="text"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 text-center font-mono"
                        placeholder="例: 007"
                        maxLength={3}
                        inputMode="numeric"
                    />
                </div>
                <div className="flex flex-col flex-1">
                    <label className="mb-1 text-sm font-medium text-gray-700">教室名</label>
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2"
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col flex-1">
                    <label className="mb-1 text-sm font-medium text-gray-700">メールアドレス</label>
                    <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2"
                        placeholder="例: school007@example.com"
                    />
                </div>
                <div className="flex flex-col flex-1">
                    <label className="mb-1 text-sm font-medium text-gray-700">初期パスワード</label>
                    <input
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2"
                        placeholder="6文字以上"
                    />
                </div>
            </div>

            <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-fit self-end"
            >
                新規登録
            </button>
        </div>
    );
};

export default SchoolAccountForm;
