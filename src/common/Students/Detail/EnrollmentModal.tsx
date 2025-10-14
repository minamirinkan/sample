import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import {
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";
import { Student } from "../../../contexts/types/student";

type StatusHistory = {
    yearMonth: string;
    status: string;
    changedAt: any;
    changedBy?: string;
    reason?: string;
};

type Props = {
    formData: Student;
    onClose: () => void;
    onSave: (newHistory: StatusHistory) => void;
};

const EnrollmentModal: React.FC<Props> = ({ formData, onClose, onSave }) => {
    const studentId = formData.studentId!;
    const [history, setHistory] = useState<StatusHistory[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>(
        new Date().getFullYear().toString()
    );
    const [selectedMonth, setSelectedMonth] = useState<string>(
        (new Date().getMonth() + 1).toString()
    );
    const [status, setStatus] = useState<string>("");
    const [reason, setReason] = useState<string>("");

    // 最新履歴取得
    useEffect(() => {
        const fetchHistory = async () => {
            const q = query(
                collection(db, "students", studentId, "statusHistory"),
                orderBy("changedAt", "desc")
            );
            const snapshot = await getDocs(q);
            const data: StatusHistory[] = snapshot.docs.map((doc) => ({
                yearMonth: doc.data().yearMonth,
                status: doc.data().status,
                changedAt: doc.data().changedAt,
                changedBy: doc.data().changedBy,
                reason: doc.data().reason,
            }));
            setHistory(data);

            const latestStatus = data[0]?.status || "入会";
            const defaultOption =
                latestStatus === "入会"
                    ? "休会"
                    : latestStatus === "休会"
                        ? "復会"
                        : latestStatus === "退会"
                            ? "復会"
                            : "入会";
            setStatus(defaultOption);
        };

        fetchHistory();
    }, [studentId]);

    // ステータス選択肢を動的に
    const getStatusOptions = (): string[] => {
        const latestStatus = history[0]?.status || "入会";
        if (latestStatus === "入会") return ["休会", "退会"];
        if (latestStatus === "休会") return ["復会", "退会"];
        if (latestStatus === "退会") return ["復会"];
        return ["入会"];
    };

    const handleSave = async () => {
        try {
            const yearMonth = `${selectedYear}${selectedMonth.padStart(2, "0")}`;
            const docRef = doc(
                db,
                "students",
                studentId,
                "statusHistory",
                yearMonth
            ); // ← IDを明示指定
            await setDoc(docRef, {
                yearMonth,
                status,
                reason,
                changedAt: serverTimestamp(),
                changedBy: "admin", // 実際はログインユーザー
            });

            const newHistory: StatusHistory = {
                yearMonth,
                status,
                reason,
                changedAt: new Date(),
                changedBy: "admin",
            };
            onSave(newHistory);
            onClose();
            alert("在籍情報を登録しました");
        } catch (err) {
            console.error(err);
            alert("登録に失敗しました");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md w-[400px]">
                <h3 className="text-lg font-semibold mb-4">在籍情報登録</h3>

                <div className="mb-3">
                    <label className="block font-medium mb-1">生徒名</label>
                    <div>
                        {formData.lastName} {formData.firstName}
                    </div>
                </div>

                <div className="mb-3">
                    <label className="block font-medium mb-1">異動年月</label>
                    <div className="flex gap-2">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="border rounded p-1 flex-1"
                        >
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(
                                (y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                )
                            )}
                        </select>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="border rounded p-1 flex-1"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mb-3">
                    <label className="block font-medium mb-1">在籍区分</label>
                    <div className="flex gap-4">
                        {getStatusOptions().map((option) => (
                            <label key={option} className="inline-flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="status"
                                    value={option}
                                    checked={status === option}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="form-radio"
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="mb-3">
                    <label className="block font-medium mb-1">備考</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full border rounded p-1"
                    />
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={onClose}
                        className="px-3 py-1 rounded border hover:bg-gray-100"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                    >
                        登録
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EnrollmentModal;
