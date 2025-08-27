import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../contexts/AuthContext";

type Message = {
  id: string;
  text: string;
  senderId: string;
  createdAt: any;
  readBy?: string[];
  replyTo?: { id: string; text: string; senderId: string };
};

type ChatProps = {
  chatType: "headquarters" | "classroom";
  roomId: string;
};

const Chat = ({ chatType, roomId }: ChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [menuMessage, setMenuMessage] = useState<Message | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // 🔹検索バー用
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const adjustHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = inputRef.current.scrollHeight + "px";
    }
  };

  const messagesRef = useMemo(() => {
    if (!chatType || !roomId) return null;
    return collection(db, "chats", `${chatType}_${roomId}`, "messages");
  }, [chatType, roomId]);

  // メッセージ取得
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

  // 既読更新（自分が見た場合のみ）
  useEffect(() => {
    if (!user) return;
    messages.forEach(async (msg) => {
      if (!msg.readBy?.includes(user.uid)) {
        const msgRef = doc(db, "chats", `${chatType}_${roomId}`, "messages", msg.id);
        await updateDoc(msgRef, { readBy: [...(msg.readBy || []), user.uid] });
      }
    });
  }, [messages, user, chatType, roomId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !messagesRef) return;
    await addDoc(messagesRef, {
      text: newMessage,
      senderId: user?.uid,
      createdAt: serverTimestamp(),
      readBy: user ? [user.uid] : [],
      replyTo: replyTo
        ? { id: replyTo.id, text: replyTo.text, senderId: replyTo.senderId }
        : null,
    });
    setNewMessage("");
    setReplyTo(null);
    adjustHeight();
  };

  const handleDelete = async (id: string) => {
    if (!messagesRef) return;
    if (!window.confirm("このメッセージを削除しますか？")) return;
    await deleteDoc(doc(db, "chats", `${chatType}_${roomId}`, "messages", id));
    setMenuMessage(null);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, msg: Message) => {
    let timer = setTimeout(() => {
      setMenuMessage(msg);
    }, 700);
    const cancel = () => clearTimeout(timer);
    e.currentTarget.addEventListener("touchend", cancel, { once: true });
    e.currentTarget.addEventListener("touchmove", cancel, { once: true });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => scrollToBottom(), [messages]);

  const scrollToMessage = (id: string) => {
    const target = messageRefs.current[id];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("bg-yellow-100");
      setTimeout(() => target.classList.remove("bg-yellow-100"), 1500);
    }
  };

  const filteredMessages = messages.filter((msg) =>
    msg.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!chatType || !roomId) {
    return <div className="p-4 text-gray-500">チャットの対象が選択されていません。</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* 検索バー */}
      <div className="p-2 border-b">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="検索"
          className="w-1/4 border rounded px-2 py-1"
        />
      </div>

      {/* メッセージ表示 */}
      <div className="flex-1 overflow-y-auto p-4">

        {filteredMessages.map((msg) => {
          const isOwn = msg.senderId === user?.uid;
          const createdAtDate = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date();
          const timeString = createdAtDate.toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
          const hasRead = isOwn && msg.readBy && msg.readBy.length > 1;

          return (
            <div
              key={msg.id}
              ref={(el) => { messageRefs.current[msg.id] = el; }}
              className={`mb-2 flex items-end ${isOwn ? "justify-end" : "justify-start"} ${menuMessage?.id === msg.id ? "opacity-70" : ""}`}
            >
              {isOwn ? (
                <>
                  <div className="flex flex-col items-end text-xs text-gray-500 mr-2">
                    {hasRead && <span>既読</span>}
                    <span>{timeString}</span>
                  </div>

                  <div
                    onClick={(e) => { e.stopPropagation(); setMenuMessage(msg); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, msg); }}
                    className="bg-blue-100 text-right px-3 py-2 rounded max-w-[70%] break-words cursor-pointer"
                  >
                    {/* 返信先メッセージデザイン変更 */}
                    {msg.replyTo && (
                      <div
                        onClick={(e) => { e.stopPropagation(); scrollToMessage(msg.replyTo!.id); }}
                        className="text-xs text-gray-500 bg-gray-100 border-l-4 border-gray-300 pl-2 mb-1 rounded-sm cursor-pointer"
                      >
                        {msg.replyTo.text}
                      </div>
                    )}

                    {/* 自分のメッセージ内容 */}
                    <div className="text-sm text-gray-900">{msg.text}</div>
                  </div>
                </>
              ) : (
                <>
                  <div
                    onClick={(e) => { e.stopPropagation(); setMenuMessage(msg); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(e, msg); }}
                    className="bg-gray-200 text-left px-3 py-2 rounded max-w-[70%] break-words cursor-pointer"
                  >
                    {/* 返信先メッセージデザイン変更 */}
                    {msg.replyTo && (
                      <div
                        onClick={(e) => { e.stopPropagation(); scrollToMessage(msg.replyTo!.id); }}
                        className="text-xs text-gray-500 bg-gray-100 border-l-4 border-gray-300 pl-2 mb-1 rounded-sm cursor-pointer"
                      >
                        {msg.replyTo.text}
                      </div>
                    )}

                    {/* 相手のメッセージ内容 */}
                    <div className="text-sm text-gray-900">{msg.text}</div>
                  </div>
                  <div className="flex flex-col items-start text-xs text-gray-500 ml-2">
                    <span>{timeString}</span>
                  </div>
                </>
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* 返信中の表示 */}
      {replyTo && (
        <div className="px-4 py-2 bg-gray-100 border-t text-sm flex justify-between items-center">
          <div className="text-gray-600 truncate">返信先: {replyTo.text}</div>
          <button onClick={() => setReplyTo(null)} className="text-blue-500 text-sm">
            ×
          </button>
        </div>
      )}

      {/* 入力欄 */}
      <div className="p-4 border-t flex items-center gap-2">
        <textarea
          ref={inputRef}
          className="flex-1 border rounded px-3 py-2 resize-none overflow-hidden"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onInput={adjustHeight}
          placeholder="メッセージを入力"
          rows={1}
          onKeyDown={(e) =>
            e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())
          }
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          送信
        </button>
      </div>

      {/* メニュー */}
      {menuMessage && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl shadow-lg w-64 overflow-hidden">
            {/* 自分のメッセージなら削除ボタン表示 */}
            {menuMessage.senderId === user?.uid && (
              <button
                onClick={() => handleDelete(menuMessage.id)}
                className="w-full px-4 py-3 text-red-500 text-lg hover:bg-gray-100"
              >
                削除
              </button>
            )}
            <button
              onClick={() => { navigator.clipboard.writeText(menuMessage.text); setMenuMessage(null); }}
              className="w-full px-4 py-3 text-lg hover:bg-gray-100"
            >
              コピー
            </button>
            <button
              onClick={() => { setReplyTo(menuMessage); setMenuMessage(null); }}
              className="w-full px-4 py-3 text-lg hover:bg-gray-100"
            >
              返信
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-lg w-64 mt-3 overflow-hidden">
            <button
              onClick={() => setMenuMessage(null)}
              className="w-full px-4 py-3 text-lg text-blue-600 hover:bg-gray-100"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
