export interface KanbanColumn {
  id: number;
  name: string;
  position: number;
  userId: number;
}

export interface CreateKanbanColumnDto {
  name: string;
  position: number;
  userId: number;
}

export interface UpdateKanbanColumnDto {
  name: string;
  position: number;
  userId: number;
}
