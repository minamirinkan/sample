// src/pages/billingService.ts
import { db } from "../../../firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { BillingDetail } from "./BillingDetailsTable";

export const saveBilling = async (
    customerUid: string,
    classroomCode: string,
    studentId: string,
    studentName: string,
    targetMonth: string,
    details: BillingDetail[],
    subtotal: number,
    taxRate: number
) => {
    const yyyymm = targetMonth.replace("-", "");

    // details を Firestore 用に整形
    const safeDetails = details.map((d) => ({
        code: d.code ?? "",
        name: d.name ?? "",
        taxType: d.taxType ?? "課税",
        price: d.price ?? 0,
        qty: d.qty ?? 1,
        total: d.total ?? 0,
        note: d.note ?? "",
    }));

    const data = {
        studentId: studentId ?? "",
        studentName: studentName ?? "",
        customerUid: customerUid ?? "",
        classroomCode: classroomCode ?? "",
        month: yyyymm,
        type: "monthly",
        details: safeDetails,
        subtotal: subtotal ?? 0,
        taxRate: taxRate ?? 0,
        total: (subtotal ?? 0) + (subtotal ?? 0) * (taxRate ?? 0),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };

    // 保護者用
    const customerInvoiceRef = doc(
        collection(db, "customers", customerUid, "billings"),
        `${studentId}_${yyyymm}`
    );

    // 会社用
    const companyInvoiceRef = doc(
        collection(db, "billings"),
        `${yyyymm}_${classroomCode}_${studentId}`
    );

    await setDoc(customerInvoiceRef, data, { merge: true });
    await setDoc(companyInvoiceRef, data, { merge: true });
};
