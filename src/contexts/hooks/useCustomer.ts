// src/hooks/useTeachers.ts

import { useEffect, useState } from 'react';
import {  onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Customer } from './../types/customer';

export default function useCustomer(customerUid?: string) {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!customerUid) return;

        // リアルタイム取得したい場合は onSnapshot を使用
        const unsub = onSnapshot(doc(db, "teachers", customerUid), (docSnap) => {
            if (docSnap.exists()) {
                setCustomer(docSnap.data() as Customer);
            } else {
                setCustomer(null);
            }
            setLoading(false);
        });

        // クリーンアップ
        return () => unsub();
    }, [customerUid]);

    return { customer, loading };
};