import { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext'; // パスは環境に合わせて

const TeacherList = () => {
    const { adminData } = useAuth();
    const [teachers, setTeachers] = useState([]);

    useEffect(() => {
        const fetchTeachers = async () => {
            if (!adminData?.classroomCode) return;

            const db = getFirestore();
            const q = query(
                collection(db, 'teachers'),
                where('classroomCode', '==', adminData.classroomCode),
                where('status', '==', '在職中')
            );
            const snapshot = await getDocs(q);
            const teacherList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTeachers(teacherList);
        };

        fetchTeachers();
    }, [adminData]);

    return (
        <ul>
            {teachers.map(teacher => (
                <li key={teacher.code}>{teacher.name}</li>
            ))}
        </ul>
    );
};

export default TeacherList;
