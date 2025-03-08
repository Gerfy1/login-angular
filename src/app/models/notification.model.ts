export interface Notification{
  id: number;
  message: string;
  type: 'reminder' | 'info' | 'job' | 'system';
  createdAt: Date;
  read: boolean;
  relatedId?: number;
}
