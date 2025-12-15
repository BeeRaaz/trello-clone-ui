import { createContext, useCallback, useContext, useEffect, useReducer } from "react";
import type { BoardAction, BoardState, HistoryState } from "../types/types";

interface BoardContextType {
  state: BoardState;
  dispatch: React.Dispatch<BoardAction>;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

const BoardContext = createContext<BoardContextType | null>(null);

const MAX_HISTORY_SIZE = 50;

const initialBoardState: BoardState = {
  boards: [
    {
      id: "board-1",
      title: "Project Alpha",
      lists: [
        {
          id: "list-1",
          title: "To Do",
          tasks: [
            { id: "task-1", title: "Design landing page" },
            { id: "task-2", title: "Set up GitHub repository" },
          ],
        },
        {
          id: "list-2",
          title: "In Progress",
          tasks: [
            { id: "task-3", title: "Implement authentication" },
            { id: "task-4", title: "Connect API endpoints" },
          ],
        },
        {
          id: "list-3",
          title: "Done",
          tasks: [
            { id: "task-5", title: "Create project wireframes" },
            { id: "task-6", title: "Team kickoff meeting" },
          ],
        },
      ],
    },
    {
      id: "board-2",
      title: "Personal Tasks",
      lists: [
        {
          id: "list-4",
          title: "This Week",
          tasks: [
            { id: "task-7", title: "Grocery shopping" },
            { id: "task-8", title: "Pay electricity bill" },
          ],
        },
        {
          id: "list-5",
          title: "Next Week",
          tasks: [
            { id: "task-9", title: "Plan weekend trip" },
            { id: "task-10", title: "Finish reading book" },
          ],
        },
      ],
    },
  ],
  selectedBoardId: "board-1",
  isLoading: false,
};

// Core board reducer - handles all board state changes
function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "SELECT_BOARD": {
      return {
        ...state,
        selectedBoardId: action.payload,
      };
    }
    case "SET_LOADING": {
      return {
        ...state,
        isLoading: action.payload,
      };
    }
    case "ADD_BOARD": {
      return {
        ...state,
        boards: [
          ...state.boards,
          { id: crypto.randomUUID(), title: action.payload, lists: [] },
        ],
      };
    }
    case "ADD_LIST": {
      return {
        ...state,
        boards: state.boards.map((board) => {
          if (board.id === action.payload.boardId) {
            return {
              ...board,
              lists: [
                ...board.lists,
                {
                  id: crypto.randomUUID(),
                  title: action.payload.title,
                  tasks: [],
                },
              ],
            };
          }
          return board;
        }),
      };
    }
    case "ADD_TASK": {
      return {
        ...state,
        boards: state.boards.map((board) => {
          if (board.id === action.payload.boardId) {
            return {
              ...board,
              lists: board.lists.map((lists) => {
                if (lists.id === action.payload.listId) {
                  return {
                    ...lists,
                    tasks: [
                      ...lists.tasks,
                      { id: crypto.randomUUID(), title: action.payload.title },
                    ],
                  };
                }
                return lists;
              }),
            };
          }
          return board;
        }),
      };
    }
    case "REORDER_LISTS": {
      const { boardId, sourceIndex, destinationIndex } = action.payload;
      const board = state.boards.find((b) => b.id === boardId);

      // Validation: check board exists and indices are valid
      if (!board) {
        console.warn("REORDER_LISTS: Board not found");
        return state;
      }
      if (
        sourceIndex < 0 ||
        sourceIndex >= board.lists.length ||
        destinationIndex < 0 ||
        destinationIndex >= board.lists.length
      ) {
        console.warn("REORDER_LISTS: Invalid indices");
        return state;
      }

      return {
        ...state,
        boards: state.boards.map((b) => {
          if (b.id === boardId) {
            const newLists = [...b.lists];
            const [removedList] = newLists.splice(sourceIndex, 1);
            newLists.splice(destinationIndex, 0, removedList);
            return {
              ...b,
              lists: newLists,
            };
          }
          return b;
        }),
      };
    }
    case "MOVE_TASK": {
      const { sourceListId, destinationListId, sourceIndex, destinationIndex } = action.payload;

      // Find the board containing the source list
      const board = state.boards.find((b) =>
        b.lists.some((l) => l.id === sourceListId)
      );

      // Validation: check lists exist
      if (!board) {
        console.warn("MOVE_TASK: Source list not found in any board");
        return state;
      }

      const sourceList = board.lists.find((l) => l.id === sourceListId);
      const destList = board.lists.find((l) => l.id === destinationListId);

      if (!sourceList || !destList) {
        console.warn("MOVE_TASK: Source or destination list not found");
        return state;
      }

      // Validation: check task exists at source index
      if (sourceIndex < 0 || sourceIndex >= sourceList.tasks.length) {
        console.warn("MOVE_TASK: Invalid source index");
        return state;
      }

      // Validation: check destination index is valid
      const maxDestIndex = sourceListId === destinationListId
        ? destList.tasks.length - 1
        : destList.tasks.length;
      if (destinationIndex < 0 || destinationIndex > maxDestIndex) {
        console.warn("MOVE_TASK: Invalid destination index");
        return state;
      }

      // Get the task before any modifications
      const taskToMove = sourceList.tasks[sourceIndex];

      // Handle same-list reordering separately
      if (sourceListId === destinationListId) {
        return {
          ...state,
          boards: state.boards.map((b) => ({
            ...b,
            lists: b.lists.map((list) => {
              if (list.id === sourceListId) {
                const newTasks = [...list.tasks];
                // Remove from source position
                newTasks.splice(sourceIndex, 1);
                // Insert at destination position
                newTasks.splice(destinationIndex, 0, taskToMove);
                return { ...list, tasks: newTasks };
              }
              return list;
            }),
          })),
        };
      }

      // Handle cross-list movement
      return {
        ...state,
        boards: state.boards.map((b) => ({
          ...b,
          lists: b.lists.map((list) => {
            // Source list: remove the task
            if (list.id === sourceListId) {
              const newTasks = [...list.tasks];
              newTasks.splice(sourceIndex, 1);
              return { ...list, tasks: newTasks };
            }
            // Destination list: add the task
            if (list.id === destinationListId) {
              const newTasks = [...list.tasks];
              newTasks.splice(destinationIndex, 0, taskToMove);
              return { ...list, tasks: newTasks };
            }
            return list;
          }),
        })),
      };
    }
    default:
      return state;
  }
}

