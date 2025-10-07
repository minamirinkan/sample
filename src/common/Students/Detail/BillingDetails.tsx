// src/pages/BillingDetails.tsx
import React, { useEffect, useState } from 'react';
import SimpleCard from '../../ToDo/ToDoContent/SimpleCard';
import EditButton from './EditButton';
import { useNavigate, useLocation } from "react-router-dom";
import { DropResult } from "@hello-pangea/dnd";
import BillingDetailsTable from "./BillingDetailsTable";
import AddDetailButton from './AddDetailButton';
import { saveBilling } from "./billingService";
import { Student } from '../../../contexts/types/student';
import { Customer } from '../../../contexts/types/customer';
import { Billing } from './BillingPage';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

export interface FeeLesson {
    feeCode: string;
    amount: number;
    classType: string;
    duration: string;
    grade: string;
    lessonType: string;
    times: string;
}

export interface BillingDetail {
    code: string;
    name: string;
    taxType: string;
    price: number;
    qty: number;
    total: number;
    note: string;
}

export interface BillingDetailProps {
    billing: Billing;
    formData: Student;
    month: string;
    customer: Customer;
    isEditMode: boolean;
}

const BillingDetails: React.FC<BillingDetailProps> = ({
    billing,
    formData,
    customer,
    isEditMode,
    month
}) => {
    const [details, setDetails] = useState<BillingDetail[]>([]);
    const [isEditing, setIsEditing] = useState(isEditMode);
    const navigate = useNavigate();
    const location = useLocation();
    const [targetMonth, setTargetMonth] = useState(billing?.month || '');

    const studentId = formData?.studentId ?? '';
    const studentName = formData.fullname;
    const grade = formData.grade;
    const classroomCode = formData.classroomCode;
    const customerUid = customer.uid;

    // 🔹 ここから追加: Firestoreから明細取得
    useEffect(() => {
        const fetchBillingDetails = async () => {
            if (!customer || !month || !studentId) return;

            try {
                const classroomCode = customer.classroomCode || "000";
                const billingDocId = `${month}_${classroomCode}_${studentId}`;
                const billingRef = doc(db, "billings", billingDocId);
                const billingSnap = await getDoc(billingRef);

                if (billingSnap.exists()) {
                    const data = billingSnap.data();
                    setDetails(data.details || []);
                } else {
                    setDetails([]);
                }
            } catch (err) {
                console.error("請求明細の取得に失敗しました:", err);
            }
        };

        fetchBillingDetails();
    }, [customer, month, studentId]);
    // 🔹 ここまで追加

    useEffect(() => {
        setIsEditing(isEditMode); // URL変更に追従
    }, [isEditMode]);

    const subtotal = details.reduce((acc, d) => acc + d.price, 0);
    const taxRate = 0.1;
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    const handleBack = () => {
        setIsEditing(false);
        if (location.pathname.endsWith("/edit")) {
            navigate(location.pathname.replace(/\/edit$/, ""), {
                replace: true,
                state: { billing, formData, customer }
            });
        } else {
            navigate(-1);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        if (!location.pathname.endsWith("/edit")) {
            navigate(`${location.pathname}/edit`, {
                replace: true,
                state: { billing, formData, customer }
            });
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
                taxRate,
                billing.type
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

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const newDetails = Array.from(details);
        const [removed] = newDetails.splice(result.source.index, 1);
        newDetails.splice(result.destination.index, 0, removed);
        setDetails(newDetails);
    };

    return (
        <div className="space-y-4">
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
                    <div>請求種別: {billing.type === "monthly" ? "月締" : "都度"}</div>
                    <div>請求対象年月: {targetMonth.slice(0, 4)}年{targetMonth.slice(4, 6)}月</div>
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
                    customer={customer}
                    studentId={studentId}
                />
            </SimpleCard>

            {/* 備考・合計 */}
            <div className="flex gap-4">
                <SimpleCard title="備考" className="flex-1">
                    {targetMonth.slice(0, 4)}年{targetMonth.slice(4, 6)}月分の授業料
                </SimpleCard>
                <SimpleCard title="合計金額" className="flex-1">
                    <div>小計: {Math.floor(subtotal).toLocaleString()}円</div>
                    <div>消費税率: {taxRate * 100}%</div>
                    <div>消費税額: {Math.floor(taxAmount).toLocaleString()}円</div>
                    <div>合計金額: {Math.floor(totalAmount).toLocaleString()}円</div>
                </SimpleCard>
            </div>

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

export default BillingDetails;
