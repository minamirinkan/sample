import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import shortGrade from '../utils/shortGrade';

const gradeOrder = [
    '小1', '小2', '小3', '小4', '小5', '小6',
    '中1', '中2', '中3',
    '高1', '高2', '高3', '既卒'
];

export default function useFilteredStudents(searchKeyword, gradeFilter, classroomCode) {
    const [students, setStudents] = useState([]);

    useEffect(() => {
        if (!classroomCode) return;

        const q = query(
            collection(db, 'students'),
            where('classroomCode', '==', classroomCode)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setStudents(fetched);
        });

        return () => unsubscribe();
    }, [classroomCode]);

    const filteredStudents = students.filter((s) => {
        const name = `${s.lastName} ${s.firstName}`;
        const short = shortGrade(s.grade);
        return (
            name.includes(searchKeyword) &&
            (gradeFilter === '' || short === gradeFilter)
        );
    });

    const existingGrades = gradeOrder.filter((g) =>
        students.some((s) => shortGrade(s.grade) === g)
    );

    return { filteredStudents, existingGrades };
}
