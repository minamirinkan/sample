// hooks/useSchoolClosures.ts

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { SchoolClosuresDocument, SchoolClosure } from '../types/schoolClosures';

export const useSchoolClosures = (year: string, classroomCode?: string) => {
    const [closures, setClosures] = useState<SchoolClosure[]>([]);
    const [deletedClosures, setDeletedClosures] = useState<SchoolClosure[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchClosures = async () => {
            setLoading(true);
            const docRef = doc(db, 'schoolClosures', year);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data() as SchoolClosuresDocument;
                setClosures(data.closures || []);
                setDeletedClosures(data.deletedClosures || []);
            } else {
                setClosures([]);
                setDeletedClosures([]);
            }
            setLoading(false);
        };

        fetchClosures();
    }, [year, classroomCode]);

    const saveClosures = async (newClosures: SchoolClosure[], newDeletedClosures: SchoolClosure[]) => {
        const docRef = doc(db, 'schoolClosures', year);
        await setDoc(docRef, {
            closures: newClosures,
            deletedClosures: newDeletedClosures,
            updatedAt: serverTimestamp(),
        });
        setClosures(newClosures);
        setDeletedClosures(newDeletedClosures);
    };

    const addClosure = async (closure: SchoolClosure) => {
        const updated = [...closures, closure];
        await updateDoc(doc(db, 'schoolClosures', year), {
            closures: updated,
            updatedAt: serverTimestamp(),
        });
        setClosures(updated);
    };

    const removeClosure = async (date: string) => {
        const target = closures.find((c) => c.date === date);
        if (!target) return;
        const updatedClosures = closures.filter((c) => c.date !== date);
        const updatedDeleted = [...deletedClosures, target];
        await updateDoc(doc(db, 'schoolClosures', year), {
            closures: updatedClosures,
            deletedClosures: updatedDeleted,
            updatedAt: serverTimestamp(),
        });
        setClosures(updatedClosures);
        setDeletedClosures(updatedDeleted);
    };

    return {
        closures,
        deletedClosures,
        loading,
        saveClosures,
        addClosure,
        removeClosure,
    };
};
