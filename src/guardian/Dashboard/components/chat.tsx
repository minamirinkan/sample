import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../contexts/AuthContext";

type Message = {
  id: string;
  text: string;
  senderId: string;
  createdAt: any;
  readBy: string[];
};

type ChatProps = {
  roomId: string;
  chatType?: string;
  studentId?: string;
};


const Chat: React.FC<ChatProps> = ({ roomId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!roomId || !user?.uid) return;

    const q = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);

      msgs.forEach(async (msg) => {
        if (msg.senderId !== user.uid && !msg.readBy?.includes(user.uid)) {
          const msgRef = doc(db, "rooms", roomId, "messages", msg.id);
          await updateDoc(msgRef, {
            readBy: [...(msg.readBy || []), user.uid],
          });
        }
      });
    });

    return () => unsubscribe();
  }, [roomId, user?.uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    await addDoc(collection(db, "rooms", roomId, "messages"), {
      text: newMessage,
      senderId: user.uid,
      createdAt: serverTimestamp(),
      readBy: [user.uid],
    });

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full border rounded p-4">
      <div className="flex-grow overflow-y-auto mb-4">
        {messages.map((msg) => {
          const isOwn = msg.senderId === user?.uid;
          return (
            <div
              key={msg.id}
              className={`flex flex-col mb-2 ${
                isOwn ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`p-2 rounded ${
                  isOwn ? "bg-blue-200" : "bg-gray-200"
                }`}
                style={{ maxWidth: "70%" }}
              >
                <p>{msg.text}</p>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {msg.createdAt?.toDate
                  ? msg.createdAt.toDate().toLocaleString()
                  : ""}
                {isOwn && msg.readBy.length > 1 && (
                  <span className="ml-2 text-green-600">既読</span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex">
        <input
          type="text"
          className="flex-grow border rounded px-2 py-1 mr-2"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="メッセージを入力"
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 rounded"
        >
          送信
        </button>
      </div>
    </div>
  );
};

export default Chat;
