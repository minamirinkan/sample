// utils/studentCodeGenerator.js
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

export const generateStudentCode = async (classroomCode) => {
    if (!classroomCode) throw new Error('classroomCode is required');
    const db = getFirestore();

    const prefix = `s${classroomCode}`;
    const q = query(
        collection(db, 'students'),
        where('code', '>=', prefix),
        where('code', '<', `${prefix}z`)
    );

    const snapshot = await getDocs(q);
    const existingCodes = snapshot.docs.map(doc => doc.data().code);

    let maxNumber = 0;
    existingCodes.forEach(code => {
        // prefixの長さ分を切り取る
        const numberPart = code.slice(prefix.length);
        const num = parseInt(numberPart, 10);
        if (!isNaN(num) && num > maxNumber) maxNumber = num;
    });

    const nextNumber = (maxNumber + 1).toString().padStart(4, '0');
    return `${prefix}${nextNumber}`;
};
