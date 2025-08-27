import React, { useState, useEffect, useCallback } from "react";
import SimpleCard from "./ToDoContent/SimpleCard";
import UnreadMessages from "../../common/ToDo/components/UnreadMessages";
import LogsTable from "../../common/ToDo/components/LogsTable";
import { Message, Log } from "../../common/ToDo/components/types";
import NewContactModal from "..//../common/modal/NewContactModal";
import MessageDetailModal from "./../../common/ToDo/components/MessageDetailModal";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  updateDoc,
  query,
  onSnapshot,
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "../../firebase.js";
import { showErrorToast } from "..//ToastProvider";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

type Props = {
  logs: Log[];
};

const ToDoContent: React.FC<Props> = () => {
  const { user, role } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [classroomCodes, setClassroomCodes] = useState<string[]>([]);
  const classroomCode = user?.classroomCode;
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);

  // classroomCodes取得
  useEffect(() => {
    const fetchClassroomCodes = async () => {
      const snapshot = await getDocs(collection(db, "admins"));
      const codes = snapshot.docs
        .map((doc) => doc.data().classroomCode)
        .filter(Boolean);
      setClassroomCodes(codes);
    };
    fetchClassroomCodes();
  }, [user]);

  // fetchMessagesをuseCallbackでメモ化し再利用可能に
  const fetchMessages = useCallback(async () => {
    if (!user || !classroomCode) return;
    const snapshot = await getDocs(collection(db, "ceoMessages"));
    const fetchedMessages = snapshot.docs.map((doc) => {
      const data = doc.data();
      const readStatus = data.readStatus || {};
      return {
        id: doc.id,
        subject: data.subject,
        content: data.content ?? "",
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
        read: readStatus[classroomCode] ?? false,
      };
    });
    setMessages(fetchedMessages);
  }, [user, classroomCode]);

  useEffect(() => {
      const q = query(
        collection(db, "logs"),
        orderBy("timestamp", "desc"),
        limit(10)
      );
  
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data: Log[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            timestamp: d.timestamp,
            content: d.content ?? "",
            editor: d.editor ?? "",
          };
        });
        setLogs(data);
      });
  
      return () => unsubscribe();
    }, []);

  // 初回取得＋user,classroomCode変化時にfetchMessages呼ぶ
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const handleOpenDetail = (message: Message) => {
    setSelectedMessage(message);
    setDetailModalOpen(true);
  };

  const handleMarkAsRead = async () => {
    if (!selectedMessage || !classroomCode || role === "superadmin") return;
    const docRef = doc(db, "ceoMessages", selectedMessage.id);
    await updateDoc(docRef, {
      [`readStatus.${classroomCode}`]: true,
    });
    setDetailModalOpen(false);
    // 更新後に最新取得
    fetchMessages();
  };

  const handleSubmit = async (subject: string, content: string) => {
    try {
      const readStatus: Record<string, boolean> = {};
      classroomCodes.forEach((code) => {
        readStatus[code] = false;
      });

      await addDoc(collection(db, "ceoMessages"), {
        subject,
        content,
        createdAt: serverTimestamp(),
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
      // 新規送信後に再取得して最新反映
      fetchMessages();
    } catch {
      showErrorToast("送信に失敗しました");
    }
  };

  const now = new Date();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const filteredLogs = logs.filter((log) => {
    if (!log.timestamp) return false;
    const logDate = log.timestamp.toDate();
    return now.getTime() - logDate.getTime() <= ONE_DAY_MS;
  });

  return (
    <div className="space-y-4 w-full pr-6">
      <SimpleCard
        title={
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
        }
      >
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

      <NewContactModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
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
