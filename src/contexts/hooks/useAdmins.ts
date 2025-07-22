import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Admin } from '../types/admin';

export function useAdmins() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        const fetchAdmins = async () => {
            setLoading(true);
            setError(null);
            try {
                const snapshot = await getDocs(collection(db, 'admins'));
                const list = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        uid: data.uid,
                        name: data.name,
                        email: data.email,
                        role: data.role,
                        classroomCode: data.classroomCode,
                        createdAt: data.createdAt,
                        lastLogin: data.lastLogin,
                    } as Admin;
                });
                setAdmins(list);
            } catch (e) {
                setError(e);
            } finally {
                setLoading(false);
            }
        };
        fetchAdmins();
    }, []);

    return { admins, loading, error };
}
