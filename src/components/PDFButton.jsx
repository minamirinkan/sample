// src/components/PDFButton.jsx
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
import periods from '../constants/periods';
import NotoSansJp from '../assets/fonts/NotoSansJP-Regular.ttf';

// フォント登録
Font.register({
  family: 'NotoSansJP',
  src: NotoSansJp,
});

// スタイル定義
const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansJP',
    padding: 20,
    fontSize: 10,
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #000',
    paddingVertical: 4,
  },
  tableHeader: {
    width: '11%',
    fontWeight: 'bold',
    textAlign: 'center',
    borderRight: '1 solid #ccc',
  },
  tableCell: {
    width: '11%',
    textAlign: 'center',
    paddingHorizontal: 2,
    borderRight: '1 solid #ccc',
  },
  teacherName: {
    width: '11%',
    fontWeight: 'bold',
    textAlign: 'center',
    borderRight: '1 solid #ccc',
  },
  cellText: {
    fontSize: 9,
  },
});

// 空のドキュメント（データがない時用）
const EmptyDocument = () => (
  <Document>
    <Page style={{ padding: 20 }}>
      <Text>データがありません</Text>
    </Page>
  </Document>
);

// 実データ用のPDFドキュメント
const TimetablePDF = ({ rows }) => (
  <Document>
    <Page size="B4" orientation="landscape" style={styles.page}>
      <Text style={styles.title}>時間割（南林間教室）</Text>

      {/* ヘッダー */}
      <View style={styles.tableRow}>
        <Text style={styles.tableHeader}>講師</Text>
        {periods.map((p, idx) => (
          <Text key={idx} style={styles.tableHeader}>{p.label}</Text>
        ))}
      </View>

      {/* データ行 */}
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.tableRow}>
          <Text style={styles.teacherName}>{row.teacher ?? '（未入力）'}</Text>
          {Array.isArray(row.periods) &&
            row.periods.map((students, idx) => {
              const safeStudents = Array.isArray(students) ? students : [];

              return (
                <View key={idx} style={styles.tableCell}>
                  {safeStudents.length > 0 ? (
                    <Text style={styles.cellText}>
                      {safeStudents
                        .filter(s => typeof s === 'object' && s !== null)
                        .map(s => `${s.grade ?? '―'}, ${s.name ?? '―'}, ${s.subject ?? '―'}`)
                        .join('\n')}
                    </Text>
                  ) : (
                    <Text style={styles.cellText}>（なし）</Text>
                  )}
                </View>
              );
            })}
        </View>
      ))}
    </Page>
  </Document>
);

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
