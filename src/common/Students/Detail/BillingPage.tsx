// src/pages/BillingPage.tsx
import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import SimpleCard from '../../../common/ToDo/ToDoContent/SimpleCard';
import EditButton from './EditButton';
import { useNavigate, useLocation } from "react-router-dom";
import { DropResult } from "@hello-pangea/dnd";
import BillingDetailsTable, { BillingDetail } from "./BillingDetailsTable";

interface FeeLesson {
    feeCode: string;
    amount: number;
    classType: string;
    duration: string;
    grade: string;
    lessonType: string;
    times: string;
}

export interface BillingPageProps {
    studentId: string;
    studentName: string;
    classroomCode: string;
    grade: string;
    customerUid: string;
    targetMonth: string; // 例: "2025-09"
    isEditMode?: boolean;
}

const BillingPage: React.FC<BillingPageProps> = ({
    studentId,
    studentName,
    classroomCode,
    grade,
    customerUid,
    targetMonth,
}) => {
    const [feeLessons, setFeeLessons] = useState<FeeLesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [details, setDetails] = useState<BillingDetail[]>([]);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const yyyymm = targetMonth.replace("-", "");
                const code = classroomCode || "000";
                let feeMasterDocId = `${yyyymm}_${code}`;
                let feeMasterRef = doc(db, "feeMaster", feeMasterDocId);
                let feeMasterSnap = await getDoc(feeMasterRef);

                if (!feeMasterSnap.exists()) {
                    feeMasterRef = doc(db, "feeMaster", `${yyyymm}_000`);
                    feeMasterSnap = await getDoc(feeMasterRef);
                }

                if (!feeMasterSnap.exists()) {
                    alert("feeMasterが存在しません");
                    return;
                }

                const feeData = feeMasterSnap.data() || {};

                // 顧客契約取得
                const contractsRef = collection(db, "customers", customerUid, "contracts");
                const contractsSnap = await getDocs(contractsRef);

                const contractIds = new Set<string>();
                contractsSnap.forEach((doc) => {
                    const id = doc.id;
                    const idMatch = id.match(/^(.+)-(\d{6})-(.+)$/);
                    if (!idMatch) return;
                    const [, contractStudentCode, contractYyyymm, contractFeeCode] = idMatch;
                    if (contractStudentCode === studentId && contractYyyymm === yyyymm) {
                        contractIds.add(contractFeeCode);
                    }
                });

                const lessons: FeeLesson[] = Object.entries(feeData)
                    .map(([feeCode, v]) => {
                        const lesson = v as FeeLesson;
                        if ((lesson.lessonType === "通常" || lesson.lessonType === "演習クラス") && !contractIds.has(feeCode)) {
                            return null;
                        }
                        return { ...lesson, feeCode };
                    })
                    .filter(Boolean) as FeeLesson[];

                setFeeLessons(lessons);

                // details に変換
                const newDetails: BillingDetail[] = lessons.map((lesson) => ({
                    code: lesson.feeCode,
                    name: lesson.lessonType === "通常" ? "授業料" : lesson.lessonType === "演習クラス" ? "演習クラス" : "諸費用",
                    taxType: "課税",
                    price: lesson.amount,
                    qty: 1,
                    total: lesson.amount,
                    note: lesson.grade,
                }));
                setDetails(newDetails);
            } catch (error) {
                console.error(error);
                alert("データ取得に失敗しました");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [classroomCode, targetMonth, studentId, customerUid]);

    if (loading) return <div>読み込み中...</div>;

    const handleBack = () => {
        setIsEditing(false);

        // URLを /edit なしに戻す
        if (location.pathname.endsWith("/edit")) {
            navigate(location.pathname.replace(/\/edit$/, ""), { replace: true });
        } else {
            // それ以外は一つ前に戻る
            navigate(-1);
        }
    };

    const handleEdit = () => {
        // 編集モードに切替
        setIsEditing(true);

        // URLを /edit に変更
        if (!location.pathname.endsWith("/edit")) {
            navigate(`${location.pathname}/edit`, { replace: true });
        }
    };

    const handleSave = () => {
        console.log("保存（あとでFirestore処理追加）");
        setIsEditing(false);
    };

    const handleDelete = () => {
        console.log("削除（あとでFirestore処理追加）");
    };

    const handleChange = (index: number, field: keyof BillingDetail, value: string | number) => {
        setDetails((prev) => {
            const newDetails = [...prev];
            newDetails[index] = { ...newDetails[index], [field]: value };
            return newDetails;
        });
    };

    // ドラッグ＆ドロップ
    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const newDetails = Array.from(details);
        const [removed] = newDetails.splice(result.source.index, 1);
        newDetails.splice(result.destination.index, 0, removed);
        setDetails(newDetails);
    };

    const subtotal = details.reduce((acc, d) => acc + d.price, 0);
    const taxRate = 0.1;
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    return (
        <div className="space-y-4">
            {/* ボタン */}
            <EditButton
                isEditing={isEditing}
                onBack={handleBack}
                onEdit={handleEdit}
                onSave={handleSave}
                onDelete={handleDelete}
            />

            {/* 請求情報 */}
            <SimpleCard title="請求情報">
                <div className="space-y-1">
                    <div>生徒コード: {studentId}</div>
                    <div>生徒名: {studentName}</div>
                    <div>学年: {grade}</div>
                    <div>顧客UID: {customerUid}</div>
                </div>
            </SimpleCard>

            {/* 請求種別・年月 */}
            <SimpleCard title="請求種別・年月">
                <div className="space-y-1">
                    <div>請求種別: 通常授業</div>
                    <div>請求対象年月: {targetMonth}</div>
                    <div>締日: 25日</div>
                </div>
            </SimpleCard>

            {/* 請求明細 */}
            <SimpleCard title="請求明細">
                <BillingDetailsTable
                    details={details}
                    isEditing={isEditing}
                    onChange={handleChange}
                    onDragEnd={handleDragEnd}
                />
            </SimpleCard>

            {/* 備考・合計 */}
            <div className="flex gap-4">
                <SimpleCard title="備考" className="flex-1">
                    {targetMonth}分の授業料
                </SimpleCard>
                <SimpleCard title="合計金額" className="flex-1">
                    <div>小計: {subtotal}</div>
                    <div>消費税率: {taxRate * 100}%</div>
                    <div>消費税額: {taxAmount}</div>
                    <div>合計金額: {totalAmount}</div>
                </SimpleCard>
            </div>
            {/* ボタン */}
            <EditButton
                isEditing={isEditing}
                onBack={handleBack}
                onEdit={handleEdit}
                onSave={handleSave}
                onDelete={handleDelete}
            />
        </div>

    );
};

export default BillingPage;
