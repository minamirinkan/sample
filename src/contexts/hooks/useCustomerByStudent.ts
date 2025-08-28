// src/hooks/useCustomerByStudent.ts
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, getFirestore } from 'firebase/firestore';
import { Customer } from '..//types/customer';

export const useCustomerByStudent = (studentId: string | null) => {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!studentId) {
            setCustomer(null);
            setLoading(false);
            return;
        }

        const fetchCustomer = async () => {
            setLoading(true);
            setError(null);
            try {
                const db = getFirestore();
                const customersRef = collection(db, 'customers');
                const q = query(customersRef, where('studentIds', 'array-contains', studentId));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    setCustomer({ uid: doc.id, ...doc.data() } as Customer);
                } else {
                    setCustomer(null);
                }
            } catch (err) {
                console.error('Failed to fetch customer:', err);
                setError('顧客情報の取得に失敗しました');
                setCustomer(null);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomer();
    }, [studentId]);

    return { customer, loading, error };
};
