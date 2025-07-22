import { useEffect, useState } from "react";
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "../../firebase";
import { Customer } from "../types/customer";
import { useAuth } from "../AuthContext"; // ← classroomCode を取得するために追加

export const useCustomersByClassroom = () => {
  const { classroomCode, loading: authLoading } = useAuth(); // ← Context から取得
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!classroomCode) {
        setCustomers([]);
        setLoading(false);
        return;
      }

      try {
        const customersRef = collection(db, "customers");
        const snapshot = await getDocs(customersRef);

        const result: Customer[] = [];

        snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();

          const studentIds: string[] = data.studentIds ?? [];

          // studentId から "s024xxxx" → "024" を取り出して一致判定
          const matches = studentIds.some((id) => id.slice(1, 4) === classroomCode);

          if (matches) {
            result.push({
              uid: data.uid,
              email: data.email,
              guardianFirstName: data.guardianFirstName,
              guardianLastName: data.guardianLastName,
              guardianName: data.guardianName,
              isFirstLogin: data.isFirstLogin,
              phoneNumber: data.phoneNumber,
              role: data.role,
              studentIds: studentIds,
              createdAt: data.createdAt,
            });
          }
        });

        setCustomers(result);
        console.log(`📦 Customers for classroomCode "${classroomCode}"`, result);
      } catch (err) {
        console.error("❌ Error fetching customers:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchCustomers();
    }
  }, [classroomCode, authLoading]);

  return { customers, loading };
};
