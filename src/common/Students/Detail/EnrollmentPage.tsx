import React, { useEffect, useState } from "react";
import { FiFilePlus } from "react-icons/fi";
import { db } from "../../../firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { Student } from "../../../contexts/types/student";
import { useNavigate } from "react-router-dom";
import EnrollmentModal from "./EnrollmentModal";

type Props = {
    formData: Student;
};

type StatusHistory = {
    yearMonth: string;
    status: string;
    changedAt: any;
    changedBy?: string;
    reason?: string;
};

const EnrollmentPage: React.FC<Props> = ({ formData }) => {
    const studentId = formData?.studentId ?? "";
    const [history, setHistory] = useState<StatusHistory[]>([]);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    // 異動履歴取得（既存）
    useEffect(() => {
        const fetchHistory = async () => {
            const q = query(
                collection(db, "students", studentId, "statusHistory"),
                orderBy("changedAt", "desc") // <- changedAtで最新順
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
        };

        fetchHistory();
    }, [studentId]);

    const handleOpenModal = () => {
        setShowModal(true);
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold flex justify-between items-center">
                在籍情報
                <button
                    className="inline-flex items-center gap-1.5 bg-orange-400 text-white text-sm px-3 py-1.5 rounded hover:bg-orange-600 active:scale-95 transition-all shadow-sm"
                    onClick={handleOpenModal}
                >
                    <FiFilePlus className="w-4 h-4" />
                    在籍情報の登録
                </button>
            </h2>

            {showModal && (
                <EnrollmentModal
                    formData={formData}
                    onClose={() => setShowModal(false)}
                    onSave={(newHistory) => setHistory(prev => [newHistory, ...prev])}
                />
            )}

            {/* 在籍履歴テーブル（既存） */}
            <table className="w-full table-auto border">
                <thead>
                    <tr className="bg-blue-50">
                        <th className="border p-2 w-24">異動年月</th>
                        <th className="border p-2 w-24">在籍区分</th>
                        <th className="border p-2 w-100">備考</th>
                        <th className="border p-2 w-20">操作</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map(h => {
                        const year = h.yearMonth.slice(0, 4);
                        const month = h.yearMonth.slice(4, 6);
                        return (
                            <tr key={h.yearMonth}>
                                <td className="border p-2 w-24 text-right">{`${year}/${month}`}</td>
                                <td className="border p-2 w-24">{h.status}</td>
                                <td className="border p-2 w-100">{h.reason || ""}</td>
                                <td className="border p-2 w-20 text-center">
                                    <button
                                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                                        onClick={() =>
                                            navigate(`/admin/students/${studentId}/enrollment/${h.yearMonth}`, {
                                                state: { formData }
                                            })
                                        }
                                    >
                                        詳細
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default EnrollmentPage;
