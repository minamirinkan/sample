// src/pages/BillingPage.tsx
import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import SimpleCard from '../../../common/ToDo/ToDoContent/SimpleCard';
import EditButton from './EditButton';
import { useNavigate, useLocation } from "react-router-dom";
import { DropResult } from "@hello-pangea/dnd";
import BillingDetailsTable, { BillingDetail } from "./BillingDetailsTable";
import { generateTuitionName, generateTuitionNameShort } from './tuitionName';
import AddDetailButton from './AddDetailButton';
import { saveBilling } from "./billingService";

export interface FeeLesson {
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
                let feeMasterRef = doc(db, "FeeMaster", feeMasterDocId);
                let tuitionRef = doc(collection(feeMasterRef, "categories"), "tuition");
                let tuitionSnap = await getDoc(tuitionRef);

                if (!tuitionSnap.exists()) {
                    feeMasterRef = doc(db, "FeeMaster", `${yyyymm}_000`);
                    tuitionRef = doc(collection(feeMasterRef, "categories"), "tuition");
                    tuitionSnap = await getDoc(tuitionRef);
                }

                if (!tuitionSnap.exists()) {
                    console.log("tuitionが存在しません");
                    return;
                }

                const feeData = tuitionSnap.data() || {};

                // 顧客契約取得
                const contractsRef = collection(db, "customers", customerUid, "contracts");
                const contractsSnap = await getDocs(contractsRef);

                const contractFeeCodes = new Set<string>();
                contractsSnap.forEach((doc) => {
                    const id = doc.id;
                    // uid-YYYYMM-feeCode の形式なので最後の feeCode を抜き出す
                    const idMatch = id.match(/^.+-(\d{6})-(.+)$/);
                    if (!idMatch) return;
                    const [, contractYyyymm, contractFeeCode] = idMatch;
                    if (contractYyyymm === yyyymm && doc.data().studentId === studentId) {
                        contractFeeCodes.add(contractFeeCode);
                    }
                });

                const lessons: FeeLesson[] = Object.entries(feeData)
                    .map(([feeCode, v]) => {
                        const lesson = v as FeeLesson;
                        // 通常・演習クラスは契約がある feeCode だけ残す
                        if (
                            (lesson.lessonType === "通常" || lesson.lessonType === "演習クラス") &&
                            !contractFeeCodes.has(feeCode)
                        ) {
                            return null;
                        }
                        return { ...lesson, feeCode };
                    })
                    .filter(Boolean) as FeeLesson[];

                setFeeLessons(lessons);

                // details に変換
                const newDetails: BillingDetail[] = lessons.map((lesson) => ({
                    code: lesson.feeCode,
                    name:
                        lesson.lessonType === "通常" || lesson.lessonType === "演習クラス"
                            ? (isEditing
                                ? generateTuitionNameShort(lesson.feeCode, targetMonth) // 編集モード用（短縮版）
                                : generateTuitionName(lesson.feeCode, targetMonth))    // 通常モード用（詳細版）
                            : "諸費用",
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

    const handleSave = async () => {
        try {
            await saveBilling(
                customerUid,
                classroomCode,
                studentId,
                studentName,
                targetMonth,
                details,
                subtotal,
                taxRate
            );
            alert("請求書を保存しました");
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert("保存に失敗しました");
        }
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

    const handleAddDetail = () => {
        setDetails((prev) => [
            ...prev,
            {
                code: "",
                name: "新しい項目",
                taxType: "課税",
                price: 0,
                qty: 1,
                total: 0,
                note: "",
            },
        ]);
    };

    const handleDeleteRow = (index: number) => {
        setDetails((prev) => prev.filter((_, i) => i !== index));
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
            <SimpleCard
                title={
                    <div className="flex justify-between items-center">
                        <span>請求明細</span>
                        {isEditing && <AddDetailButton onClick={handleAddDetail} />}
                    </div>
                }
            >
                <BillingDetailsTable
                    details={details}
                    isEditing={isEditing}
                    onChange={handleChange}
                    onDragEnd={handleDragEnd}
                    onDeleteRow={handleDeleteRow}
                    studentGrade={grade}
                    month={targetMonth}
                    customerUid={customerUid}
                    studentId={studentId}
                    studentLessons={feeLessons}
                />
            </SimpleCard>

            {/* 備考・合計 */}
            <div className="flex gap-4">
                <SimpleCard title="備考" className="flex-1">
                    {targetMonth}分の授業料
                </SimpleCard>
                <SimpleCard title="合計金額" className="flex-1">
                    <div>小計: {subtotal.toLocaleString()}円</div>
                    <div>消費税率: {taxRate * 100}%</div>
                    <div>消費税額: {taxAmount.toLocaleString()}円</div>
                    <div>合計金額: {totalAmount.toLocaleString()}円</div>
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
