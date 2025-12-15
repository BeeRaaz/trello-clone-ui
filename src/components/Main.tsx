import { Plus, X } from "lucide-react";
import Button from "./ui/Button";
import { useBoard } from "../contexts/BoardContext";
import { useToast } from "../contexts/ToastContext";
import type { Board, List as ListType } from "../types/types";
import ListCard from "./ListCard";
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";

function Main() {
  const { state, dispatch } = useBoard();
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  const selectedBoard: Board | undefined = state.boards.find(
    (board: Board) => board.id === state.selectedBoardId
  );

  // Loading state display
  if (state.isLoading) {
    return (
      <main className="flex-1 p-5 flex gap-5 h-full w-full overflow-x-auto">
        <div className="flex gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="py-2 px-4 h-64 rounded-md bg-slate-200 min-w-[272px] animate-pulse"
            >
              <div className="h-6 bg-slate-300 rounded w-3/4 mb-5"></div>
              <div className="space-y-2">
                <div className="h-12 bg-slate-300 rounded"></div>
                <div className="h-12 bg-slate-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (!selectedBoard) {
    return (
      <main>
        <p>No board selected!</p>
      </main>
    )
  };

  const boardId = selectedBoard.id;

  const handleAddList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    dispatch({ type: "ADD_LIST", payload: { boardId, title: newListTitle } });
    addToast(`List "${newListTitle}" added`, "success");

    setNewListTitle("");
    setShowForm(false);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    // If dropped outside a droppable area
    if (!destination) {
      addToast("Drop cancelled - no valid destination", "warning");
      return;
    }

    // If dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (type === "LIST") {
      // Validate before dispatch
      if (source.index < 0 || source.index >= selectedBoard.lists.length ||
        destination.index < 0 || destination.index >= selectedBoard.lists.length) {
        addToast("Invalid list position", "error");
        return;
      }

      dispatch({
        type: "REORDER_LISTS",
        payload: {
          boardId: boardId,
          sourceIndex: source.index,
          destinationIndex: destination.index,
        },
      });
      addToast("List reordered", "success");
    } else if (type === "TASK") {
      const sourceList = selectedBoard.lists.find(l => l.id === source.droppableId);
      const destList = selectedBoard.lists.find(l => l.id === destination.droppableId);

      if (!sourceList || !destList) {
        addToast("Invalid list for task move", "error");
        return;
      }

      if (source.index < 0 || source.index >= sourceList.tasks.length) {
        addToast("Invalid task position", "error");
        return;
      }

      dispatch({
        type: "MOVE_TASK",
        payload: {
          sourceListId: source.droppableId,
          destinationListId: destination.droppableId,
          sourceIndex: source.index,
          destinationIndex: destination.index,
        },
      });

      if (source.droppableId === destination.droppableId) {
        addToast("Task reordered", "success");
      } else {
        addToast(`Task moved to "${destList.title}"`, "success");
      }
    }
  };

  return (
    <main className="flex-1 p-5 flex gap-5 h-full w-full overflow-x-auto">
      {state.boards.length ? (
        !selectedBoard ? (
          <h3>Select a board to view its lists.</h3>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable
              droppableId="lists"
              type="LIST"
              direction="horizontal"
              isCombineEnabled={false}
            >
              {(provided) => (
                <ul
                  className="flex gap-5"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {selectedBoard.lists.map((list: ListType, index: number) => (
                    <Draggable
                      key={list.id}
                      draggableId={list.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${snapshot.isDragging ? "opacity-50" : ""
                            }`}
                        >
                          <ListCard
                            board={selectedBoard}
                            list={list}
                            tasks={list.tasks}
                          />
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>

            {!showForm ? (
              <div className="min-w-fit">
                <Button onClick={() => setShowForm(true)}>
                  <Plus size={16} />
                  Add another list
                </Button>
              </div>
            ) : (
              <form onSubmit={handleAddList} className="space-y-2">
                <label htmlFor="list-input" className="sr-only">
                  List
                </label>
                <input
                  id="list-input"
                  type="text"
                  placeholder="Add list"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  className="border py-1 px-2 rounded-sm focus:outline-none"
                />
                <div className="flex gap-3">
                  <Button type="submit">Add</Button>
                  <Button onClick={() => setShowForm(false)}>
                    <X size={16} />
                  </Button>
                </div>
              </form>
            )}
          </DragDropContext>
        )
      ) : (
        <>
          <h3>No boards found</h3>
          <Button>
            <Plus size={16} />
            Create your first board
          </Button>
        </>
      )}
    </main>
  );
}

export default Main;
