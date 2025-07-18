import React from 'react';
import { Log } from './types.ts';

type Props = {
    logs: Log[];
};

const LogsTable: React.FC<Props> = ({ logs }) => (
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
);

export default LogsTable;
