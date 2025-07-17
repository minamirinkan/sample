import fs from 'fs';
import path from 'path';

const outputDir = './project_structure_dump';
const excludeDirs = ['node_modules', 'firestore_dump', 'project_structure_dump', '.git']; // 除外リスト

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

function getDirStructure(dirPath) {
    const result = {};
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
        if (excludeDirs.includes(item)) continue; // 除外対象はスキップ

        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            result[item] = getDirStructure(fullPath);
        } else {
            result[item] = 'file';
        }
    }
    return result;
}

function printRichTree(obj, indent = '', isLast = true) {
    let output = '';
    const keys = Object.keys(obj);
    keys.forEach((key, idx) => {
        const isLastChild = idx === keys.length - 1;
        const pointer = isLastChild ? '└─ ' : '├─ ';
        output += indent + pointer + key + (typeof obj[key] === 'object' ? '/' : '') + '\n';

        if (typeof obj[key] === 'object') {
            const newIndent = indent + (isLastChild ? '   ' : '│  ');
            output += printRichTree(obj[key], newIndent, isLastChild);
        }
    });
    return output;
}

const projectRoot = './'; // カレントディレクトリ
const structure = getDirStructure(projectRoot);

const outputPathJson = path.join(outputDir, 'project-structure.json');
fs.writeFileSync(outputPathJson, JSON.stringify(structure, null, 2));

const treeOutput = printRichTree(structure);
const outputPathTxt = path.join(outputDir, 'project-structure-tree.txt');
fs.writeFileSync(outputPathTxt, treeOutput);

console.log(`✅ プロジェクト構造を書き出しました（JSON → ${outputPathJson}、ツリー → ${outputPathTxt}）`);
