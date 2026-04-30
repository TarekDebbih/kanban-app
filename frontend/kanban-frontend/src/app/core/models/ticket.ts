export interface Ticket {
  id: number;
  title: string;
  description: string;
  timeSpentHours: number;
  createdAt: string;
  position: number;
  kanbanColumnId: number;
}

export interface CreateTicketDto {
  title: string;
  description: string;
  timeSpentHours: number;
  position: number;
  kanbanColumnId: number;
}

export interface UpdateTicketDto {
  title: string;
  description: string;
  timeSpentHours: number;
  position: number;
  kanbanColumnId: number;
}
