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
                    console.log("📄 ドキュメントID（＝classroomCode_日付）:", doc.id);
                    const data = doc.data();
                    console.log("📦 データ内容:", data);

                    // doc.idから日付だけ抜き出す
                    const rawId = doc.id; // 例: "047_2025-06-26"
                    const date = rawId.split('_')[1] || rawId; // '_'がなければそのまま

                    if (Array.isArray(data.lessons)) {
                        data.lessons.forEach(lesson => {
                            allLessons.push({
                                ...lesson,
                                date,
                            });
                        });
                    }
                });

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
