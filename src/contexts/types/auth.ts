// types/auth.ts
import { UserData, UserRole } from "./user";

export type AuthContextType = {
    user: any | null;
    role: UserRole;
    userData: UserData | null;
    loading: boolean;
};
