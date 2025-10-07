// src/hooks/useTeachers.ts

import { useEffect, useState } from 'react';
import {  onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import type { Teacher } from '@/schemas';

export default function useTeacher(teacherUid?: string) {
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!teacherUid) return;

        // リアルタイム取得したい場合は onSnapshot を使用
        const unsub = onSnapshot(doc(db, "teachers", teacherUid), (docSnap) => {
            if (docSnap.exists()) {
                setTeacher(docSnap.data() as Teacher);
            } else {
                setTeacher(null);
            }
            setLoading(false);
        });

        // クリーンアップ
        return () => unsub();
    }, [teacherUid]);

    return { teacher, loading };
};