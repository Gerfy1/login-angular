export interface Reminder {
  id?: number;
  title: string;
  description: string;
  date: Date;
  jobApplicationId: number;
  completed: boolean;
  color?:{
    primary: string;
    secondary: string;
  };
}
