// src/hooks/useStudents.js
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function useStudents(classroom) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                let q = collection(db, 'students');
                if (classroom) {
                    q = query(q, where('classroom', '==', classroom));
                }

                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    code: doc.id,
                    ...doc.data(),
                }));
                setStudents(data);
            } catch (err) {
                console.error('Error fetching students:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [classroom]);

    return { students, loading };
}
