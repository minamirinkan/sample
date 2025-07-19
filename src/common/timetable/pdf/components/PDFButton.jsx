//src/components/PDFButton.jsx
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
import NotoSansJp from '../../fonts/NotoSansJP-Regular.ttf';

// フォント登録
Font.register({
  family: 'NotoSansJP',
  src: NotoSansJp,
});

// 動的スタイル生成関数 (23人以下なら左側、以上なら右側)
const createDynamicStyles = (isSmallFont, columnWidth, isWrapMode = false) => {
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
    },
    title: {
      fontSize: titleFontSize,
      marginBottom: 10,
      textAlign: 'center',
    },
    tableContainer: {
      alignItems: 'center',
    },
    tableRow: {
      flexDirection: 'row',
    },
    tableHeader: {
      width: columnWidth,
      fontWeight: 'bold',
      textAlign: 'center',
      borderWidth: '1 solid #ccc',
      borderRight: '1 solid #ccc',
      backgroundColor: '#e0e0e0',
    },
    headerTimeSection: {
      backgroundColor: '#e0e0e0',
      padding: 3,
      marginBottom: 2,
      borderRadius: 2,
    },
    headerInfoSection: {
      backgroundColor: '#e0e0e0',
      padding: 2,
      fontSize: isSmallFont ? 3.5 : 7,
      lineHeight: 1.2,
    },
    tableCell: {
      width: columnWidth,
      textAlign: 'center',
      paddingHorizontal: 2,
      borderRight: '1 solid #ccc',
      borderWidth: '1 solid #ccc',
      justifyContent: isSmallFont ? 'flex-start' : 'center',
      alignItems: isSmallFont ? 'flex-start' : 'center',
    },
    teacherName: {
      width: '11%',
      fontWeight: 'bold',
      textAlign: 'center',
      borderRight: '1 solid #ccc',
      borderWidth: '1 solid #ccc',
      minHeight: 40,
      backgroundColor: '#e0e0e0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cellText: {
      fontSize: cellFontSize,
      lineHeight: 2.0,
    },
    emptyCell: {
      backgroundColor: '#fff',
    },
    studentBox: {
      paddingVertical: isSmallFont ? 1.5 : 3,
      width: '100%',
      marginRight: 0,
    },
    studentInfoGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      width: '100%',
      minHeight: isSmallFont ? 9 : 18,
    },
    studentInfoSection: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      borderRight: '1 solid #000',
      paddingHorizontal: isSmallFont ? 1 : 2,
      paddingVertical: isSmallFont ? 1 : 2,
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
    },
    seatSection: {//セル内部の座席番号が占める大きさ
      flex: 0.4,
    },
    gradeSection: {//セル内部の学年が占める大きさ
      flex: 0.8,
    },
    nameSection: {//セル内部の生徒の名前が占める大きさ
      flex: 1.7,
    },
    subjectSection: {//セル内部の科目が占める大きさ
      flex: 1,
    },
    teacherSection: {//セル内部の講師の名前が占める大きさ
      flex: 1.3,
    },
    sectionLabel: {
      fontSize: sectionLabelSize,
      color: '#666',
      marginBottom: 1,
      fontWeight: 'bold',
      paddingBottom: 1,
      width: '100%',
      textAlign: 'center',
    },
    sectionValue: {
      fontSize: sectionValueSize,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    nameValue: {
      fontSize: nameValueSize,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    teacherValue: {
      fontSize: teacherValueSize,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    sectionDivider: {
      height: 0.5,
      backgroundColor: '#ccc',
      marginVertical: 1,
    },
    headerText: {
      fontSize: isSmallFont ? 5 : 10,
      fontWeight: 'bold',
    },
    headerSubText: {
      fontSize: isSmallFont ? 2.5 : 5,
      fontWeight: 'bold',
    },
    dateText: {
      fontSize: isSmallFont ? 12.5 : 25,
    },
    studentContainer: {
      width: '100%',
      flexDirection: 'column',
      flexWrap: 'nowrap',
      justifyContent: isSmallFont ? 'flex-start' : 'center',
      alignItems: isSmallFont ? 'flex-start' : 'center',
    },
  });
};

// 空のドキュメント（データがない時用）
const EmptyDocument = () => (
  <Document>
    <Page style={{ padding: 20 }}>
      <Text>データがありません</Text>
    </Page>
  </Document>
);

