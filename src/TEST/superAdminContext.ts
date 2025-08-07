import { Timestamp } from "firebase/firestore";
import { Superadmin } from "../contexts/types/superadmin";
import { Admin } from "../contexts/types/admin";
import { Classroom } from "../contexts/types/classroom";
import { Customer } from "../contexts/types/customer";
import { SchoolClosure } from "../contexts/types/schoolClosures";
import { Student } from "../contexts/types/student";
import { DailyScheduleDocument } from "../contexts/types/dailySchedule";
import { PeriodLabel } from "../contexts/types/periodLabel";

export interface SuperAdminDataContextType {
    userData: any;
    admins: Admin[];
    adminsLoading: boolean;
    classrooms: Classroom[];
    customers: Customer[];
    dailySchedules: DailyScheduleDocument[];
    periodLabels: PeriodLabel[];
    closures: SchoolClosure[];
    deletedClosures: SchoolClosure[];
    closuresUpdatedAt: Timestamp | null;
    students: Student[];
    superadmins: Superadmin[];
    superadminsLoading: boolean;
    isLoading: boolean;
    error: unknown;
}
