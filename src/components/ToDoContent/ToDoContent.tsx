import React, { useState, useEffect } from 'react';
import SimpleCard from './SimpleCard.tsx';
import UnreadMessages from './UnreadMessages.tsx';
import LogsTable from './LogsTable.tsx';
import { Message, Log } from './types.ts';
import NewContactModal from '../../data/NewContactModal.tsx';
import MessageDetailModal from '../../data/MessageDetailModal.tsx';
import { collection, addDoc, serverTimestamp, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { showErrorToast } from '../../components/ToastProvider';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext.tsx';

type Props = {
    logs: Log[];
};

const ToDoContent: React.FC<Props> = ({ logs }) => {
    const { user, role } = useAuth();
    const [modalOpen, setModalOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [adminUids, setAdminUids] = useState<string[]>([]);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    useEffect(() => {
        if (!user) return;
        fetchMessages();
    }, [user]);

    useEffect(() => {
        const fetchAdminUids = async () => {
            const snapshot = await getDocs(collection(db, "admins"));
            const uids = snapshot.docs.map(doc => doc.data().uid).filter(Boolean);
            setAdminUids(uids);
        };
        fetchAdminUids();
    }, []);

    const fetchMessages = async () => {
        if (!user) return;
        const snapshot = await getDocs(collection(db, "ceoMessages"));
        const fetchedMessages = snapshot.docs.map((doc) => {
            const data = doc.data();
            const readStatus = data.readStatus || {};
            return {
                id: doc.id,
                subject: data.subject,
                content: data.content ?? "",
                createdAt: data.createdAt ? data.createdAt.toDate() : null,
                read: readStatus[user.uid] ?? false,
            };
        });
        setMessages(fetchedMessages);
    };

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    const handleOpenDetail = (message: Message) => {
        setSelectedMessage(message);
        setDetailModalOpen(true);
    };

    const handleMarkAsRead = async () => {
        if (!selectedMessage || !user) return;
        const docRef = doc(db, "ceoMessages", selectedMessage.id);
        await updateDoc(docRef, {
            [`readStatus.${user.uid}`]: true,
        });
        setDetailModalOpen(false);
        fetchMessages();
    };

    const handleSubmit = async (subject: string, content: string) => {
        try {
            const readStatus: Record<string, boolean> = {};
            adminUids.forEach(uid => {
                readStatus[uid] = false;
            });

            await addDoc(collection(db, "ceoMessages"), {
                subject,
                content,
                createdAt: serverTimestamp(),
                createdBy: user.uid, // superadminのuidだけ記録
                readStatus,
            });

            toast.success("送信しました！", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: false,
            });

            closeModal();
            fetchMessages();
        } catch {
            showErrorToast("送信に失敗しました");
        }
    };

    const now = new Date();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const filteredLogs = logs.filter(log => {
        if (!log.timestamp) return false;
        const logDate = log.timestamp.toDate();
        return now.getTime() - logDate.getTime() <= ONE_DAY_MS;
    });

    return (
        <div className="space-y-4 w-full pr-6">
            <SimpleCard title={
                <div className="flex justify-between items-center">
                    <span>未読 社長連絡</span>
                    {role === "superadmin" && (
                        <button
                            className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600"
                            onClick={openModal}
                            type="button"
                        >
                            新規
                        </button>
                    )}
                </div>
            }>
                <UnreadMessages messages={messages} onOpenDetail={handleOpenDetail} />
            </SimpleCard>

            <SimpleCard title="編集内容">
                <LogsTable logs={filteredLogs} />
            </SimpleCard>

            <SimpleCard title="タスク">
                <p className="text-gray-700 text-sm">ここに内容が入ります。</p>
            </SimpleCard>

            <SimpleCard title="問い合わせ対応予定">
                <p className="text-gray-700 text-sm">ここに内容が入ります。</p>
            </SimpleCard>

            <SimpleCard title="新規問い合わせ">
                <p className="text-gray-700 text-sm">ここに内容が入ります。</p>
            </SimpleCard>

            <NewContactModal isOpen={modalOpen} onClose={closeModal} onSubmit={handleSubmit} />
            <MessageDetailModal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                onMarkAsRead={handleMarkAsRead}
                subject={selectedMessage?.subject || ""}
                content={selectedMessage?.content || ""}
            />
        </div>
    );
};

export default ToDoContent;
