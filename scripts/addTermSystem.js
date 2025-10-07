// scripts/addTermSystem.js
import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname 相当を取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ルート直下の serviceAccountKey.json への絶対パスを作成
const serviceAccountPath = path.resolve(__dirname, "../serviceAccountKey.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function addTermSystemToAllStudents() {
    const snapshot = await db.collection("students").get();

    console.log(`📚 Found ${snapshot.size} students.`);

    const batch = db.batch();
    snapshot.forEach((doc) => {
        batch.update(doc.ref, { termSystem: 3 });
    });

    await batch.commit();
    console.log("✅ termSystem field added to all students!");
}

addTermSystemToAllStudents().then(() => process.exit());
