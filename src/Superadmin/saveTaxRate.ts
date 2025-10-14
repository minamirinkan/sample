// src/utils/saveTaxRate.ts
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

/**
 * 消費税率を保存（上書き専用）
 * @param taxRate 税率（%）
 * @param userId 保存者UID
 */
export const saveTaxRate = async (taxRate: number, userId: string) => {
    const ref = doc(db, "Tax", "current"); // 固定IDで上書き
    await setDoc(ref, {
        taxRate,
        createdBy: userId,
        updatedAt: serverTimestamp(),
    });
};
