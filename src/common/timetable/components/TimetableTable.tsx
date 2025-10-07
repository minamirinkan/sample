// TimetableTable.tsx
import React from 'react';
import TimetableRow from './TimetableRow';
import periods from '../../periods';
import useTeachers from '../../../contexts/hooks/useTeachers';
import { useAuth } from '../../../contexts/AuthContext';
import { RowData } from '../../../contexts/types/timetablerow';


type Props = {
  rows: RowData[];
  onChange: (rowIdx: number, newRow: RowData) => void;
  periodLabels: string[];
};

const TimetableTable: React.FC<Props> = ({ rows, onChange, periodLabels }) => {
  const { classroomCode } = useAuth();
  const { teachers } = useTeachers(classroomCode ?? undefined);

  return (
    <div className="overflow-auto max-h-[600px]">
      <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
        {/* thead */}
        <thead className="bg-gray-100 sticky top-0 z-20">
          <tr>
            <th
              className="border p-2 w-24 bg-gray-100 sticky left-0 z-30"
            >
              講師
            </th>
            {periods.map((p, i) => (
              <th
                key={i}
                className="border p-2 text-center bg-gray-100"
              >
                {p.label}<br />{p.time}
              </th>
            ))}
          </tr>
        </thead>

        {/* tbody */}
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
  );
};

export default TimetableTable;
