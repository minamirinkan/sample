// src/components/SuperAdminTeachers.tsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminData } from "../../contexts/providers/AdminDataProvider";
import TeacherSearchForm from "./components/TeacherSearchForm";
import Breadcrumb from "../Students/components/Breadcrumb";
import TeacherTable from "./components/TeacherTable";
import { filterTeachers } from "./utils/filterTeachers";
import type { Teacher } from "@/schemas";

// Propsの型を定義
interface SuperAdminTeachersProps {
  onAddNewTeacher?: () => void;
}

const SuperAdminTeachers: React.FC<SuperAdminTeachersProps> = ({ onAddNewTeacher }) => {
  const navigate = useNavigate();
  const adminData = useAdminData();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);

  const teachers = adminData?.teachers;
  const teacherList: Teacher[] = useMemo(
    () =>
      Array.isArray(teachers)
        ? teachers
        : Array.isArray(teachers?.teachers)
          ? teachers.teachers
          : [],
    [teachers]
  );

  useEffect(() => {
    setFilteredTeachers(filterTeachers(teacherList, searchTerm));
  }, [searchTerm, teacherList]);

  const breadcrumbItems = ["講師マスタ", "一覧"];

  const handleShowDetail = (teacher: Teacher) => {
    navigate(`/admin/teachers/${teacher.code}`);
  };

  const handleAddNewTeacher = () => {
    navigate("/admin/teachers/new");
  };

  const handleSearch = (term: string) => setSearchTerm(term);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          講師マスタ <span className="text-lg font-normal ml-1">一覧</span>
        </h1>
        <Breadcrumb items={breadcrumbItems} />
        <button onClick={onAddNewTeacher ? onAddNewTeacher : handleAddNewTeacher} className="btn-primary">
          新規登録
        </button>
      </div>

      <TeacherSearchForm onSearch={handleSearch} />
      <TeacherTable teachers={filteredTeachers} onShowDetail={handleShowDetail} />
    </div>
  );
};

export default SuperAdminTeachers;
