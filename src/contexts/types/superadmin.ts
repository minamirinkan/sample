import { Timestamp } from 'firebase/firestore';

export type Superadmin = {
    uid: string;
    name: string;
    email: string;
    role: 'superadmin';
    createdAt: Timestamp
    lastLogin: Timestamp
};
