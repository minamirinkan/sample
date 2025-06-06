// src/pdf/TimetablePDF.jsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { padding: 10, fontSize: 10 },
    header: { flexDirection: 'row', borderBottom: 1, paddingBottom: 5 },
    row: { flexDirection: 'row', borderBottom: 1, paddingVertical: 2 },
    cell: { borderRight: 1, padding: 4, flex: 1, textAlign: 'center' },
    teacherCell: { width: 60, padding: 4, borderRight: 1 },
});

export default function TimetablePDF({ rows, periods }) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.teacherCell}>講師</Text>
                    {periods.map((p, i) => (
                        <Text key={i} style={styles.cell}>
                            {p.label}\n{p.time}
                        </Text>
                    ))}
                </View>

                {rows.map((row, rowIdx) => (
                    <View key={rowIdx} style={styles.row}>
                        <Text style={styles.teacherCell}>{row.teacher}</Text>
                        {row.periods.map((period, pIdx) => (
                            <Text key={pIdx} style={styles.cell}>
                                {period
                                    .map(
                                        (s) =>
                                            `${s.seat || ''} ${s.no || ''} ${s.name || ''}\n${s.subject || ''}`
                                    )
                                    .join('\n\n')}
                            </Text>
                        ))}
                    </View>
                ))}
            </Page>
        </Document>
    );
}
