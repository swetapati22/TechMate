export interface Question {
    id: string;
    device: string;
    question: string;
    answer: string | null;
    video: string | null;
    isResolved: boolean;
  }