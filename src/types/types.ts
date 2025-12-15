export interface Task {
  id: string;
  title: string;
  description?: string;
}

export interface List {
  id: string;
  title: string;
  tasks: Task[];
}

export interface Board {
  id: string;
  title: string;
  lists: List[];
}

export interface BoardState {
  boards: Board[];
  selectedBoardId: string | null;
  isLoading: boolean;
}

// History state for undo/redo functionality
export interface HistoryState {
  past: BoardState[];
  present: BoardState;
  future: BoardState[];
}

export type BoardAction =
  | { type: "SELECT_BOARD"; payload: string }
  | { type: "ADD_BOARD"; payload: string }
  | { type: "ADD_LIST"; payload: { boardId: string; title: string } }
  | {
    type: "ADD_TASK";
    payload: { boardId: string; listId: string; title: string };
  }
  | {
    type: "REORDER_LISTS";
    payload: { boardId: string; sourceIndex: number; destinationIndex: number };
  }
  | {
    type: "MOVE_TASK";
    payload: {
      sourceListId: string;
      destinationListId: string;
      sourceIndex: number;
      destinationIndex: number;
    };
  }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SET_LOADING"; payload: boolean };