// 実データ用のPDFドキュメント
const TimetablePDF = ({ rows }) => {
  const today = new Date();
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const dayOfWeek = weekdays[today.getDay()];
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1);
  const dd = String(today.getDate());
  const formattedDate = `${mm}月${dd}日（${dayOfWeek}）`;

  const visibleRows = rows.filter(
    (row) => !['未定', '振替', '欠席'].includes(row.status)
  );

  const periodCount = periods.length;
  const hasStudentInPeriod = Array(periodCount).fill(false);

  // 時限ごとの合計生徒数を計算
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

  // 最大生徒数（時限ごとの合計での最大値）
  const maxStudentsInPeriod = Math.max(...studentsPerPeriod);

  // 20を超える場合は小さいフォントを使用、23を超える場合は折り返し
  const isSmallFont = maxStudentsInPeriod > 20;
  const isWrapMode = maxStudentsInPeriod > 23;

  // 動的な列幅を計算
  let columnWidth;
  if (maxStudentsInPeriod > 23) {
    columnWidth = 60;  // 23を超える場合はさらに狭く
  } else if (maxStudentsInPeriod > 20) {
    columnWidth = 90;  // 20を超える場合は半分程度
  } else {
    columnWidth = 120;  // 通常の幅
  }

  const styles = createDynamicStyles(isSmallFont, columnWidth, isWrapMode);

  // 左端から生徒がいない時間帯をスキップ
  let startIdx = 0;
  while (startIdx < periodCount && !hasStudentInPeriod[startIdx]) {
    startIdx++;
  }

  // 右端から生徒がいない時間帯をスキップ
  let endIdx = periodCount - 1;
  while (endIdx >= 0 && !hasStudentInPeriod[endIdx]) {
    endIdx--;
  }

  // すべて空の場合の対策
  if (startIdx > endIdx) {
    return (
      <Document>
        <Page style={{ padding: 20 }}>
          <Text>表示できる時間帯がありません</Text>
        </Page>
      </Document>
    );
  }

  // 表示する期間だけスライス
  const visiblePeriods = periods.slice(startIdx, endIdx + 1);

  // 動的な表の幅を計算
  const totalColumns = visiblePeriods.length;
  const dynamicTableWidth = totalColumns * columnWidth;

  // 折り返し処理：全体の生徒数が一定値を超えたら折り返し
  const WRAP_THRESHOLD = 23;

  // 全体の生徒を時限ごとに集計して分割
  const processedData = {
    firstHalf: [],
    secondHalf: []
  };

  if (isWrapMode) {
    // 左側から順に講師を配置
    const middleIndex = Math.ceil(visibleRows.length / 2);

    // 前半のデータ（左側）
    processedData.firstHalf = visibleRows.slice(0, middleIndex).map(row => ({
      ...row,
      periods: Array.isArray(row.periods) ? row.periods.slice(startIdx, endIdx + 1) : []
    }));

    // 後半のデータ（右側）
    processedData.secondHalf = visibleRows.slice(middleIndex).map(row => ({
      ...row,
      periods: Array.isArray(row.periods) ? row.periods.slice(startIdx, endIdx + 1) : []
    }));

    // 左右の行数を揃えるために空行を追加
    const maxRows = Math.max(processedData.firstHalf.length, processedData.secondHalf.length);
    while (processedData.firstHalf.length < maxRows) {
      processedData.firstHalf.push({
        teacher: '',
        periods: Array(visiblePeriods.length).fill([])
      });
    }
    while (processedData.secondHalf.length < maxRows) {
      processedData.secondHalf.push({
        teacher: '',
        periods: Array(visiblePeriods.length).fill([])
      });
    }
  } else {
    // 折り返しなしの場合は元のデータをそのまま使用
    processedData.firstHalf = visibleRows.map(row => ({
      ...row,
      periods: Array.isArray(row.periods) ? row.periods.slice(startIdx, endIdx + 1) : []
    }));
  }

  // ヘッダー行のレンダリング関数
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

  // 生徒データのレンダリング関数
  const renderStudentData = (studentsData, row) => (
    studentsData.filter(s => typeof s === 'object' && s !== null).map((s, i, arr) => (
      <View
        key={i}
        style={[
          styles.studentBox,
          i === arr.length - 1 && { borderBottom: 'none', marginBottom: 0 }
        ]}
      >
        <View style={styles.longBottomLine} />
        <View style={styles.studentInfoGrid}>
          {/* 座席セクション */}
          <View style={[styles.studentInfoSection, styles.seatSection]}>
            <Text style={styles.sectionValue}>{s.seat ?? '―'}</Text>
          </View>

          {/* 学年セクション */}
          <View style={[styles.studentInfoSection, styles.gradeSection]}>
            <Text style={styles.sectionValue}>{s.grade ?? '―'}</Text>
          </View>

          {/* 名前セクション */}
          <View style={[styles.studentInfoSection, styles.nameSection]}>
            <Text style={styles.nameValue}>
              {s.name ?? '―'}
            </Text>
          </View>

          {/* 科目セクション */}
          <View style={[styles.studentInfoSection, styles.subjectSection]}>
            <Text style={styles.sectionValue}>{s.subject ?? '―'}</Text>
          </View>

          {/* 講師セクション */}
          <View style={[styles.studentInfoSection_for_teacher, styles.teacherSection]}>
            <Text style={styles.teacherValue}>{row.teacher ?? '―'}</Text>
          </View>
        </View>
        {/* 罫線を別要素で描く */}
        <View style={styles.longBottomLine} />
      </View>
    ))
  );

  // 行のレンダリング関数
  const renderTableRows = (rowsData) => (
    rowsData.map((row, rowIdx) => (
      <View key={rowIdx} style={styles.tableRow}>
        {row.periods.map((students, idx) => (
          <View
            key={idx}
            style={[
              styles.tableCell,
              { width: columnWidth },
              (!students || students.length === 0) && styles.emptyCell
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
            <Text style={styles.dateText}>進学個別ATOM南林間教室                       {formattedDate}</Text>
          </View>

          {/* 折り返しモードの場合は左右分割レイアウト */}
          {isWrapMode ? (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
              {/* 左側：前半のテーブル */}
              <View style={[styles.tableContainer, { width: dynamicTableWidth, marginRight: 20 }]}>
                {renderHeader()}
                {renderTableRows(processedData.firstHalf)}
              </View>

              {/* 右側：後半のテーブル */}
              <View style={[styles.tableContainer, { width: dynamicTableWidth }]}>
                {renderHeader()}
                {renderTableRows(processedData.secondHalf)}
              </View>
            </View>
          ) : (
            /* 通常の単一テーブル表示 */
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

// PDFダウンロードボタン
export default function PDFButton({ rows }) {
  return (
    <div className="text-center mt-4">
      <PDFDownloadLink
        document={rows && rows.length > 0 ? <TimetablePDF rows={rows} /> : <EmptyDocument />}
        fileName="timetable.pdf"
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!rows || rows.length === 0}
      >
        {({ loading }) => (loading ? '生成中...' : 'PDFをダウンロード')}
      </PDFDownloadLink>
    </div>
  );
}
