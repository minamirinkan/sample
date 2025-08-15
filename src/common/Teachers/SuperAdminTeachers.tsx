// Reactのコア機能と、パフォーマンス最適化のためのフックをインポート
import React, { useState, useEffect, useMemo } from "react";

// 関連コンポーネントをインポート
import TeacherSearchForm from "./components/TeacherSearchForm";
import Breadcrumb from "../Students/components/Breadcrumb";
import TeacherTable from "./components/TeacherTable";
import { filterTeachers } from "./utils/filterTeachers";
import TeacherDetail from "./Detail/TeacherDetail";
// TeacherRow.tsx から型をインポートする
import type { Teacher as TeacherRowType } from "./components/TeacherRow";


// グローバルなState管理フックからデータを取得
import { useAdminData } from "../../contexts/providers/AdminDataProvider";




// このコンポーネントが受け取るProps（プロパティ）の型を定義
interface SuperAdminTeachersProps {
  onAddNewTeacher: () => void;
}

// --- コンポーネント本体 ---
// React.FC (Functional Component) を使い、Propsの型を適用します
const SuperAdminTeachers: React.FC<SuperAdminTeachersProps> = ({
  onAddNewTeacher,
}) => {
  // --- State定義 ---
  // 各Stateにジェネリクス(<>)で型を明示的に指定します
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredTeachers, setFilteredTeachers] = useState<TeacherRowType[]>([]);
  const [view, setView] = useState<"list" | "detail" | "form">("list");
  const [selectedTeacherDetail, setSelectedTeacherDetail] = useState<TeacherRowType | null>(null);

  // --- パフォーマンス最適化 ---
  // useMemoを使い、依存配列 `[teachers]` の値が変わらない限り再計算を防ぎます。
  // これにより、コンポーネントが再レンダリングされるたびに `teacherList` が
  // 新しい配列として再生成されるのを防ぎ、useEffectの不要な実行を抑制します。
  const { teachers } = useAdminData();
  const teacherList: TeacherRowType[] = useMemo(
  () => Array.isArray(teachers) ? teachers : (Array.isArray(teachers?.teachers) ? teachers.teachers : []),
  [teachers]
);



  const breadcrumbItems = ["講師マスタ", "一覧"];

  // --- 副作用フック ---
  // 検索キーワード(searchTerm)か、元の講師リスト(teacherList)が変更された時だけフィルタリングを実行
  useEffect(() => {
    setFilteredTeachers(filterTeachers(teacherList, searchTerm));
  }, [searchTerm, teacherList]);

  // --- イベントハンドラ ---
  // 関数の引数にも型を適用し、意図しないデータが渡されるのを防ぎます
  // handleShowDetail の型も統一
  const handleShowDetail = (teacher: TeacherRowType) => {
    setSelectedTeacherDetail(teacher);
    setView("detail");
  };

  const handleBackToList = () => {
    setSelectedTeacherDetail(null);
    setView("list");
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // --- レンダリング ---
  return (
    <>
      {view === "list" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">
              講師マスタ <span className="text-lg font-normal ml-1">一覧</span>
            </h1>
            <Breadcrumb items={breadcrumbItems} />
            <button onClick={onAddNewTeacher} className="btn-primary">
              新規登録
            </button>
          </div>

          <TeacherSearchForm onSearch={handleSearch} />
          {/* 修正点: 検索結果がテーブルに反映されるよう、元のリスト(teacherList)ではなく、
                        フィルタリング後のリスト(filteredTeachers)を渡します */}
          <TeacherTable
            teachers={filteredTeachers}   // useState で管理している検索結果リスト
            onShowDetail={handleShowDetail} // 詳細表示用関数
          />
        </div>
      )}

      {view === "detail" && selectedTeacherDetail && (
  <TeacherDetail
    teacher={selectedTeacherDetail}
    onBack={handleBackToList}
    onSave={(updatedTeacher) => {
      console.log("保存する講師データ:", updatedTeacher);
      // 実際はここで保存処理を書く
      handleBackToList(); // 保存後に一覧に戻る例
    }}
    onDelete={(teacherId) => {
      console.log("削除する講師ID:", teacherId);
      // 実際はここで削除処理を書く
      handleBackToList(); // 削除後に一覧に戻る例
    }}
  />
)}

    </>
  );
};

export default SuperAdminTeachers;
