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
import { Student, RowStudent } from '../../../../contexts/types/student';
import NotoSansJp from '../../fonts/NotoSansJP-Regular.ttf';
import { DocumentProps } from '@react-pdf/renderer';
interface PDFButtonProps {
  getData: () => { rows: RowData[]; classroomName: string };
}

// フォント登録
Font.register({
  family: 'NotoSansJP',
  src: NotoSansJp,
});

// 動的スタイル生成関数
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
      fontFamily: 'NotoSansJP',
      padding: 20,
      fontSize: baseFontSize,
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    contentWrapper: {
      alignItems: 'center',
      fontFamily: 'NotoSansJP',
    },
    title: {
      fontSize: titleFontSize,
      marginBottom: 10,
      textAlign: 'center',
      fontFamily: 'NotoSansJP',
    },
    tableContainer: {
      alignItems: 'center',
      fontFamily: 'NotoSansJP',
      borderLeftWidth: 2,
      borderRightWidth: 2,
      borderBottomWidth: 2,
      borderTopWidth: 0,
      borderColor: '#000',
      padding: 0,
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
      borderBottomWidth: 2,
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
      fontFamily: 'NotoSansJP',
    },
    headerInfoSection: {
      backgroundColor: '#e0e0e0',
      padding: 2,
      fontSize: isSmallFont ? 3.5 : 7,
      lineHeight: 1.2,
      fontFamily: 'NotoSansJP',
    },
    tableCell: {
      width: columnWidth,
      textAlign: 'center',
      paddingHorizontal: 2,
      borderRightWidth: 2,
      borderRightColor: '#555',
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
      fontFamily: 'NotoSansJP',
    },
    emptyCell: {
      backgroundColor: 'transparent',
      fontFamily: 'NotoSansJP',
    },
    studentBox: {
      paddingVertical: isSmallFont ? 1.5 : 3,
      width: '100%',
      marginRight: 0,
      fontFamily: 'NotoSansJP',
    },
    studentInfoGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      width: '100%',
      minHeight: isSmallFont ? 9 : 18,
      fontFamily: 'NotoSansJP',
    },
    studentInfoSection: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRight: '1 solid #000',
      paddingHorizontal: isSmallFont ? 1 : 2,
      paddingVertical: isSmallFont ? 1 : 2,
      fontFamily: 'NotoSansJP',
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
      fontFamily: 'NotoSansJP',
    },
    seatSection: {
      flex: 0.4,
      fontFamily: 'NotoSansJP',
    },
    gradeSection: {
      flex: 0.8,
      fontFamily: 'NotoSansJP',
    },
    nameSection: {
      flex: 1.7,
      fontFamily: 'NotoSansJP',
    },
    subjectSection: {
      flex: 1,
      fontFamily: 'NotoSansJP',
    },
    teacherSection: {
      flex: 1.3,
      fontFamily: 'NotoSansJP',
    },
    sectionLabel: {
      fontSize: sectionLabelSize,
      color: '#666',
      marginBottom: 1,
      fontWeight: 'bold',
      paddingBottom: 1,
      width: '100%',
      textAlign: 'center',
      fontFamily: 'NotoSansJP',
    },
    sectionValue: {
      fontSize: sectionValueSize,
      fontWeight: 'bold',
      textAlign: 'center',
      fontFamily: 'NotoSansJP',
    },
    nameValue: {
      fontSize: nameValueSize,
      fontWeight: 'bold',
      textAlign: 'center',
      fontFamily: 'NotoSansJP',
    },
    teacherValue: {
      fontSize: teacherValueSize,
      fontWeight: 'bold',
      textAlign: 'center',
      fontFamily: 'NotoSansJP',
    },
    sectionDivider: {
      height: 0.5,
      backgroundColor: '#ccc',
      marginVertical: 1,
    },
    headerText: {
      fontSize: isSmallFont ? 5 : 10,
      fontWeight: 'bold',
      fontFamily: 'NotoSansJP',
    },
    headerSubText: {
      fontSize: isSmallFont ? 2.5 : 5,
      fontWeight: 'bold',
      fontFamily: 'NotoSansJP',
    },
    dateText: {
      fontSize: isSmallFont ? 12.5 : 25,
      fontFamily: 'NotoSansJP',
    },
    studentContainer: {
      width: '100%',
      flexDirection: 'column',
      flexWrap: 'nowrap',
      justifyContent: isSmallFont ? 'flex-start' : 'center',
      alignItems: isSmallFont ? 'flex-start' : 'center',
      fontFamily: 'NotoSansJP',
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
  // データ検証を追加
  if (!Array.isArray(rows)) {
    console.error('rows is not an array:', rows);
    return <EmptyDocument />;
  }

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
          </View>
        </Page>
      </Document>
    );
  }

  const visiblePeriods = periods.slice(startIdx, endIdx + 1);
  const totalColumns = visiblePeriods.length;
  const dynamicTableWidth = totalColumns * columnWidth;

  interface ProcessedData {
    firstHalf: RowData[];
    secondHalf: RowData[];
  }

  const processedData: ProcessedData = {
    firstHalf: [],
    secondHalf: []
  };

  if (isWrapMode) {
    const middleIndex = Math.ceil(visibleRows.length / 2);

    processedData.firstHalf = visibleRows.slice(0, middleIndex).map(row => ({
      ...row,
      periods: row.periods.slice(startIdx, endIdx + 1)
    }));

    processedData.secondHalf = visibleRows.slice(middleIndex).map(row => ({
      ...row,
      periods: row.periods.slice(startIdx, endIdx + 1)
    }));

    const maxRows = Math.max(processedData.firstHalf.length, processedData.secondHalf.length);
    while (processedData.firstHalf.length < maxRows) {
      processedData.firstHalf.push({
        teacher: null,
        status: '',
        periods: Array(visiblePeriods.length).fill(null).map(() => [])
      });
    }
    while (processedData.secondHalf.length < maxRows) {
      processedData.secondHalf.push({
        teacher: null,
        status: '',
        periods: Array(visiblePeriods.length).fill(null).map(() => [])
      });
    }
  } else {
    processedData.firstHalf = visibleRows.map(row => ({
      ...row,
      periods: row.periods.slice(startIdx, endIdx + 1)
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

  // Student型またはRowStudent型の生徒データを安全に処理する関数
  const getStudentDisplayName = (student: Student | RowStudent | any): string => {
    try {
      if (!student) return '名前不明';

      // TimetableStudent型のnameプロパティを最優先で確認
      if (student.name && typeof student.name === 'string' && student.name.trim()) {
        return student.name.trim();
      }

      // Student/RowStudent型のfirstName, lastNameを確認
      const firstName = student.firstName || '';
      const lastName = student.lastName || '';

      if (firstName || lastName) {
        const fullName = `${lastName} ${firstName}`.trim();
        if (fullName) return fullName;
      }

      // fullname のフォールバック
      if (student.fullname && typeof student.fullname === 'string' && student.fullname.trim()) {
        return student.fullname.trim();
      }

      return '名前不明';
    } catch (error) {
      console.error('Student name processing error:', error, student);
      return '名前エラー';
    }
  };

  // 講師名を安全に取得する関数を追加
  const getTeacherDisplayName = (row: RowData): string => {
    try {
      if (!row.teacher) return '―';
      
      // fullnameがあればそれを使用
      if (row.teacher.fullname && typeof row.teacher.fullname === 'string' && row.teacher.fullname.trim()) {
        return row.teacher.fullname.trim();
      }
      
      // lastNameがあればそれを使用（データベースからの場合）
      if ((row.teacher as any).lastName && typeof (row.teacher as any).lastName === 'string' && (row.teacher as any).lastName.trim()) {
        return (row.teacher as any).lastName.trim();
      }
      
      // nameプロパティがあればそれを使用
      if ((row.teacher as any).name && typeof (row.teacher as any).name === 'string' && (row.teacher as any).name.trim()) {
        return (row.teacher as any).name.trim();
      }
      
      return '講師名不明';
    } catch (error) {
      console.error('Teacher name processing error:', error, row.teacher);
      return '講師名エラー';
    }
  };

  const renderStudentData = (studentsData: (Student | RowStudent)[], row: RowData) => {
    // 安全な処理を追加
    if (!Array.isArray(studentsData)) {
      console.warn('studentsData is not an array:', studentsData);
      return null;
    }

    const validStudents = studentsData.filter(s => 
      typeof s === 'object' && 
      s !== null && 
      (s.studentId || s.fullname || s.firstName || s.lastName)
    );

    return validStudents.map((s, i, arr) => (
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
              {getStudentDisplayName(s)}
            </Text>
          </View>

          <View style={[styles.studentInfoSection, styles.subjectSection]}>
            <Text style={styles.sectionValue}>{String(s.subject ?? '―')}</Text>
          </View>

          <View style={[styles.studentInfoSection_for_teacher, styles.teacherSection]}>
            <Text style={styles.teacherValue}>{getTeacherDisplayName(row)}</Text>
          </View>
        </View>
        <View style={styles.longBottomLine} />
      </View>
    ));
  };

  const renderTableRows = (rowsData: RowData[]) => (
    rowsData.map((row, rowIdx) => (
      <View key={rowIdx} style={styles.tableRow}>
        {row.periods.map((students, idx) => (
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

const PDFButton = React.forwardRef<
  { updatePDFData: () => void; resetPDFData: () => void },
  PDFButtonProps
>(({ getData }, ref) => {
  const [pdfDoc, setPdfDoc] = React.useState<React.ReactElement<DocumentProps> | null>(null);

  const updatePDFData = React.useCallback(() => {
    const { rows, classroomName } = getData();
    if (!rows || rows.length === 0) {
      setPdfDoc(<EmptyDocument />);
    } else {
      setPdfDoc(<TimetablePDF rows={rows} classroomName={classroomName} />);
    }
  }, [getData]);

  const resetPDFData = React.useCallback(() => {
    setPdfDoc(null);
  }, []);

  // refを通じて親コンポーネントから関数を呼び出せるようにする
  React.useImperativeHandle(ref, () => ({
    updatePDFData,
    resetPDFData
  }), [updatePDFData, resetPDFData]);

  const handleClick = () => {
    updatePDFData();
  };

  return (
    <div className="text-center mt-4">
      {pdfDoc ? (
        <PDFDownloadLink document={pdfDoc} fileName="timetable.pdf">
          {({ loading, error }) => {
            if (error) {
              console.error('PDF生成エラー:', error);
              return (
                <button
                  className="px-4 py-2 rounded text-white bg-red-500 cursor-not-allowed"
                  disabled
                >
                  PDF生成エラー
                </button>
              );
            }
            return (
              <button
                className={`px-4 py-2 rounded text-white ${
                  loading ? 'bg-gray-400 cursor-not-allowed opacity-50' : 'bg-green-500 hover:bg-green-600'
                }`}
                disabled={loading}
              >
                {loading ? '生成中...' : 'PDFをダウンロード'}
              </button>
            );
          }}
        </PDFDownloadLink>
      ) : (
        <button
          className="px-4 py-2 rounded text-white bg-blue-500 hover:bg-blue-600"
          onClick={handleClick}
        >
          PDFを作成
        </button>
      )}
    </div>
  );
});

PDFButton.displayName = 'PDFButton';

export default PDFButton;