import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import SimpleCard from "../../../common/ToDo/ToDoContent/SimpleCard";
import EditButton from "./EditButton";
import { Student } from "../../../contexts/types/student";

type StatusHistory = {
    yearMonth: string;
    status: string;
    changedAt: any;
    changedBy?: string;
    reason?: string;
};

const EnrollmentDetail: React.FC = () => {
    const { studentId, yearMonth } = useParams<{ studentId: string; yearMonth: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const formData = location.state?.formData as Student | undefined;

    const [history, setHistory] = useState<StatusHistory | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedReason, setEditedReason] = useState("");

    useEffect(() => {
        const fetchDetail = async () => {
            if (!studentId || !yearMonth) return;

            const q = collection(db, "students", studentId, "statusHistory");
            const snapshot = await getDocs(q);

            const target = snapshot.docs
                .map(doc => doc.data() as StatusHistory)
                .find((d: any) => d.yearMonth === yearMonth);

            if (target) {
                setHistory(target as StatusHistory);
                setEditedReason((target as StatusHistory).reason || "");
            }
        };

        fetchDetail();
    }, [studentId, yearMonth]);

    const handleBack = () => {
        if (isEditing) {
            // 編集中なら URL を通常モードに戻す
            setIsEditing(false);
            navigate(`/admin/students/${studentId}/enrollment/${yearMonth}`, {
                state: { formData }
            });
        } else {
            // 編集じゃない時はブラウザ履歴で戻る
            navigate(`/admin/students/${studentId}/enrollment`, {
                state: { formData }
            });
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        navigate(`/admin/students/${studentId}/enrollment/${yearMonth}/edit`, {
            state: { formData }
        });
    };

    const handleSave = async () => {
        if (!studentId || !history?.yearMonth) return;

        try {
            const docRef = doc(db, "students", studentId, "statusHistory", history.yearMonth);
            await updateDoc(docRef, { reason: editedReason });
            setHistory({ ...history, reason: editedReason });
            setIsEditing(false);
            navigate(`/admin/students/${studentId}/enrollment/${yearMonth}`, {
                state: { formData }
            });
            alert("保存に成功しました");
        } catch (err) {
            console.error(err);
            alert("保存に失敗しました");
        }
    };

    if (!history) return <p>読み込み中…</p>;

    return (
        <div className="space-y-4">
            <EditButton
                isEditing={isEditing}
                onBack={handleBack}
                onEdit={handleEdit}
                onSave={handleSave}
            />

            <SimpleCard title="在籍情報">
                <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-3"> {/* 行間を少し広げた */}
                    <div className="font-medium">生徒名</div>
                    <div>{formData?.lastName ?? ''} {formData?.firstName ?? ''}</div>

                    <div className="font-medium">在籍区分</div>
                    <div>{history.status}</div>

                    <div className="font-medium">異動年月</div>
                    <div>{yearMonth?.slice(0, 4)}/{yearMonth?.slice(4, 6)}</div>

                    <div className="font-medium">備考</div>
                    <div>
                        {isEditing ? (
                            <input
                                type="text"
                                className="w-full border rounded p-1" // 1行で表示
                                value={editedReason}
                                onChange={(e) => setEditedReason(e.target.value)}
                            />
                        ) : (
                            <span className="break-words">{history.reason || '-'}</span>
                        )}
                    </div>
                </div>
            </SimpleCard>

            <EditButton
                isEditing={isEditing}
                onBack={handleBack}
                onEdit={handleEdit}
                onSave={handleSave}
            />
        </div>
    );
};

export default EnrollmentDetail;
