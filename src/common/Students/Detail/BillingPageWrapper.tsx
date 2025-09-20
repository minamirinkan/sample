// src/pages/BillingPageWrapper.tsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import BillingPage, { BillingPageProps } from "./BillingPage";

const BillingPageWrapper: React.FC = () => {
    const { studentId } = useParams<{ studentId: string }>();
    const location = useLocation();
    const [propsData, setPropsData] = useState<BillingPageProps | null>(null);
    const [loading, setLoading] = useState(true);

    const isEditMode = location.pathname.endsWith("/edit");

    useEffect(() => {
        const fetchData = async () => {
            if (!studentId) return;

            try {
                // studentデータ取得
                const studentRef = doc(db, "students", studentId);
                const studentSnap = await getDoc(studentRef);
                const studentData = studentSnap.exists() ? studentSnap.data() : null;

                if (!studentData) {
                    alert("生徒データが見つかりません");
                    setLoading(false);
                    return;
                }

                setPropsData({
                    studentId,
                    studentName: studentData.name || "",
                    classroomCode: studentData.classroomCode || "",
                    grade: studentData.grade || "",
                    customerUid: studentData.customerUid || "",
                    targetMonth: "", // 必要に応じて選択・初期値を設定
                    isEditMode,     // BillingPage 側で表示/編集切替に使用
                });
            } catch (error) {
                console.error(error);
                alert("データ取得エラー");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [studentId, isEditMode]);

    if (loading || !propsData) return <div>読み込み中...</div>;

    return <BillingPage {...propsData} />;
};

export default BillingPageWrapper;
