// src/components/StudentCodeModal.js
import { useState } from "react";
import { motion } from "framer-motion";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function StudentCodeModal({ uid, onClose }) {
    const [code, setCode] = useState("");

    const handleSubmit = async () => {
        if (!/^\d{8}$/.test(code)) {
            alert("生徒コードは8桁の数字で入力してください");
            return;
        }

        try {
            await setDoc(doc(db, "customers", uid), {
                studentCode: code
            });
            alert("登録が完了しました！");
            onClose();
        } catch (err) {
            alert("データの保存に失敗しました");
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white p-6 rounded-lg shadow-xl w-96"
            >
                <h2 className="text-xl font-bold mb-4">生徒コードの入力</h2>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="8桁の生徒コード"
                    className="w-full px-4 py-2 border rounded mb-4"
                />
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-black"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        登録
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
