// src/pages/billingService.ts
import { db } from "../../../firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { BillingDetail } from "./BillingDetails";

export const saveBilling = async (
    customerUid: string,
    classroomCode: string,
    studentId: string,
    studentName: string,
    targetMonth: string,
    details: BillingDetail[],
    subtotal: number,
    taxRate: number,
    type: "monthly" | "spot"
) => {
    const yyyymm = targetMonth.replace("-", "");

    // ✅ 明細整形
    const safeDetails = details.map((d) => ({
        code: d.code ?? "",
        name: d.name ?? "",
        taxType: d.taxType ?? "課税",
        price: d.price ?? 0,
        qty: d.qty ?? 1,
        total: d.total ?? 0,
        note: d.note ?? "",
    }));

    // ✅ 消費税・合計計算（小数点以下切り捨て）
    const taxAmount = Math.floor((subtotal ?? 0) * (taxRate ?? 0) / 100);
    const total = Math.floor((subtotal ?? 0) + taxAmount);

    // ✅ データ本体
    const data = {
        studentId: studentId ?? "",
        studentName: studentName ?? "",
        customerUid: customerUid ?? "",
        classroomCode: classroomCode ?? "",
        month: yyyymm,
        type,
        details: safeDetails,
        subtotal: Math.floor(subtotal ?? 0),
        taxRate: taxRate ?? 0,
        taxAmount,
        total,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    // ✅ Firestore ドキュメントID生成ルール
    const baseId = `${yyyymm}_${classroomCode}_${studentId}_${type}`;
    const docId = type === "spot" ? `${baseId}_${Date.now()}` : baseId;

    // ✅ 保護者用サブコレクション
    const customerInvoiceRef = doc(
        collection(db, "customers", customerUid, "billings"),
        docId
    );

    // ✅ 会社用コレクション
    const companyInvoiceRef = doc(collection(db, "billings"), docId);

    // ✅ 両方に保存（merge対応）
    await setDoc(customerInvoiceRef, data, { merge: true });
    await setDoc(companyInvoiceRef, data, { merge: true });
};
