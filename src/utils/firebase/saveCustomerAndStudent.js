// src/utils/firebase/saveCustomerAndStudent.js
import { db } from '../../firebase'; // Firebaseの初期化ファイル
import { doc, writeBatch, serverTimestamp, Timestamp } from 'firebase/firestore';

export const registerCustomerAndStudent = async ({ uid, customerName, phoneNumber, studentData }) => {
    const batch = writeBatch(db);

    const customerRef = doc(db, 'customers', uid);
    const studentRef = doc(db, 'students', studentData.studentId);

    batch.set(customerRef, {
        uid,
        role: 'customer',
        studentIds: [studentData.studentId],
        name: customerName,
        phoneNumber,
        createdAt: serverTimestamp(),
        lastLogin: null,
    });

    batch.set(studentRef, {
        ...studentData,
        entryDate: Timestamp.fromDate(new Date(studentData.entryDate)),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    try {
        await batch.commit();
        return true;
    } catch (error) {
        console.error('登録失敗', error);
        return false;
    }
};
