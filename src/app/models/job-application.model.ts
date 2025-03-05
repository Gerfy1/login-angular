export interface JobApplication {
  id?: number;
  jobName: string;
  jobDescription: string;
  jobLink: string;
  stage: string;
  status: string;
  date: Date;
  reminder?: Date;
  reminderDescription?: string;
}
