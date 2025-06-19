import { useState } from 'react';
import StudentChip from './StudentChip';

export default function TimetableCell({
  periodIdx,
  students,
  rowIndex,
  row,
  allRows,
  onChange,
}) {
  const [menuIndex, setMenuIndex] = useState(null);

  const isFixedRow = row.teacher === '振り替え' || row.teacher === '欠席';

  const handleChange = (periodIdx, studentIdx, field, value) => {
    const newRow = JSON.parse(JSON.stringify(row));
    newRow.periods[periodIdx][studentIdx][field] = value;
    onChange(rowIndex, newRow);
  };

  const handleRemoveClick = (studentIdx) => {
    setMenuIndex(studentIdx);
  };

  const handleAction = (studentIdx, action) => {
    const student = row.periods[periodIdx][studentIdx];
    const newAllRows = JSON.parse(JSON.stringify(allRows));

    // 1️⃣ 元の行から削除
    newAllRows[rowIndex].periods[periodIdx] = newAllRows[rowIndex].periods[periodIdx].filter(
      (_, idx) => idx !== studentIdx
    );

    if (action === '振り替え' || action === '欠席') {
      // 2️⃣ 振り替え or 欠席行に追加
      const targetRow = newAllRows.find(r => r.teacher === action);
      if (targetRow) {
        targetRow.periods[periodIdx].push({
          ...student,
          originRow: rowIndex,
          originPeriod: periodIdx,
        });
      }
    } else if (action === '元に戻す') {
      // 3️⃣ 元に戻す
      if (student.originRow !== undefined && student.originPeriod !== undefined) {
        const originRow = newAllRows[student.originRow];
        if (originRow) {
          originRow.periods[student.originPeriod].push({
            ...student,
            originRow: undefined,
            originPeriod: undefined,
          });
        }
      }
    }
    // 4️⃣ rows 全体を更新
    window.dispatchEvent(new CustomEvent('updateAllRows', { detail: newAllRows }));

    setMenuIndex(null);
  };

  return (
    <td
      className="text-[10px] p-0.5 mb-0.5 border rounded bg-white shadow-sm relative"
      onDragOver={(e) => {
        if (!isFixedRow) e.preventDefault();
      }}
      onDrop={(e) => {
        if (isFixedRow) return; // 固定行は drop 禁止

        const json = e.dataTransfer.getData('application/json');
        if (!json) return;

        try {
          const { student, fromPeriod } = JSON.parse(json);
          if (fromPeriod === periodIdx) return;

          const existsInOtherRows = allRows.some((r, i) => {
            if (i === rowIndex) return false;
            return r.periods[periodIdx].some((s) => s.code === student.code);
          });
          if (existsInOtherRows) {
            alert('他の講師の同じ時限に既にいます');
            return;
          }

          const newRow = JSON.parse(JSON.stringify(row));
          const alreadyExists = newRow.periods[periodIdx].some(
            (s) => s.code === student.code
          );
          if (alreadyExists) return;

          if (fromPeriod !== null && fromPeriod !== undefined) {
            newRow.periods[fromPeriod] = newRow.periods[fromPeriod].filter(
              (s) => s.code !== student.code
            );
          }

          newRow.periods[periodIdx].push(student);
          onChange(rowIndex, newRow);
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
              studentIdx={studentIdx}
              handleChange={handleChange}
              handleRemove={() => handleRemoveClick(studentIdx)}
            />

            {/* メニュー */}
            {menuIndex === studentIdx && (
              <div className="absolute top-6 right-0 bg-white border rounded shadow text-xs z-20">
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
                      onClick={() => handleAction(studentIdx, '振り替え')}
                    >
                      振り替え
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
