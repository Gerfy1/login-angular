export interface ReminderCreate {
  title: string;
  description: string;
  date: string | Date;
  completed: boolean;
  jobApplicationId: number;
}
