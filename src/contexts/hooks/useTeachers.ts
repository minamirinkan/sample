// src/hooks/useTeachers.ts

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, Query } from 'firebase/firestore';
import { db } from '../../firebase';
import type { Teacher } from '@/schemas';

export default function useTeachers(classroomCode?: string) {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchTeachers = async () => {
            setLoading(true);
            setError(null);
            try {
                let q: Query = collection(db, 'teachers');
                if (classroomCode) {
                    q = query(q, where('classroomCode', '==', classroomCode), where('status', '==', '在職中'));
                }
                const snapshot = await getDocs(q);

                // snapshotから取得した各docをTeacher型に変換する
                const data = snapshot.docs.map(doc => {
                    // オブジェクトを1つずつTeacher型として型アサーション（変換）する
                    return {
                        id: doc.id,
                        ...doc.data(),
                    } as Teacher; // <-- ★修正点：ここで各オブジェクトを変換
                });

                setTeachers(data);

            } catch (err) {
                console.error('Error fetching teachers:', err);
                if (err instanceof Error) {
                    setError(err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTeachers();
    }, [classroomCode]);

    return { teachers, loading, error };
}
