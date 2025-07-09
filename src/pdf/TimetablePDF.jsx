import React from 'react';
import { PDFDownloadLink, Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';

// スタイル設定
const styles = StyleSheet.create({
    page: { padding: 20, fontSize: 12 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ccc', padding: 4 },
    tableCell: { flex: 1, borderRightWidth: 1, borderColor: '#ccc', padding: 2 },
    lastCell: { flex: 1, padding: 2 },
});

const TimetablePDF = ({ rows, periods, teachers }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* ヘッダー */}
            <View style={styles.tableRow}>
                <Text style={styles.tableCell}>講師</Text>
                {periods.map((p, i) => (
                    <Text key={i} style={i === periods.length - 1 ? styles.lastCell : styles.tableCell}>
                        {p.label}
                    </Text>
                ))}
            </View>
            {/* 行 */}
            {rows.map((row, idx) => (
                <View style={styles.tableRow} key={idx}>
                    <Text style={styles.tableCell}>
                        {teachers.find(t => t.id === row.teacherId)?.name || '未設定'}
                    </Text>
                    {periods.map((p, i) => (
                        <Text key={i} style={i === periods.length - 1 ? styles.lastCell : styles.tableCell}>
                            {row[p.key] || ''}
                        </Text>
                    ))}
                </View>
            ))}
        </Page>
    </Document>
);

export default function TimetableTable({ rows, teachers, periods }) {
    return (
        <div>
            <PDFDownloadLink
                document={<TimetablePDF rows={rows} teachers={teachers} periods={periods} />}
                fileName="timetable.pdf"
            >
                {({ loading }) => (loading ? '読み込み中...' : 'PDFダウンロード')}
            </PDFDownloadLink>
            {/* ここに画面の時間割表を表示 */}
        </div>
    );
}
