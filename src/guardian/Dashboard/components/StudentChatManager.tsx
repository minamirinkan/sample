// src/guardian/Dashboard/components/StudentChatManager.tsx
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../../contexts/AuthContext";
import Chat from "./chat"; // chat.tsxに合わせて小文字

type Student = {
  studentId: string;
  firstName: string;
  lastName: string;
};

const StudentChatManager = () => {
  const { classroomCode } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!classroomCode) return;

      try {
        const q = query(
          collection(db, "students"),
          where("classroomCode", "==", classroomCode)
        );
        const snapshot = await getDocs(q);
        const fetchedStudents = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            studentId: doc.id,
            firstName: data.firstName,
            lastName: data.lastName,
          };
        });
        setStudents(fetchedStudents);
      } catch (error) {
        console.error("生徒の取得に失敗しました:", error);
      }
    };

    fetchStudents();
  }, [classroomCode]);

  return (
    <div className="flex h-[600px] border rounded overflow-hidden">
      {/* 生徒一覧 */}
      <div className="w-1/3 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="font-bold text-lg mb-4">生徒一覧</h2>
        {students.map((student) => (
          <div
            key={student.studentId}
            onClick={() => setSelectedStudentId(student.studentId)}
            className={`cursor-pointer p-2 mb-2 rounded hover:bg-gray-300 ${
              selectedStudentId === student.studentId ? "bg-blue-200" : ""
            }`}
          >
            {student.lastName} {student.firstName}
          </div>
        ))}
      </div>

      {/* チャット表示 */}
      <div className="w-2/3 p-4">
        {selectedStudentId ? (
          <Chat chatType="classroom" roomId={selectedStudentId} studentId={selectedStudentId} />
        ) : (
          <p className="text-gray-500">生徒を選択してください</p>
        )}
      </div>
    </div>
  );
};

export default StudentChatManager;
