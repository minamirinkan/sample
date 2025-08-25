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
};

type ChatProps = {
  chatType: "headquarters" | "classroom";
  roomId: string;
};

const Chat = ({ chatType, roomId }: ChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [menuMsg, setMenuMsg] = useState<Message | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  // 既読更新
  useEffect(() => {
    if (!user) return;
    messages.forEach(async (msg) => {
      if (!msg.readBy?.includes(user.uid)) {
        const msgRef = doc(db, "chats", `${chatType}_${roomId}`, "messages", msg.id);
        await updateDoc(msgRef, { readBy: [...(msg.readBy || []), user.uid] });
      }
    });
  }, [messages, user, chatType, roomId]);

  // 検索フィルタ
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredMessages(messages);
    } else {
      setFilteredMessages(
        messages.filter((msg) =>
          msg.text.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }
  }, [searchText, messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !messagesRef) return;
    await addDoc(messagesRef, {
      text: newMessage,
      senderId: user?.uid,
      createdAt: serverTimestamp(),
      readBy: user ? [user.uid] : [],
    });
    setNewMessage("");
    adjustHeight();
  };

  const handleDelete = async (id: string) => {
    if (!messagesRef) return;
    if (!window.confirm("このメッセージを削除しますか？")) return;
    await deleteDoc(doc(db, "chats", `${chatType}_${roomId}`, "messages", id));
  };

  // メニュー表示（右クリック・長押し共通）
  const showMenu = (msg: Message, x: number, y: number) => {
    setMenuMsg(msg);
    setMenuPosition({ x, y });
  };

  const handleMenuAction = (action: "delete" | "copy" | "reply") => {
    if (!menuMsg) return;
    switch (action) {
      case "delete":
        handleDelete(menuMsg.id);
        break;
      case "copy":
        navigator.clipboard.writeText(menuMsg.text);
        break;
      case "reply":
        setNewMessage(`@${menuMsg.text} `);
        break;
    }
    setMenuMsg(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [filteredMessages]);

  if (!chatType || !roomId) {
    return <div className="p-4 text-gray-500">チャットの対象が選択されていません。</div>;
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* 検索バー */}
      <div className="flex justify-end p-2 border-b">
        <input
          type="text"
          placeholder="検索..."
          className="border rounded px-2 py-1 w-1/4"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredMessages.map((msg) => {
          const isOwn = msg.senderId === user?.uid;
          const createdAtDate = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date();
          const timeString = createdAtDate.toLocaleTimeString("ja-JP", {
            hour: "2-digit", minute: "2-digit", hour12: false
          });
          const hasRead = isOwn && msg.readBy && msg.readBy.length > 1;
          const isMenuOpen = menuMsg?.id === msg.id;

          return (
            <div
              key={msg.id}
              className={`mb-2 flex items-end ${isOwn ? "justify-end" : "justify-start"}`}
            >
              {isOwn ? (
                <>
                  <div className="flex flex-col items-end text-xs text-gray-500 mr-2">
                    {hasRead && <span>既読</span>}
                    <span>{timeString}</span>
                  </div>
                  <div
                    onContextMenu={(e) => {
                      e.preventDefault();
                      showMenu(msg, e.clientX, e.clientY);
                    }}
                    onTouchStart={(e) => {
                      if (msg.senderId === user?.uid) {
                        const touch = e.touches[0];
                        const timer = setTimeout(() => showMenu(msg, touch.clientX, touch.clientY), 700);
                        const cancel = () => clearTimeout(timer);
                        e.currentTarget.addEventListener("touchend", cancel, { once: true });
                        e.currentTarget.addEventListener("touchmove", cancel, { once: true });
                      }
                    }}
                    className={`px-3 py-2 rounded max-w-[70%] break-words transition-colors ${isMenuOpen
                        ? "bg-blue-700 bg-opacity-70 text-white"
                        : "bg-blue-100 text-right"
                      }`}
                  >
                    {msg.text}
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={`px-3 py-2 rounded max-w-[70%] break-words transition-colors ${isMenuOpen
                        ? "bg-gray-500 bg-opacity-70 text-white"
                        : "bg-gray-200 text-left"
                      }`}
                  >
                    {msg.text}
                  </div>
                  <div className="flex flex-col items-start text-xs text-gray-500 ml-2">
                    {msg.readBy && msg.readBy.includes(user?.uid!) && <span>既読</span>}
                    <span>{timeString}</span>
                  </div>
                </>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

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
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">送信</button>
      </div>

      {/* メニュー（横長） */}
      {menuMsg && (
        <div
          className="absolute bg-white shadow-lg rounded border z-50 flex flex-row"
          style={{ top: menuPosition.y, left: menuPosition.x }}
        >
          <button
            className="px-4 py-2 hover:bg-gray-100"
            onClick={() => handleMenuAction("delete")}
          >
            削除
          </button>
          <button
            className="px-4 py-2 hover:bg-gray-100"
            onClick={() => handleMenuAction("copy")}
          >
            コピー
          </button>
          <button
            className="px-4 py-2 hover:bg-gray-100"
            onClick={() => handleMenuAction("reply")}
          >
            返信
          </button>
        </div>
      )}
    </div>
  );
};

export default Chat;
