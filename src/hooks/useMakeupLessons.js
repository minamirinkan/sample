// hooks/useMakeupLessons.js
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // ← パスはプロジェクトに合わせて調整

const useMakeupLessons = (studentId) => {
    const [makeupLessons, setMakeupLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!studentId) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                const colRef = collection(db, 'students', studentId, 'makeupLessons');
                const snapshot = await getDocs(colRef);

                const allLessons = [];

                snapshot.forEach(doc => {
                    const rawId = doc.id;
                    const parts = rawId.split('_');
                    const date = parts.length === 2 ? parts[1] : parts[0];

                    const data = doc.data();

                    console.log("📄 ドキュメントID:", rawId);
                    console.log("🧩 parts:", parts);
                    console.log("📆 抽出された date:", date);
                    console.log("📦 ドキュメントデータ:", data);

                    if (Array.isArray(data.lessons)) {
                        data.lessons.forEach((lesson, i) => {
                            const withDate = { ...lesson, date };
                            console.log(`✅ lesson[${i}] + date:`, withDate);
                            allLessons.push(withDate);
                        });
                    } else {
                        console.warn("⚠️ lessons が配列ではありません:", data);
                    }
                });

                console.log("✅ setMakeupLessons に渡すデータ:", allLessons);
                setMakeupLessons(allLessons);
            } catch (err) {
                console.error("振替データの取得エラー:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [studentId]);

    return { makeupLessons, loading };
};

export default useMakeupLessons;
