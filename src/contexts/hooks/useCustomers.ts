import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { Customer } from "../types/customer";

export const useCustomers = (uid?: string) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);

      try {
        if (uid) {
          // 顧客自身（1件）
          const docRef = doc(db, "customers", uid);
          const snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
            const data = snapshot.data();
            setCustomers([{ uid: snapshot.id, ...(data as Omit<Customer, "uid">) }]);
          } else {
            setCustomers([]);
          }
        } else {
          // 全件（superadmin, admin）
          const snapshot = await getDocs(collection(db, "customers"));
          const data = snapshot.docs.map(doc => {
            const docData = doc.data();
            return { uid: doc.id, ...(docData as Omit<Customer, "uid">) };
          });
          setCustomers(data);
        }
      } catch (e) {
        console.error("❌ Error fetching customers:", e);
        setError(e as Error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [uid]);

  return { customers, loading, error };
};
