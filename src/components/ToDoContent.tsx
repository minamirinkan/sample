import React from 'react';

type Log = {
    id: string;
    timestamp?: { toDate: () => Date };
    action: string;
    target: string;
    detail: string;
};

type ToDoContentProps = {
    logs: Log[];
};

type CardProps = {
    title: string;
    children?: React.ReactNode;
};

const Card: React.FC<CardProps> = ({ title, children }) => (
    <div className="p-3 rounded-md border border-gray-300 border-t-4 border-t-blue-500 shadow-sm w-full">
        <h2 className="text-lg font-semibold mb-3 text-blue-600">{title}</h2>
        {children}
    </div>
);

const ToDoContent: React.FC<ToDoContentProps> = ({ logs }) => {
    return (
        <div className="space-y-4 w-full pr-6">
            <Card title="未読 社長連絡">
                <table className="w-full text-sm border border-gray-300 border-collapse">
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="border border-gray-300 text-left py-2 px-2">件名</th>
                            <th className="border border-gray-300 text-left py-2 px-2">受信日時</th>
                            <th className="border border-gray-300 text-left py-2 px-2">操作</th>
                        </tr>
                    </thead>
                </table>
            </Card>

            <Card title="編集内容">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="border border-gray-300 text-left py-2 px-2">日時</th>
                            <th className="border border-gray-300 text-left py-2 px-2">操作</th>
                            <th className="border border-gray-300 text-left py-2 px-2">対象</th>
                            <th className="border border-gray-300 text-left py-2 px-2">詳細</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id}>
                                <td className="border text-left py-2 px-2">{log.timestamp?.toDate().toLocaleString()}</td>
                                <td className="border text-left py-2 px-2">{log.action}</td>
                                <td className="border text-left py-2 px-2">{log.target}</td>
                                <td className="border text-left py-2 px-2">{log.detail}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <Card title="タスク">
                <p className="text-gray-700 text-sm">ここに内容が入ります。</p>
            </Card>

            <Card title="問い合わせ対応予定">
                <p className="text-gray-700 text-sm">ここに内容が入ります。</p>
            </Card>

            <Card title="新規問い合わせ">
                <p className="text-gray-700 text-sm">ここに内容が入ります。</p>
            </Card>
        </div>
    );
};

export default ToDoContent;