// Higher-order reducer that adds undo/redo functionality
function historyReducer(historyState: HistoryState, action: BoardAction): HistoryState {
  const { past, present, future } = historyState;

  switch (action.type) {
    case "UNDO": {
      if (past.length === 0) return historyState;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    }
    case "REDO": {
      if (future.length === 0) return historyState;
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      };
    }
    case "SELECT_BOARD":
    case "SET_LOADING": {
      // These actions don't affect history - just update present
      return {
        ...historyState,
        present: boardReducer(present, action),
      };
    }
    default: {
      // All other actions add to history
      const newPresent = boardReducer(present, action);
      // Don't add to history if state didn't change
      if (newPresent === present) return historyState;

      // Limit history size
      const newPast = [...past, present].slice(-MAX_HISTORY_SIZE);
      return {
        past: newPast,
        present: newPresent,
        future: [], // Clear redo stack on new action
      };
    }
  }
}

// Helper function to safely load state from localStorage
function loadStateFromLocalStorage(): HistoryState | null {
  try {
    const storedState = localStorage.getItem("boardState");
    if (storedState === null) {
      return null;
    }
    const parsed = JSON.parse(storedState);

    // Handle migration from old format (just BoardState) to new format (HistoryState)
    if (parsed && typeof parsed === "object" && "boards" in parsed && !("present" in parsed)) {
      // Old format - wrap in history structure
      return {
        past: [],
        present: { ...parsed, isLoading: parsed.isLoading ?? false },
        future: [],
      };
    }

    return parsed as HistoryState;
  } catch (error) {
    console.error("Failed to load state from localStorage:", error);
    return null;
  }
}

// Helper function to safely save state to localStorage
function saveStateToLocalStorage(historyState: HistoryState): void {
  try {
    localStorage.setItem("boardState", JSON.stringify(historyState));
  } catch (error) {
    console.error("Failed to save state to localStorage:", error);
  }
}

// Lazy initializer function for useReducer
function initializeHistoryState(): HistoryState {
  const storedState = loadStateFromLocalStorage();
  return storedState ?? {
    past: [],
    present: initialBoardState,
    future: [],
  };
}

function BoardProvider({ children }: { children: React.ReactNode }) {
  const [historyState, dispatch] = useReducer(
    historyReducer,
    null,
    initializeHistoryState
  );

  const canUndo = historyState.past.length > 0;
  const canRedo = historyState.future.length > 0;

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: "REDO" });
  }, []);

  // Save to localStorage on every state update
  useEffect(() => {
    saveStateToLocalStorage(historyState);
  }, [historyState]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  return (
    <BoardContext.Provider
      value={{
        state: historyState.present,
        dispatch,
        canUndo,
        canRedo,
        undo,
        redo,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}

function useBoard() {
  const context = useContext(BoardContext);
  if (!context) throw new Error("useBoard must be used within a BoardProvider");
  return context;
}

export { BoardProvider, useBoard };
