//src/components/PDFButton.tsx
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
import periods from '../../../periods';

import { RowData } from '../../../../contexts/types/timetablerow';

import NotoSansJp from '../../fonts/NotoSansJP-Regular.ttf';



// 型定義
interface Student {
  seat?: string | number;
  grade?: string | number;
  name?: string;
  subject?: string;
}

interface Row {
  teacher?: { code: string; name: string } | null;
  periods?: (Student[] | null | undefined)[];
  status?: string;
}

interface PDFButtonProps {
  rows: RowData[];
  classroomName: string;
}

// フォント登録 - より詳細な設定
Font.register({
  family: 'NotoSansJP',
  src: NotoSansJp,
  //fontDisplay: 'swap',
});

// 動的スタイル生成関数の改善版
const createDynamicStyles = (isSmallFont: boolean, columnWidth: number, isWrapMode: boolean = false) => {
  const baseFontSize = isSmallFont ? 5 : 10;
  const titleFontSize = isSmallFont ? 8 : 16;
  const cellFontSize = isSmallFont ? 4 : 9;
  const sectionLabelSize = isSmallFont ? 1.5 : 3;
  const sectionValueSize = isSmallFont ? 2.5 : 5;
  const nameValueSize = isSmallFont ? 3 : 6;
  const teacherValueSize = isSmallFont ? 2.5 : 5;

  return StyleSheet.create({
    page: {
      fontFamily: 'NotoSansJP', // フォントファミリーを明示的に指定
      padding: 20,
      fontSize: baseFontSize,
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    contentWrapper: {
      alignItems: 'center',
      fontFamily: 'NotoSansJP', // 追加
    },
    title: {
      fontSize: titleFontSize,
      marginBottom: 10,
      textAlign: 'center',
      fontFamily: 'NotoSansJP', // 追加
    },
    tableContainer: {
  alignItems: 'center',
  fontFamily: 'NotoSansJP',
  borderLeftWidth: 2,
  borderRightWidth: 2,
  borderBottomWidth: 2,
  borderTopWidth: 0,       // ← 上の枠線をなくす
  borderColor: '#000',
  //borderRadius: 4,         // 角を少し丸く（お好みで）
  padding: 0,              // 枠と中身の余白も少し足す
},
    tableRow: {
  flexDirection: 'row',
  marginTop: 0,
  paddingTop: 0,
  fontFamily: 'NotoSansJP',
},
    tableHeader: {
  width: columnWidth,
  fontWeight: 'bold',
  textAlign: 'center',
  borderWidth: 1,
  borderColor: '#ccc',
  borderBottomWidth: 2,     // 下線を太くして強調
  borderRightWidth: 1,
  borderRightColor: '#000',
  backgroundColor: '#e0e0e0',
  fontFamily: 'NotoSansJP',
  marginBottom: 0,
  paddingBottom: 3,
},


    headerTimeSection: {
      backgroundColor: '#e0e0e0',
      padding: 3,
      marginBottom: 2,
      borderRadius: 2,
      fontFamily: 'NotoSansJP', // 追加
    },
    headerInfoSection: {
      backgroundColor: '#e0e0e0',
      padding: 2,
      fontSize: isSmallFont ? 3.5 : 7,
      lineHeight: 1.2,
      fontFamily: 'NotoSansJP', // 追加
    },
    tableCell: {
  width: columnWidth,
  textAlign: 'center',
  paddingHorizontal: 2,
  borderRightWidth: 2,
  borderRightColor: '#555',
  // 横の境界線（上下）はなくす
  borderTopWidth: 0.5,
  borderBottomWidth: 0,
  justifyContent: isSmallFont ? 'flex-start' : 'center',
  alignItems: isSmallFont ? 'flex-start' : 'center',
  fontFamily: 'NotoSansJP',
},

    teacherName: {
  width: '11%',
  fontWeight: 'bold',
  textAlign: 'center',
  borderRightWidth: 1,
  borderRightColor: '#ccc',
  minHeight: 40,
  backgroundColor: '#e0e0e0',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: 'NotoSansJP',
},

    cellText: {
      fontSize: cellFontSize,
      lineHeight: 2.0,
      fontFamily: 'NotoSansJP', // 追加
    },
    emptyCell: {
      backgroundColor: 'transparent',
      fontFamily: 'NotoSansJP', // 追加
    },
    studentBox: {
      paddingVertical: isSmallFont ? 1.5 : 3,
      width: '100%',
      marginRight: 0,
      fontFamily: 'NotoSansJP', // 追加
    },
    studentInfoGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      width: '100%',
      minHeight: isSmallFont ? 9 : 18,
      fontFamily: 'NotoSansJP', // 追加
    },
    studentInfoSection: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRight: '1 solid #000',
      paddingHorizontal: isSmallFont ? 1 : 2,
      paddingVertical: isSmallFont ? 1 : 2,
      fontFamily: 'NotoSansJP', // 追加
    },
    longBottomLine: {
      height: 1,
      backgroundColor: '#000',
      width: '104%',
      marginLeft: '-2%',
      marginTop: 1,
    },
    studentInfoSection_for_teacher: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: isSmallFont ? 1 : 2,
      paddingVertical: isSmallFont ? 1 : 2,
      fontFamily: 'NotoSansJP', // 追加
    },
    seatSection: {
      flex: 0.4,
      fontFamily: 'NotoSansJP', // 追加
    },
    gradeSection: {
      flex: 0.8,
      fontFamily: 'NotoSansJP', // 追加
    },
    nameSection: {
      flex: 1.7,
      fontFamily: 'NotoSansJP', // 追加
    },
    subjectSection: {
      flex: 1,
      fontFamily: 'NotoSansJP', // 追加
    },
    teacherSection: {
      flex: 1.3,
      fontFamily: 'NotoSansJP', // 追加
    },
    sectionLabel: {
      fontSize: sectionLabelSize,
      color: '#666',
      marginBottom: 1,
      fontWeight: 'bold',
      paddingBottom: 1,
      width: '100%',
      textAlign: 'center',
      fontFamily: 'NotoSansJP', // 追加
    },
    sectionValue: {
      fontSize: sectionValueSize,
      fontWeight: 'bold',
      textAlign: 'center',
      fontFamily: 'NotoSansJP', // 追加
    },
    nameValue: {
      fontSize: nameValueSize,
      fontWeight: 'bold',
      textAlign: 'center',
      fontFamily: 'NotoSansJP', // 追加
    },
    teacherValue: {
      fontSize: teacherValueSize,
      fontWeight: 'bold',
      textAlign: 'center',
      fontFamily: 'NotoSansJP', // 追加
    },
    sectionDivider: {
      height: 0.5,
      backgroundColor: '#ccc',
      marginVertical: 1,
    },
    headerText: {
      fontSize: isSmallFont ? 5 : 10,
      fontWeight: 'bold',
      fontFamily: 'NotoSansJP', // 追加
    },
    headerSubText: {
      fontSize: isSmallFont ? 2.5 : 5,
      fontWeight: 'bold',
      fontFamily: 'NotoSansJP', // 追加
    },
    dateText: {
      fontSize: isSmallFont ? 12.5 : 25,
      fontFamily: 'NotoSansJP', // 追加
    },
    studentContainer: {
      width: '100%',
      flexDirection: 'column',
      flexWrap: 'nowrap',
      justifyContent: isSmallFont ? 'flex-start' : 'center',
      alignItems: isSmallFont ? 'flex-start' : 'center',
      fontFamily: 'NotoSansJP', // 追加
    },
  });
};

