export type AttendanceType = 'Ceremony + Dinner' | 'Dinner';

export interface GuestRow {
  firstName: string;
  lastName: string;
  email: string;
  party: string;
  attendanceType: AttendanceType;
  token: string;
  rowIndex: number;
}

export interface Party {
  token: string;
  partyName: string;
  displayName: string;
  attendanceType: AttendanceType;
  guests: GuestRow[];
  primaryEmail: string;
  emails: string[];
}

export interface RsvpSubmission {
  attending: boolean;
  guestResponses: { name: string; dietary: string }[];
  childUnder3: boolean;
  notes?: string;
}
