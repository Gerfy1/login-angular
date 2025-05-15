import { JobApplication } from "./job-application.model";
export interface Reminder {
  id?: number;
  title: string;
  description: string;
  date: Date;
  jobApplication?: JobApplication;
  jobApplicationId: number;
  completed: boolean;
  color?:{
    primary: string;
    secondary: string;
  };
}
