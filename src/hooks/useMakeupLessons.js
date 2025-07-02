import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const useMakeupLessons = (studentId) => {
    const [makeupLessons, setMakeupLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!studentId) {
            setLoading(false);
            return;
        }

        const colRef = collection(db, 'students', studentId, 'makeupLessons');

        setLoading(true);
        const unsubscribe = onSnapshot(colRef, (snapshot) => {
            const allLessons = [];

            snapshot.forEach(doc => {
                const rawId = doc.id;
                const parts = rawId.split('_');
                const date = parts.length === 2 ? parts[1] : parts[0];
                const data = doc.data();

                if (Array.isArray(data.lessons)) {
                    data.lessons.forEach((lesson) => {
                        allLessons.push({ ...lesson, date });
                    });
                }
            });

            setMakeupLessons(allLessons);
            setLoading(false);
        }, (error) => {
            console.error("🔥 onSnapshot error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [studentId]);

    return { makeupLessons, loading };
};

export default useMakeupLessons;
