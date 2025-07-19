// src/hooks/useTeachers.js
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';  // dbをimportしている場合
import { useAuth } from '../AuthContext.tsx';

export function useTeachers() {
    const { adminData } = useAuth();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeachers = async () => {
            if (!adminData?.classroomCode) return;

            setLoading(true);
            setError(null);
            try {
                const q = query(
                    collection(db, 'teachers'),
                    where('classroomCode', '==', adminData.classroomCode),
                    where('status', '==', '在職中')
                );
                const snapshot = await getDocs(q);
                const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setTeachers(list);
            } catch (e) {
                setError(e);
            } finally {
                setLoading(false);
            }
        };

        fetchTeachers();
    }, [adminData]);

    return { teachers, loading, error };
}
