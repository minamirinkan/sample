// /api/line-webhook.ts
import admin from 'firebase-admin';

// VercelRequest / VercelResponse を自前で定義
type VercelRequest = {
    method?: string;
    body?: any;
};

type VercelResponse = {
    status: (code: number) => VercelResponse;
    send: (body: any) => void;
    end: () => void;
};

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = admin.firestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).end();

    const events = req.body?.events || [];

    try {
        for (const event of events) {
            if (event.type === 'message') {
                await db.collection('lineMessages').add({
                    userId: event.source.userId,
                    text: event.message.text,
                    isRead: false,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
        }
        res.status(200).send('OK');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
}
