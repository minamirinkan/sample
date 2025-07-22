import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Classroom } from '../types/classroom';

export function useClassrooms() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        const fetchClassrooms = async () => {
            setLoading(true);
            setError(null);
            try {
                const snapshot = await getDocs(collection(db, 'classrooms'));
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
            } catch (e) {
                setError(e);
            } finally {
                setLoading(false);
            }
        };
        fetchClassrooms();
    }, []);

    return { classrooms, loading, error };
}
