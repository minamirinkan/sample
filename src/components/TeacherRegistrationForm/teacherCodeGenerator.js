import { useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export const useGenerateTeacherCode = (classroomCode) => {
    const generateTeacherCode = useCallback(async () => {
        if (!classroomCode) return '';

        const q = query(
            collection(db, 'teachers'),
            where('code', '>=', `t${classroomCode}`),
            where('code', '<', `t${classroomCode}9999`)
        );

        const snapshot = await getDocs(q);

        let maxNumber = 0;
        snapshot.forEach((doc) => {
            const code = doc.data().code;
            const num = parseInt(code?.slice(4), 10);
            if (!isNaN(num) && num > maxNumber) maxNumber = num;
        });

        const newNumber = String(maxNumber + 1).padStart(4, '0');
        return `t${classroomCode}${newNumber}`;
    }, [classroomCode]);

    return generateTeacherCode;
};
