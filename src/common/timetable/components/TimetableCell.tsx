import { useState, useEffect, useRef } from 'react';
import StudentChip from './StudentChip';
import { TimetableCellProps, RowData } from '../../../contexts/types/timetablerow';
import { RowStudent } from '../../../contexts/types/student';
import { SchoolDataItem } from '../../../contexts/types/schoolData';

export default function TimetableCell({
  periodIdx,
  students,
  rowIndex,
  row,
  allRows,
  onChange,
}: TimetableCellProps) {
  const [menuIndex, setMenuIndex] = useState<number | null>(null);

  const isFixedRow = ['振替', '欠席'].includes(row.status);
  const isUndecidedRow = row.status === '未定';

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuIndex(null); // 外をクリックしたら閉じる
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleChange = (
    periodIdx: number,
    studentIdx: number,
    field: string,
    value: string | number | boolean
  ) => {
    const newRow = JSON.parse(JSON.stringify(row));
    newRow.periods[periodIdx][studentIdx][field] = value;
    onChange(rowIndex, newRow);
  };

  const handleRemoveClick = (studentIdx: number) => {
    setMenuIndex(studentIdx);
  };

  const handleAction = (studentIdx: number, action: string) => {
    const student = row.periods[periodIdx][studentIdx];
    const timetableStudent = student as RowStudent;
    const newAllRows = JSON.parse(JSON.stringify(allRows));
    // 元の行から削除
    newAllRows[rowIndex].periods[periodIdx] = newAllRows[rowIndex].periods[periodIdx].filter(
      (_: RowStudent, idx: number) => idx !== studentIdx
    );

    if (['振替', '欠席', '未定'].includes(action)) {
      const targetRow = newAllRows.find((r: RowData) => r.status === action);
      if (targetRow) {
        if (!Array.isArray(targetRow.periods[periodIdx])) {
          targetRow.periods[periodIdx] = [];
        }
        targetRow.periods[periodIdx].push({
          ...timetableStudent,
          originRow: rowIndex,
          originPeriod: periodIdx,
        });
      } else {
        alert(`${action} 行が見つかりません`);
      }
    } else if (action === '元に戻す') {
      if (timetableStudent.originRow !== undefined && timetableStudent.originPeriod !== undefined) {
        const originRow = newAllRows[timetableStudent.originRow];
        if (originRow) {
          if (!Array.isArray(originRow.periods[timetableStudent.originPeriod])) {
            originRow.periods[timetableStudent.originPeriod] = [];
          }
          originRow.periods[timetableStudent.originPeriod].push({
            ...timetableStudent,
            originRow: undefined,
            originPeriod: undefined,
          });
        }
      }
    }

    window.dispatchEvent(new CustomEvent('updateAllRows', { detail: newAllRows }));
    setMenuIndex(null);
  };

  return (
    <td
      className="text-[10px] p-0.5 mb-0.5 border rounded bg-white shadow-sm relative"
      onDragOver={(e) => {
        if (!isFixedRow || isUndecidedRow) e.preventDefault();
      }}
      onDrop={(e) => {
        if (isFixedRow && !isUndecidedRow) return;

        const json = e.dataTransfer.getData('application/json');
        if (!json) return;

        try {
          const { student, fromRow, fromPeriod } = JSON.parse(json);
          const newAllRows = JSON.parse(JSON.stringify(allRows));
          const currentStudents = newAllRows[rowIndex].periods[periodIdx];

          // ✅ 元から削除
          if (
            fromRow !== null &&
            fromRow !== undefined &&
            fromPeriod !== null &&
            fromPeriod !== undefined
          ) {
            newAllRows[fromRow].periods[fromPeriod] =
              newAllRows[fromRow].periods[fromPeriod].filter(
                (s: RowStudent) => s.studentId !== student.studentId
              );
          }

          // ✅ 他の講師の同じ時限にいるかチェック
          const existsInOtherRows = newAllRows.some((r: RowData, i: number) => {
            if (i === rowIndex) return false;

            return r.periods[periodIdx].some(
              (s): s is RowStudent => 'originRow' in s && s.originRow !== undefined
            );
          });
          if (existsInOtherRows) {
            alert('他の講師の同じ時限にすでにいます');
            return;
          }

          // ✅ classType に応じた制限チェック
          const droppedType = student.classType || '';
          const currentTypes = currentStudents.map((sd: SchoolDataItem) => sd.classType || '');
          const allTypes = [...currentTypes, droppedType];
          const uniqueTypes = Array.from(new Set(allTypes));
          const totalCount = currentStudents.length + 1;

          const isOnly = (type: string) => uniqueTypes.length === 1 && uniqueTypes[0] === type;

          const isValidDrop =
            // 1名クラス → 単独 & 1名まで
            (droppedType === '1名クラス' && currentStudents.length === 0 && isOnly('1名クラス')) ||

            // 2名クラス or 演習クラス → 合計2名まで、混在OK（ただしこの2種のみ）
            ((droppedType === '2名クラス' || droppedType === '演習クラス') &&
              uniqueTypes.every(t => t === '2名クラス' || t === '演習クラス') &&
              totalCount <= 2) ||

            // 演習クラスだけ → 最大6名までOK
            (droppedType === '演習クラス' &&
              isOnly('演習クラス') &&
              totalCount <= 6);

          if (!isValidDrop) {
            alert('このクラス構成では定員オーバーか、混在できません');
            return;
          }


          // ✅ ドロップ先に追加
          newAllRows[rowIndex].periods[periodIdx].push(student);
          window.dispatchEvent(new CustomEvent('updateAllRows', { detail: newAllRows }));
        } catch (err) {
          console.error('Drop error:', err);
        }
      }}


    >
      <div className="flex flex-wrap gap-1">
        {students.map((student, studentIdx) => (
          <div key={studentIdx} className="relative inline-flex">
            <StudentChip
              student={student}
              periodIdx={periodIdx}
              rowIndex={rowIndex}
              studentIdx={studentIdx}
              handleChange={handleChange}
              handleRemove={() => handleRemoveClick(studentIdx)}
            />

            {menuIndex === studentIdx && (
              <div
                ref={menuRef}
                className="absolute top-6 right-0 bg-white border rounded shadow text-xs z-20"
              >
                {isFixedRow ? (
                  <button
                    className="block px-2 py-1 hover:bg-gray-100 w-full text-left"
                    onClick={() => handleAction(studentIdx, '元に戻す')}
                  >
                    元に戻す
                  </button>
                ) : (
                  <>
                    <button
                      className="block px-2 py-1 hover:bg-gray-100 w-full text-left"
                      onClick={() => handleAction(studentIdx, '未定')}
                    >
                      未定
                    </button>
                    <button
                      className="block px-2 py-1 hover:bg-gray-100 w-full text-left"
                      onClick={() => handleAction(studentIdx, '振替')}
                    >
                      振替
                    </button>
                    <button
                      className="block px-2 py-1 hover:bg-gray-100 w-full text-left"
                      onClick={() => handleAction(studentIdx, '欠席')}
                    >
                      欠席
                    </button>
                    <button
                      className="block px-2 py-1 hover:bg-gray-100 w-full text-left text-red-600"
                      onClick={() => handleAction(studentIdx, '削除')}
                    >
                      削除
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </td>
  );
}