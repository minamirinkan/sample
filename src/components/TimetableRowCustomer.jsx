// src/components/TimetableRowCustomer.jsx

export default function TimetableRowCustomer({ row, allTeachers }) {
    return (
      <tr>
        <td className="border p-2">
          {row.teacher || '-'}
        </td>
        {row.periods.map((period, idx) => (
          <td key={idx} className="border p-2 text-center">
            {period.length > 0
              ? period.map((student, sIdx) => (
                  <div key={sIdx}>{student.name}</div>
                ))
              : '-'}
          </td>
        ))}
      </tr>
    );
  }
  