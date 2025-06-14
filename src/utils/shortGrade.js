export default function shortGrade(grade) {
    if (!grade) return '';
    return grade
        .replace('小学', '小')
        .replace('中学', '中')
        .replace('高校', '高')
        .replace('年', '')
        .replace('生', '');
}