// 空のドキュメント（データがない時用）
const EmptyDocument: React.FC = () => (
  <Document>
    <Page style={{ padding: 20, fontFamily: 'NotoSansJP' }}>
      <Text style={{ fontFamily: 'NotoSansJP' }}>データがありません</Text>
    </Page>
  </Document>
);

interface TimetablePDFProps {
  rows: RowData[];
  classroomName: string;
}

const TimetablePDF: React.FC<TimetablePDFProps> = ({ rows, classroomName }) => {
  const today = new Date();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const dayOfWeek = weekdays[today.getDay()];
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1);
  const dd = String(today.getDate());
  const formattedDate = `${mm}月${dd}日（${dayOfWeek}）`;

  const visibleRows = rows.filter(
    (row) => !['未定', '振替', '欠席'].includes(row.status || '')
  );

  const periodCount = periods.length;
  const hasStudentInPeriod = Array(periodCount).fill(false);
  const studentsPerPeriod = Array(periodCount).fill(0);

  visibleRows.forEach(row => {
    if (Array.isArray(row.periods)) {
      row.periods.forEach((students, idx) => {
        const safeStudents = Array.isArray(students) ? students : [];
        if (safeStudents.length > 0) {
          hasStudentInPeriod[idx] = true;
          studentsPerPeriod[idx] += safeStudents.length;
        }
      });
    }
  });

  const maxStudentsInPeriod = Math.max(...studentsPerPeriod);
  const isSmallFont = maxStudentsInPeriod > 20;
  const isWrapMode = maxStudentsInPeriod > 23;

  let columnWidth: number;
  if (maxStudentsInPeriod > 23) {
    columnWidth = 60;
  } else if (maxStudentsInPeriod > 20) {
    columnWidth = 90;
  } else {
    columnWidth = 120;
  }

  const styles = createDynamicStyles(isSmallFont, columnWidth, isWrapMode);

  let startIdx = 0;
  while (startIdx < periodCount && !hasStudentInPeriod[startIdx]) {
    startIdx++;
  }

  let endIdx = periodCount - 1;
  while (endIdx >= 0 && !hasStudentInPeriod[endIdx]) {
    endIdx--;
  }

  if (startIdx > endIdx) {
    return (
    <Document>
      <Page size="B4" orientation="landscape" style={styles.page}>
        <View style={styles.contentWrapper}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', textAlign: 'center', marginBottom: 10 }}>
            <Text style={styles.dateText}>
              {classroomName} 教室 {formattedDate}
            </Text>
          </View>
          {/* ... */}
        </View>
      </Page>
    </Document>
  );
  }

  const visiblePeriods = periods.slice(startIdx, endIdx + 1);
  const totalColumns = visiblePeriods.length;
  const dynamicTableWidth = totalColumns * columnWidth;

  const WRAP_THRESHOLD = 23;

  interface ProcessedData {
    firstHalf: Row[];
    secondHalf: Row[];
  }

  const processedData: ProcessedData = {
    firstHalf: [],
    secondHalf: []
  };

  if (isWrapMode) {
    const middleIndex = Math.ceil(visibleRows.length / 2);

    processedData.firstHalf = visibleRows.slice(0, middleIndex).map(row => ({
  ...row,
  teacher: row.teacher
    ? { code: (row.teacher as any).code, name: (row.teacher as any).name }
    : null,
  periods: Array.isArray(row.periods) ? row.periods.slice(startIdx, endIdx + 1) : []
}));

processedData.secondHalf = visibleRows.slice(middleIndex).map(row => ({
  ...row,
  teacher: row.teacher
    ? { code: (row.teacher as any).code, name: (row.teacher as any).name }
    : null,
  periods: Array.isArray(row.periods) ? row.periods.slice(startIdx, endIdx + 1) : []
}));


    const maxRows = Math.max(processedData.firstHalf.length, processedData.secondHalf.length);
    while (processedData.firstHalf.length < maxRows) {
      processedData.firstHalf.push({
        teacher: null,
        periods: Array(visiblePeriods.length).fill([])
      });
    }
    while (processedData.secondHalf.length < maxRows) {
      processedData.secondHalf.push({
        teacher: null,
        periods: Array(visiblePeriods.length).fill([])
      });
    }
  } else {
    processedData.firstHalf = visibleRows.map(row => ({
  ...row,
  teacher: row.teacher 
    ? { code: (row.teacher as any).code, name: (row.teacher as any).name }
    : null,
  periods: Array.isArray(row.periods) ? row.periods.slice(startIdx, endIdx + 1) : []
}));

  }

  const renderHeader = () => (
    <View style={styles.tableRow}>
      {visiblePeriods.map((p, idx) => (
        <View key={idx} style={[styles.tableHeader, { width: columnWidth, padding: 3 }]}>
          <Text style={styles.headerText}>【{p.label}】{p.time}</Text>
          <Text style={styles.headerSubText}>座席　学年　生徒氏名　科目　講師</Text>
        </View>
      ))}
    </View>
  );

  const renderStudentData = (studentsData: Student[], row: Row) => (
    studentsData.filter(s => typeof s === 'object' && s !== null).map((s, i, arr) => (
      <View
        key={i}
        style={[
          styles.studentBox,
          ...(i === arr.length - 1 ? [{ borderBottom: 'none', marginBottom: 0 }] : [])
        ]}
      >
        <View style={styles.longBottomLine} />
        <View style={styles.studentInfoGrid}>
          <View style={[styles.studentInfoSection, styles.seatSection]}>
            <Text style={styles.sectionValue}>{String(s.seat ?? '―')}</Text>
          </View>

          <View style={[styles.studentInfoSection, styles.gradeSection]}>
            <Text style={styles.sectionValue}>{String(s.grade ?? '―')}</Text>
          </View>

          <View style={[styles.studentInfoSection, styles.nameSection]}>
            <Text style={styles.nameValue}>
              {String(s.name ?? '―')}
            </Text>
          </View>

          <View style={[styles.studentInfoSection, styles.subjectSection]}>
            <Text style={styles.sectionValue}>{String(s.subject ?? '―')}</Text>
          </View>

          <View style={[styles.studentInfoSection_for_teacher, styles.teacherSection]}>
            <Text style={styles.teacherValue}>{String(row.teacher?.name ?? '―')}</Text>
          </View>
        </View>
        <View style={styles.longBottomLine} />
      </View>
    ))
  );

  const renderTableRows = (rowsData: Row[]) => (
    rowsData.map((row, rowIdx) => (
      <View key={rowIdx} style={styles.tableRow}>
        {row.periods?.map((students, idx) => (
          <View
            key={idx}
            style={[
              styles.tableCell,
              { width: columnWidth },
              ...(!students || students.length === 0 ? [styles.emptyCell] : [])
            ]}
          >
            {students && students.length > 0 ? (
              <View style={styles.studentContainer}>
                {renderStudentData(students, row)}
              </View>
            ) : (
              <Text style={styles.cellText}></Text>
            )}
          </View>
        ))}
      </View>
    ))
  );

  return (
    <Document>
      <Page size="B4" orientation="landscape" style={styles.page}>
        <View style={styles.contentWrapper}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', textAlign: 'center', marginBottom: 10 }}>
            <Text style={styles.dateText}>{classroomName} {formattedDate}</Text>

          </View>

          {isWrapMode ? (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
              <View style={[styles.tableContainer, { width: dynamicTableWidth, marginRight: 20 }]}>
                {renderHeader()}
                {renderTableRows(processedData.firstHalf)}
              </View>

              <View style={[styles.tableContainer, { width: dynamicTableWidth }]}>
                {renderHeader()}
                {renderTableRows(processedData.secondHalf)}
              </View>
            </View>
          ) : (
            <View style={[styles.tableContainer, { width: dynamicTableWidth }]}>
              {renderHeader()}
              {renderTableRows(processedData.firstHalf)}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

const PDFButton: React.FC<PDFButtonProps> = ({ rows, classroomName }) => {
  const isDisabled = !rows || rows.length === 0;
  
  return (
    <div className="text-center mt-4">
      <PDFDownloadLink
        document={rows.length > 0 ? <TimetablePDF rows={rows} classroomName={classroomName} /> : <EmptyDocument />}
        fileName="timetable.pdf"
      >
        {({ loading }) => (
          <button
            className={`px-4 py-2 rounded text-white ${
              isDisabled 
                ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
            disabled={isDisabled}
          >
            {loading ? '生成中...' : 'PDFをダウンロード'}
          </button>
        )}
      </PDFDownloadLink>
    </div>
  );
};


export default PDFButton;

