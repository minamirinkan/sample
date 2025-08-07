import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { format } from "date-fns";

type Message = {
  id: string;
  text: string;
  senderId: string;
  createdAt: any;
  readBy: string[];
  imageUrl?: string;
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
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

      // 自分以外のメッセージで未読なら既読に更新
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !roomId || !user) return;

    const storageRef = ref(
      storage,
      `chatImages/${roomId}/${Date.now()}_${file.name}`
    );
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    await addDoc(collection(db, "rooms", roomId, "messages"), {
      text: "",
      imageUrl: downloadURL,
      senderId: user.uid,
      createdAt: serverTimestamp(),
      readBy: [user.uid],
    });
  };

  // 未読件数計算
  const unreadCount = messages.filter(
    (msg) => !msg.readBy.includes(user?.uid ?? "")
  ).length;

  let lastDate: string | null = null;

  return (
    <div className="flex flex-col h-full border rounded p-4">
      {/* 未読メッセージ数表示 */}
      <div className="mb-2 text-sm text-red-600 font-semibold">
        未読メッセージ: {unreadCount}
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-grow overflow-y-auto mb-4">
        {messages.map((msg) => {
          const isOwn = msg.senderId === user?.uid;
          const msgDate = msg.createdAt?.toDate
            ? msg.createdAt.toDate()
            : new Date();
          const dateStr = msgDate.toDateString();

          const showDateDivider = dateStr !== lastDate;
          lastDate = dateStr;

          return (
            <React.Fragment key={msg.id}>
              {showDateDivider && (
                <div className="text-center text-gray-500 my-2 text-sm font-semibold">
                  {format(msgDate, "yyyy年MM月dd日")}
                </div>
              )}

              <div
                className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}
              >
                <div>
                  {editingId === msg.id ? (
                    <>
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="border rounded px-2 py-1 max-w-xs"
                      />
                      <div className="mt-1 flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-300 px-2 rounded"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={async () => {
                            const msgRef = doc(
                              db,
                              "rooms",
                              roomId,
                              "messages",
                              msg.id
                            );
                            await updateDoc(msgRef, { text: editText });
                            setEditingId(null);
                          }}
                          className="bg-green-500 text-white px-2 rounded"
                        >
                          保存
                        </button>
                      </div>
                    </>
                  ) : (
                    <div
                      onDoubleClick={() => {
                        if (isOwn) {
                          setEditingId(msg.id);
                          setEditText(msg.text);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg max-w-xs break-words ${isOwn
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-200 text-black rounded-bl-none"
                        }`}
                    >
                      {msg.text}
                    </div>
                  )}

                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="送信画像"
                      className="max-w-xs rounded mt-1 border"
                    />
                  )}

                  <div className="text-xs text-gray-600 mt-1 text-right">
                    {msg.createdAt?.toDate
                      ? msg.createdAt.toDate().toLocaleString()
                      : ""}
                    {isOwn && msg.readBy.some((id) => id !== user.uid) && (
                      <span className="ml-2 text-green-600">既読</span>
                    )}
                  </div>
                </div>

                {isOwn && editingId !== msg.id && (
                  <button
                    onClick={async () => {
                      if (window.confirm("このメッセージを消しますか？")) {
                        const msgRef = doc(db, "rooms", roomId, "messages", msg.id);
                        await deleteDoc(msgRef);
                      }
                    }}
                    className="ml-2 text-red-500 hover:text-red-700"
                    title="メッセージ削除"
                  >
                    🗑️
                  </button>

                )}
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* メッセージ入力フォーム */}
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
          disabled={editingId !== null} // 編集中は送信不可にする選択肢
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 rounded"
          disabled={editingId !== null || !newMessage.trim()}
        >
          送信
        </button>
      </div>

      {/* 画像アップロード */}
      <div className="mt-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="text-sm"
          disabled={editingId !== null}
        />
      </div>
    </div>
  );
};

export default Chat;
