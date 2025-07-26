import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { SchoolClosuresDocument, SchoolClosure } from '../types/schoolClosures';

export const useSchoolClosures = (year: string, classroomCode?: string) => {
    const [closures, setClosures] = useState<SchoolClosure[]>([]);
    const [deletedClosures, setDeletedClosures] = useState<SchoolClosure[]>([]);
    const [updatedAt, setUpdatedAt] = useState<Timestamp | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        const fetchClosures = async () => {
            setLoading(true);
            try {
                const docRef = doc(db, 'schoolClosures', year);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as SchoolClosuresDocument;
                    setClosures(data.closures || []);
                    setDeletedClosures(data.deletedClosures || []);
                    if (data.updatedAt instanceof Timestamp) {
                        setUpdatedAt(data.updatedAt);
                    }
                } else {
                    setClosures([]);
                    setDeletedClosures([]);
                    setUpdatedAt(null);
                }
            } catch (err) {
                console.error('Failed to fetch school closures:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchClosures();
    }, [year]);

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
        updatedAt,
        loading,
        error,
        saveClosures,
        addClosure,
        removeClosure,
    };
};
