import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Classroom } from '../types/classroom';
import { useAuth } from '../AuthContext'; // classroomCode / role を取得

export function useClassrooms() {
  const { classroomCode, role, loading: authLoading } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const fetchClassrooms = async () => {
      if (authLoading) return;

      setLoading(true);
      setError(null);

      try {
        let classroomQuery;

        if (role === 'superadmin' || !classroomCode) {
          classroomQuery = collection(db, 'classrooms'); // 全件取得
        } else {
          classroomQuery = query(
            collection(db, 'classrooms'),
            where('code', '==', classroomCode)
          ); // 自教室のみ取得
        }

        const snapshot = await getDocs(classroomQuery);
        const list = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            code: data.code,
            name: data.name,
            email: data.email,
            phoneNumber: data.phoneNumber,
            faxNumber: data.faxNumber,
            addressInfo: {
              postalCode: data.addressInfo?.postalCode || '',
              prefecture: data.addressInfo?.prefecture || '',
              city: data.addressInfo?.city || '',
              cityKana: data.addressInfo?.cityKana || '',
              streetAddress: data.addressInfo?.streetAddress || '',
              streetAddressKana: data.addressInfo?.streetAddressKana || '',
            },
            adminUid: data.adminUid,
            createdAt: data.createdAt,
            lastLogin: data.lastLogin,
            leaderLastName: data.leaderLastName,
            leaderFirstName: data.leaderFirstName,
            leaderLastKana: data.leaderLastKana,
            leaderFirstKana: data.leaderFirstKana,
            minimumWage: data.minimumWage,
            tuitionName: data.tuitionName,
            teacherFeeName: data.teacherFeeName,
            periodTimeName: data.periodTimeName,
          } as Classroom;
        });

        setClassrooms(list);
        console.log(`🏫 Classrooms for role="${role}" classroomCode="${classroomCode}"`, list);
      } catch (e) {
        console.error('❌ Error fetching classrooms:', e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, [role, classroomCode, authLoading]);

  return { classrooms, loading, error };
}
