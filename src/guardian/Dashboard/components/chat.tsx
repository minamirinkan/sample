import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../contexts/AuthContext";

type Message = {
  id: string;
  text: string;
  senderId: string;
  createdAt: any;
};

type ChatProps = {
  chatType: "headquarters" | "classroom";
  roomId: string;
};

const Chat = ({ chatType, roomId }: ChatProps) => {
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ Firestore 正しいパス構造に修正（doc()を使ってからcollection()）
  const messagesRef =
    chatType && roomId
      ? collection(doc(db, "chats", chatType, roomId), "messages")
      : null;

  // ✅ 条件付きではなく useEffect を使う：messagesRef が null のときは何もしない
  useEffect(() => {
    if (!messagesRef) return;

    const q = query(messagesRef, orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        ...(doc.data() as Message),
        id: doc.id,
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [messagesRef]);

  const sendMessage = async () => {
    if (newMessage.trim() === "" || !messagesRef) return;

    await addDoc(messagesRef, {
      text: newMessage,
      senderId: user?.uid,
      createdAt: serverTimestamp(),
    });

    setNewMessage("");
  };

  const handleDelete = async (id: string) => {
    if (!messagesRef) return;

    const confirmDelete = window.confirm("このメッセージを削除しますか？");
    if (!confirmDelete) return;

    try {
      const messageDocRef = doc(messagesRef, id);
      await deleteDoc(messageDocRef);
    } catch (error) {
      console.error("削除エラー:", error);
    }
  };

  const handleTouchStart = (
    e: React.TouchEvent<HTMLDivElement>,
    id: string,
    isOwn: boolean
  ) => {
    if (!isOwn) return;
    let timer = setTimeout(() => {
      handleDelete(id);
    }, 700);

    const cancel = () => clearTimeout(timer);
    e.currentTarget.addEventListener("touchend", cancel, { once: true });
    e.currentTarget.addEventListener("touchmove", cancel, { once: true });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ chatType や roomId がない場合の早期 return（useEffect の後に置く）
  if (!chatType || !roomId) {
    return (
      <div className="p-4 text-gray-500">
        チャットの対象が選択されていません。
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => {
          const isOwn = msg.senderId === user?.uid;
          const createdAtDate = msg.createdAt?.toDate
            ? msg.createdAt.toDate()
            : new Date();
          const timeString = createdAtDate.toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

          return (
            <div
              key={msg.id}
              onClick={() => isOwn && handleDelete(msg.id)}
              onTouchStart={(e) => handleTouchStart(e, msg.id, isOwn)}
              className={`mb-2 p-2 rounded max-w-[70%] break-words ${
                isOwn
                  ? "ml-auto bg-blue-100 text-right"
                  : "mr-auto bg-gray-200 text-left"
              }`}
            >
              <div>{msg.text}</div>
              <div className="text-xs text-gray-500 text-right">{timeString}</div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t flex items-center gap-2">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="メッセージを入力"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          送信
        </button>
      </div>
    </div>
  );
};

export default Chat;
