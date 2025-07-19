export type Message = {
    id: string;
    subject: string;
    content: string;
    createdAt: Date | null;
    read: boolean;
};

export type Log = {
    id: string;
    timestamp?: { toDate: () => Date };
    action: string;
    target: string;
    detail: string;
};
