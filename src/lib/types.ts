export type AttendanceType = 'Ceremony + Dinner' | 'Dinner';

export interface GuestRow {
  firstName: string;
  lastName: string;
  email: string;
  party: string;
  attendanceType: AttendanceType;
  guestOf: string;
  token: string;
  rowIndex: number;
  inviteSentAt: string;
}

export interface Party {
  token: string;
  partyName: string;
  displayName: string;
  attendanceType: AttendanceType;
  guestOf: string;
  guests: GuestRow[];
  primaryEmail: string;
  emails: string[];
  inviteSentAt: string;
}

export interface RsvpSubmission {
  guestResponses: { name: string; dietary: string; attending: boolean }[];
  childUnder3: boolean;
  notes?: string;
}
