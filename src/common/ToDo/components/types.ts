import { Timestamp } from "firebase/firestore";

export type Message = {
    id: string;
    subject: string;
    content: string;
    createdAt: Date | null;
    read: boolean;
};

export interface Log {
  id: string;
  timestamp: Timestamp;  // any→Timestampに変更
  content: string;
  editor: string;
  action?: string;
  target?: string;
  detail?: string;
}
