export type Customer = {
  uid: string;
  email: string;
  classroomCode: string;
  guardianFirstName: string;
  guardianLastName: string;
  guardianName: string;
  isFirstLogin: boolean;
  phoneNumber: string;
  role: string;
  studentIds: string[]; // e.g., ["s0240006", "s0470011"]
  createdAt: any; // Timestamp
};
