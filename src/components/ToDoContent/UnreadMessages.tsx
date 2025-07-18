import React from 'react';
import { Message } from './types.ts';

type Props = {
    messages: Message[];
    onOpenDetail: (message: Message) => void;
    isSuperAdmin?: boolean;
};

const UnreadMessages: React.FC<Props> = ({ messages, onOpenDetail, isSuperAdmin = false }) => (
    <div>
        {isSuperAdmin && (
            <div className="flex justify-end mb-2">
                <button
                    className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    type="button"
                >
                    ＋ 新規作成
                </button>
            </div>
        )}

        <table className="w-full table-fixed text-sm border border-gray-300 border-collapse">
            <colgroup>
                <col style={{ width: '50%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
            </colgroup>
            <thead>
                <tr className="bg-blue-50">
                    <th className="border border-gray-300 text-left py-2 px-2">件名</th>
                    <th className="border border-gray-300 text-left py-2 px-2">受信日時</th>
                    <th className="border border-gray-300 text-center py-2 px-2">既読</th>
                    <th className="border border-gray-300 text-center py-2 px-2">操作</th>
                </tr>
            </thead>
            <tbody>
                {messages
                    .filter(msg => !msg.read)
                    .map((msg) => (
                        <tr key={msg.id}>
                            <td className="border border-gray-300 text-left py-2 px-2 truncate">{msg.subject}</td>
                            <td className="border border-gray-300 text-left py-2 px-2">
                                {msg.createdAt
                                    ? msg.createdAt.toLocaleString("ja-JP", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false
                                    }).replace(/\//g, "/")
                                    : "-"}
                            </td>
                            <td className="border border-gray-300 text-center py-2 px-2">
                                <span
                                    className={`inline-block px-3 py-1 rounded text-white text-sm ${msg.read ? 'bg-green-500' : 'bg-red-500'}`}
                                >
                                    {msg.read ? "既読" : "未読"}
                                </span>
                            </td>
                            <td className="border border-gray-300 text-center py-2 px-2">
                                <button
                                    className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600"
                                    onClick={() => onOpenDetail(msg)}
                                    type="button"
                                >
                                    詳細
                                </button>
                            </td>
                        </tr>
                    ))}
            </tbody>
        </table>
    </div>
);

export default UnreadMessages;
