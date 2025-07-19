import React, { useEffect, useState, useCallback } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from '../contexts/AuthContext.tsx';
import { Message } from './ToDoContent/types.ts';
import SimpleCard from './ToDoContent/SimpleCard.tsx';
import MessageDetailModal from '../data/MessageDetailModal.tsx';

const CeoMessagesAll: React.FC = () => {
    const { user, classroomCode, role } = useAuth();
    const [messages, setMessages] = useState<(Message & { readStatus: Record<string, boolean> })[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<(Message & { readStatus: Record<string, boolean> }) | null>(null);
    // 追加: 行ごとの未読教室表示用の状態
    const [unreadClassroomsForMessage, setUnreadClassroomsForMessage] = useState<string[]>([]);
    const [showUnreadForMessageId, setShowUnreadForMessageId] = useState<string | null>(null);

    const fetchMessages = useCallback(async () => {
        if (!user) return;
        const snapshot = await getDocs(collection(db, "ceoMessages"));
        const fetchedMessages = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                subject: data.subject,
                content: data.content ?? "",
                createdAt: data.createdAt ? data.createdAt.toDate() : null,
                readStatus: data.readStatus || {},
                read: classroomCode ? (data.readStatus?.[classroomCode] ?? false) : false,
            };
        });
        setMessages(fetchedMessages);
    }, [user, classroomCode]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const isSuperadmin = role === 'superadmin';

    const onOpenDetail = (msg: typeof selectedMessage) => {
        if (!msg) return;  // ここでnullチェック

        setSelectedMessage(msg);

        // 未読教室リストをセットして表示状態をクリア
        const unreadRooms = Object.entries(msg.readStatus)
            .filter(([, read]) => read === false)
            .map(([room]) => room);

        setUnreadClassroomsForMessage(unreadRooms);
        setShowUnreadForMessageId(null);
    };

    const closeModal = () => {
        setSelectedMessage(null);
    };

    const onMarkAsRead = async () => {
        if (!selectedMessage || !classroomCode) return;
        // TODO: Firestore update処理

        setMessages(prev =>
            prev.map(msg =>
                msg.id === selectedMessage.id
                    ? {
                        ...msg,
                        readStatus: { ...msg.readStatus, [classroomCode]: true },
                        read: true,
                    }
                    : msg
            )
        );
        closeModal();
    };

    // 行ごとに「未読教室を表示」トグル
    const toggleUnreadClassroomsForMessage = (msg: typeof selectedMessage & { readStatus: Record<string, boolean> }) => {
        if (showUnreadForMessageId === msg.id) {
            setShowUnreadForMessageId(null);
        } else {
            const unreadRooms = Object.entries(msg.readStatus)
                .filter(([, read]) => read === false)
                .map(([room]) => room);
            setUnreadClassroomsForMessage(unreadRooms);
            setShowUnreadForMessageId(msg.id);
        }
    };

    return (
        <SimpleCard title="社長連絡 一覧">
            <div>
                <table className="w-full table-fixed text-sm border border-gray-300 border-collapse">
                    <colgroup>
                        <col style={{ width: '40%' }} />
                        <col style={{ width: isSuperadmin ? '25%' : '30%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '10%' }} />
                        {isSuperadmin && <col style={{ width: '15%' }} />}
                    </colgroup>
                    <thead>
                        <tr className="bg-blue-50">
                            <th className="border border-gray-300 text-left py-2 px-2">件名</th>
                            <th className="border border-gray-300 text-left py-2 px-2">受信日時</th>
                            <th className="border border-gray-300 text-center py-2 px-2">既読</th>
                            <th className="border border-gray-300 text-center py-2 px-2">操作</th>
                            {isSuperadmin && (
                                <th className="border border-gray-300 text-center py-2 px-2">未読教室</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {[...messages]
                            .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
                            .map((msg) => (
                                <React.Fragment key={msg.id}>
                                    <tr>
                                        <td className="border border-gray-300 text-left py-2 px-2 truncate">{msg.subject}</td>
                                        <td className="border border-gray-300 text-left py-2 px-2">
                                            {msg.createdAt
                                                ? msg.createdAt.toLocaleString("ja-JP", {
                                                    year: "numeric",
                                                    month: "2-digit",
                                                    day: "2-digit",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: false,
                                                }).replace(/\//g, "/")
                                                : "-"}
                                        </td>
                                        <td className="border border-gray-300 text-center py-2 px-2">
                                            <span
                                                className={`inline-block px-3 py-1 rounded text-white text-sm ${msg.read ? "bg-green-500" : "bg-red-500"
                                                    }`}
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
                                        {isSuperadmin && (
                                            <td className="border border-gray-300 text-center py-2 px-2">
                                                <button
                                                    className="bg-yellow-400 text-black text-xs px-2 py-1 rounded hover:bg-yellow-500"
                                                    onClick={() => toggleUnreadClassroomsForMessage(msg)}
                                                    type="button"
                                                >
                                                    {showUnreadForMessageId === msg.id ? "非表示" : "表示"}
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                    {/* 未読教室リスト表示行 */}
                                    {isSuperadmin && showUnreadForMessageId === msg.id && (
                                        <tr>
                                            <td colSpan={5} className="bg-gray-50 text-left text-sm py-2 px-4">
                                                <strong>未読の教室:</strong>{" "}
                                                {unreadClassroomsForMessage.length === 0
                                                    ? "なし"
                                                    : unreadClassroomsForMessage.join(", ")}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                    </tbody>
                </table>
            </div>

            {/* 詳細モーダル */}
            {selectedMessage && (
                <MessageDetailModal
                    isOpen={!!selectedMessage}
                    onClose={closeModal}
                    onMarkAsRead={onMarkAsRead}
                    subject={selectedMessage.subject}
                    content={selectedMessage.content}
                />
            )}
        </SimpleCard>
    );
};

export default CeoMessagesAll;
