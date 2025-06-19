import { useEffect, useState } from 'react';
import TimetableRow from './TimetableRow';
import StudentList from './StudentList';
import periods from '../constants/periods';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export default function TimetableTable({ rows, onChange }) {
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
    <div className="flex gap-4">
      {/* 左側：生徒一覧 */}
      <StudentList />

      {/* 右側：時間割表 */}
      <div className="overflow-x-auto flex-1">
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
              <TimetableRow
                key={`row-${rowIdx}`}
                rowIndex={rowIdx}
                row={row}
                onChange={onChange}
                allTeachers={teachers}
                allRows={rows}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
