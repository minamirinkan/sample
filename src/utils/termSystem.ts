export function getTermSystemLabel(termSystem: number): string {
    switch (termSystem) {
        case 2:
            return "2期";
        case 3:
            return "3期";
        default:
            return "不明";
    }
}
