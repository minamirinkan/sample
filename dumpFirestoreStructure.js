import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json'));

initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();
const outputDir = './firestore_dump';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// 再帰的にドキュメントの中身とサブコレクションを取得
async function getDocWithSubcollections(docRef) {
    const docSnap = await docRef.get();
    if (!docSnap.exists) return null;

    const data = {};
    data.__doc__ = docSnap.data(); // 中身を __doc__ キーにまとめる

    const subcollections = await docRef.listCollections();
    for (const subCol of subcollections) {
        const subDocs = await subCol.listDocuments();
        data[subCol.id] = {};
        for (const subDoc of subDocs) {
            data[subCol.id][subDoc.id] = await getDocWithSubcollections(subDoc);
        }
    }
    return data;
}

// コレクションごとにファイル出力 & ツリー構造を構築
async function dumpCollection(ref) {
    const collections = await ref.listCollections();
    const tree = {};

    for (const col of collections) {
        const colData = {};
        const docs = await col.listDocuments();

        for (const doc of docs) {
            colData[doc.id] = await getDocWithSubcollections(doc);
        }

        const filePath = path.join(outputDir, `${col.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(colData, null, 2));
        console.log(`Saved collection ${col.id} to ${filePath}`);

        tree[col.id] = buildTreeStructure(colData);
    }

    const treeText = printTree(tree);
    fs.writeFileSync(path.join(outputDir, 'firestore-structure-tree.txt'), treeText);
    console.log('Firestore structure tree saved to firestore-structure-tree.txt');
}

function buildTreeStructure(data) {
    const tree = {};
    for (const docId in data) {
        tree[docId] = {};
        const docData = data[docId];
        for (const key in docData) {
            if (typeof docData[key] === 'object' && docData[key] !== null) {
                tree[docId][key] = buildTreeStructure(docData[key]);
            }
        }
    }
    return tree;
}

function printTree(obj, prefix = '', isLast = true) {
    let output = '';
    const keys = Object.keys(obj);
    keys.forEach((key, index) => {
        const isLastChild = index === keys.length - 1;
        const pointer = isLastChild ? '└─ ' : '├─ ';

        output += prefix + pointer + key + (typeof obj[key] === 'object' && Object.keys(obj[key]).length ? '/' : '') + '\n';

        if (typeof obj[key] === 'object' && Object.keys(obj[key]).length) {
            const nextPrefix = prefix + (isLastChild ? '   ' : '│  ');
            output += printTree(obj[key], nextPrefix, isLastChild);
        }
    });
    return output;
}

(async () => {
    await dumpCollection(db);
    console.log('All collections dumped with nested subcollections and tree structure.');
})();
