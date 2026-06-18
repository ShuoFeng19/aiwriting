export type StepDefinition = {
  id: string;
  title: string;
  instruction: string;
  detail: string;
  supportsAi: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputDefault?: string;
};

export type StudentSession = {
  studentId: string;
  topic: string;
};

export type StepState = {
  studentInput: string;
  aiOutput: string;
  saved: boolean;
};

export type SubmissionRecord = {
  id: string;
  studentId: string;
  topic: string;
  stepId: string;
  stepName: string;
  studentInput: string;
  aiOutput: string;
  timestamp: string;
};
