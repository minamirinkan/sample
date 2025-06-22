// src/components/TimetableCustomer.jsx

import { useEffect, useState } from 'react';
import TimetableRowCustomer from './TimetableRowCustomer';
import periods from '../constants/periods';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export default function TimetableCustomer({ rows }) {
  const { adminData } = useAuth();
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      if (!adminData?.classroomCode) return;
      const q = query(
        collection(db, 'teachers'),
        where('classroomCode', '==', adminData.classroomCode),
        where('status', '==', '在職中')
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeachers(list);
    };

    fetchTeachers();
  }, [adminData]);

  return (
    <div className="overflow-x-auto w-full">
      <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
        <thead>
          <tr>
            <th className="border bg-gray-100 p-2 w-24">講師</th>
            {periods.map((p, i) => (
              <th key={i} className="border bg-gray-100 p-2 text-center">
                {p.label}<br />{p.time}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <TimetableRowCustomer
              key={`row-${rowIdx}`}
              row={row}
              allTeachers={teachers}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
