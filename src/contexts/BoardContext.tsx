import { createContext, useContext, useReducer } from "react";
import type { BoardAction, BoardState } from "../types/types";

const BoardContext = createContext<any | null>(null);

// const initialBoardState: BoardState = {
//   boards: [],
//   selectedBoardId: null,
// };

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
  selectedBoardId: "board-1", // pre-select one board for easier testing
};

function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "SELECT_BOARD": {
      return {
        ...state,
        selectedBoardId: action.payload,
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
      return {
        ...state,
        boards: state.boards.map((board) => {
          if (board.id === action.payload.boardId) {
            const newLists = [...board.lists];
            const [removedList] = newLists.splice(action.payload.sourceIndex, 1);
            newLists.splice(action.payload.destinationIndex, 0, removedList);
            return {
              ...board,
              lists: newLists,
            };
          }
          return board;
        }),
      };
    }
    case "MOVE_TASK": {
      return {
        ...state,
        boards: state.boards.map((board) => {
          return {
            ...board,
            lists: board.lists.map((list) => {
              // Source list: remove the task
              if (list.id === action.payload.sourceListId) {
                const newTasks = [...list.tasks];
                newTasks.splice(action.payload.sourceIndex, 1);
                return { ...list, tasks: newTasks };
              }
              // Destination list: add the task
              if (list.id === action.payload.destinationListId) {
                const newTasks = [...list.tasks];
                const task = board.lists
                  .find((l) => l.id === action.payload.sourceListId)
                  ?.tasks[action.payload.sourceIndex];
                if (task) {
                  newTasks.splice(action.payload.destinationIndex, 0, task);
                }
                return { ...list, tasks: newTasks };
              }
              return list;
            }),
          };
        }),
      };
    }
    default:
      return state;
  }
}

function BoardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(boardReducer, initialBoardState);

  return (
    <BoardContext.Provider value={{ state, dispatch }}>
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
