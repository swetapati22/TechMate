// src/types/Ticket.ts
export interface Ticket {
    id: string;
    appname: string;
    devicename: string;
    summary: string;
    video: string;
    status: boolean; // false = unresolved, true = resolved
    createdTimestamp: Date;
    AnsweredTimestamp?: Date;
    userid: string; // we’ll store as string instead of DocumentReference for now
  }
  