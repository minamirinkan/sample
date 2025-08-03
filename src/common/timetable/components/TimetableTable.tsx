//components/TimetableTable.jsx
import TimetableRow from './TimetableRow';
import StudentList from './StudentList';
import periods from '../../periods';
import useTeachers from '../../../contexts/hooks/useTeachers';
import { useAuth } from '../../../contexts/AuthContext';
import { useAdminData } from '../../../contexts/providers/AdminDataProvider';
import { RowData } from '@contexts/types/timetable';

type Props = {
  rows: RowData[];
  onChange: (rowIdx: number, newRow: RowData) => void;
  periodLabels: string[];
};

const TimetableTable: React.FC<Props> = ({ rows, onChange, periodLabels}) => {
  const { classroomCode } = useAdminData();
  const { teachers } = useTeachers(classroomCode); // ← フックから取得

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
export default TimetableTable;