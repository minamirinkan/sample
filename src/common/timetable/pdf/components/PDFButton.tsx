// src/components/PDFButton.tsx
import React from 'react';
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  StyleSheet,
  Font,
  View
} from '@react-pdf/renderer';
// import periods from '../../../periods'; // これをコメントアウトまたは削除
import { Student } from '@/contexts/types/student';
import { RowData, Teacher, Period } from '@/contexts/types/timetablerow';

// ローカルフォントのインポート
import NotoSansJp from '../../fonts/NotoSansJP-Regular.ttf';

// フォント登録（ローカルファイル使用）
Font.register({
  family: 'NotoSansJP',
  src: NotoSansJp,
  fontWeight: 'normal',
});

// 型定義
interface StudentData {
  seat?: string;
  grade?: string;
  name?: string;
  subject?: string;
}

interface TimetablePDFProps {
  rows: RowData[];
  teachers: Teacher[];
  periods: Period[];
}

interface PDFButtonProps {
  rows: RowData[];
  teachers: Teacher[];
  periods: Period[];
}

// createDynamicStyles 関数（フォント指定を統一）
const createDynamicStyles = (isSmallFont: boolean, columnWidth: number, isWrapMode = false) => {
  const baseFontSize = isSmallFont ? 6 : 10;
  
  return StyleSheet.create({
    page: {
      fontFamily: 'NotoSansJP',
      padding: 20,
      fontSize: baseFontSize,
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    cell: {
      fontFamily: 'NotoSansJP',
      fontSize: baseFontSize,
      padding: 2,
      lineHeight: 1.3,
    },
    headerText: {
      fontFamily: 'NotoSansJP',
      fontWeight: 'bold',
      fontSize: baseFontSize + 1,
    },
    headerSubText: {
      fontFamily: 'NotoSansJP',
      fontSize: baseFontSize - 1,
    },
    contentWrapper: {
      alignItems: 'center',
    },
    tableContainer: {
      alignItems: 'center',
    },
    tableRow: {
      flexDirection: 'row',
    },
    tableHeader: {
      border: '1pt solid black',
      backgroundColor: '#f0f0f0',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateText: {
      fontFamily: 'NotoSansJP',
      fontSize: isSmallFont ? 12.5 : 25,
      fontWeight: 'bold',
    },
  });
};

// EmptyDocument コンポーネント
const EmptyDocument: React.FC = () => (
  <Document>
    <Page style={{ fontFamily: 'NotoSansJP', padding: 20 }}>
      <Text style={{ fontFamily: 'NotoSansJP' }}>データがありません</Text>
    </Page>
  </Document>
);

// TimetablePDF コンポーネント
const TimetablePDF: React.FC<TimetablePDFProps> = ({ rows, teachers, periods }) => {
  // デバッグ用ログ
  console.log('PDF Generation Debug:');
  console.log('rows:', rows);
  console.log('periods:', periods);
  console.log('teachers:', teachers);

  const today = new Date();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const dayOfWeek = weekdays[today.getDay()];
  const formattedDate = `${today.getMonth() + 1}月${today.getDate()}日（${dayOfWeek}）`;

  const visibleRows = rows.filter(
    (row) => !['未定', '振替', '欠席'].includes(row.status ?? '')
  );

  console.log('visibleRows after filter:', visibleRows);

  const periodCount = periods.length;
  const hasStudentInPeriod = Array<boolean>(periodCount).fill(false);
  const studentsPerPeriod = Array<number>(periodCount).fill(0);

  visibleRows.forEach((row) => {
    row.periods.forEach((students, idx) => {
      const safeStudents = Array.isArray(students) ? students : [];
      console.log(`Period ${idx}:`, safeStudents); // デバッグログ
      if (safeStudents.length > 0) {
        hasStudentInPeriod[idx] = true;
        studentsPerPeriod[idx] += safeStudents.length;
      }
    });
  });

  console.log('hasStudentInPeriod:', hasStudentInPeriod);
  console.log('studentsPerPeriod:', studentsPerPeriod);

  const maxStudentsInPeriod = Math.max(...studentsPerPeriod);

  const isSmallFont = maxStudentsInPeriod > 20;
  const isWrapMode = maxStudentsInPeriod > 23;

  let columnWidth: number;
  if (maxStudentsInPeriod > 23) columnWidth = 60;
  else if (maxStudentsInPeriod > 20) columnWidth = 90;
  else columnWidth = 120;

  const styles = createDynamicStyles(isSmallFont, columnWidth, isWrapMode);

  let startIdx = 0;
  while (startIdx < periodCount && !hasStudentInPeriod[startIdx]) startIdx++;
  let endIdx = periodCount - 1;
  while (endIdx >= 0 && !hasStudentInPeriod[endIdx]) endIdx--;

  console.log('startIdx:', startIdx, 'endIdx:', endIdx, 'periodCount:', periodCount);

  if (startIdx > endIdx) {
    return (
      <Document>
        <Page style={{ fontFamily: 'NotoSansJP', padding: 20 }}>
          <Text style={{ fontFamily: 'NotoSansJP' }}>表示できる時間帯がありません</Text>
        </Page>
      </Document>
    );
  }

  const visiblePeriods = periods.slice(startIdx, endIdx + 1);
  const totalColumns = visiblePeriods.length;
  const dynamicTableWidth = totalColumns * columnWidth;

  const processedData = { firstHalf: [] as RowData[], secondHalf: [] as RowData[] };

  if (isWrapMode) {
    const middleIndex = Math.ceil(visibleRows.length / 2);
    processedData.firstHalf = visibleRows.slice(0, middleIndex).map(row => ({
      ...row,
      periods: row.periods.slice(startIdx, endIdx + 1),
    }));
    processedData.secondHalf = visibleRows.slice(middleIndex).map(row => ({
      ...row,
      periods: row.periods.slice(startIdx, endIdx + 1),
    }));

    const maxRows = Math.max(processedData.firstHalf.length, processedData.secondHalf.length);
    while (processedData.firstHalf.length < maxRows)
      processedData.firstHalf.push({ teacher: null, status: '', periods: Array(visiblePeriods.length).fill([]) });
    while (processedData.secondHalf.length < maxRows)
      processedData.secondHalf.push({ teacher: null, status: '', periods: Array(visiblePeriods.length).fill([]) });
  } else {
    processedData.firstHalf = visibleRows.map(row => ({
      ...row,
      periods: row.periods.slice(startIdx, endIdx + 1),
    }));
  }

  // renderHeader 関数
  const renderHeader = (visiblePeriods: Period[], columnWidth: number, styles: any) => (
    <View style={styles.tableRow}>
      {visiblePeriods.map((p, idx) => (
        <View key={idx} style={[styles.tableHeader, { width: columnWidth, padding: 3 }]}>
          <Text style={styles.headerText}>【{p.label}】{p.time}</Text>
          <Text style={styles.headerSubText}>座席 学年 生徒氏名 科目 講師</Text>
        </View>
      ))}
    </View>
  );

  // renderTableRows 関数（フォント指定を明示的に追加）
  const renderTableRows = (
    rows: RowData[],
    visiblePeriods: Period[],
    columnWidth: number,
    styles: any
  ) => {
    return rows.map((row, rowIndex) => (
      <View key={rowIndex} style={{ flexDirection: "row" }}>
        {visiblePeriods.map((_, colIndex) => {
          const students = row.periods[colIndex] ?? [];

          if (!Array.isArray(students) || students.length === 0) {
            return (
              <Text
                key={colIndex}
                style={{ 
                  width: columnWidth, 
                  fontFamily: 'NotoSansJP',
                  ...styles.cell 
                }}
              >
                {/* 空欄 */}
              </Text>
            );
          }

          return (
            <View
              key={colIndex}
              style={{ 
                width: columnWidth, 
                border: '0.5pt solid black',
                ...styles.cell 
              }}
            >
              {students.map((student, sIdx) => {
                const s = student as Student;
                const studentInfo = `${s.seat ?? ""} ${s.grade ?? ""} ${s.fullname ?? ""} ${s.subject ?? ""} ${row.teacher?.name ?? ""}`;
                return (
                  <Text 
                    key={sIdx}
                    style={{ 
                      fontFamily: 'NotoSansJP',
                      fontSize: styles.cell.fontSize,
                    }}
                  >
                    {studentInfo}
                  </Text>
                );
              })}
            </View>
          );
        })}
      </View>
    ));
  };

  return (
    <Document>
      <Page size="B4" orientation="landscape" style={styles.page}>
        <View style={styles.contentWrapper}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', textAlign: 'center', marginBottom: 10 }}>
            <Text style={styles.dateText}>進学個別ATOM南林間教室                       {formattedDate}</Text>
          </View>

          {isWrapMode ? (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
              <View style={[styles.tableContainer, { width: dynamicTableWidth, marginRight: 20 }]}>
                {renderHeader(visiblePeriods, columnWidth, styles)}
                {renderTableRows(processedData.firstHalf, visiblePeriods, columnWidth, styles)}
              </View>
              <View style={[styles.tableContainer, { width: dynamicTableWidth }]}>
                {renderHeader(visiblePeriods, columnWidth, styles)}
                {renderTableRows(processedData.secondHalf, visiblePeriods, columnWidth, styles)}
              </View>
            </View>
          ) : (
            <View style={[styles.tableContainer, { width: dynamicTableWidth }]}>
              {renderHeader(visiblePeriods, columnWidth, styles)}
              {renderTableRows(processedData.firstHalf, visiblePeriods, columnWidth, styles)}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

// PDFButton コンポーネント
const PDFButton: React.FC<PDFButtonProps> = ({ rows, teachers, periods }) => {
  return (
    <PDFDownloadLink
      document={<TimetablePDF rows={rows} teachers={teachers} periods={periods} />}
      fileName="timetable.pdf"
    >
      {({ loading }) => (loading ? '読み込み中...' : 'PDFダウンロード')}
    </PDFDownloadLink>
  );
};

export default PDFButton;