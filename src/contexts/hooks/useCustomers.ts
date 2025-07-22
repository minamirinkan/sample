import { useEffect, useState } from "react";
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "../../firebase";
import { Customer } from "../types/customer";

export const useCustomersByClassroom = (classroomCode?: string) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customersRef = collection(db, "customers");
        const snapshot = await getDocs(customersRef);

        const result: Customer[] = [];

        snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();

          const studentIds: string[] = data.studentIds ?? [];
          const matches = studentIds.some((id) => id.slice(1, 4) === classroomCode);

          if (!classroomCode || matches) {
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
        console.log("✅ Filtered Customers:", result); // ← デバッグ用ログ
      } catch (err) {
        console.error("Error fetching customers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [classroomCode]);

  return { customers, loading };
};
