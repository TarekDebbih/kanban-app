export interface DndState {
  type: 'ticket' | 'column' | null;
  id: number | null;
  fromColId: number | null;
  overColId: number | null;
  overTicketId: number | null;
}

export const EMPTY_DND: DndState = {
  type: null,
  id: null,
  fromColId: null,
  overColId: null,
  overTicketId: null,
};
