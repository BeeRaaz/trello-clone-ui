import { Plus, X } from "lucide-react";
import type { Board, List, Task } from "../types/types";
import Button from "./ui/Button";
import TaskCard from "./TaskCard";
import { useState } from "react";
import { useBoard } from "../contexts/BoardContext";
import { Droppable, Draggable } from "@hello-pangea/dnd";

interface ListProps {
  board: Board;
  list: List;
  tasks: Task[];
}

function ListCard({ board, list, tasks = [] }: ListProps) {
  const { dispatch } = useBoard();
  const [showForm, setShowForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const boardId = board.id;
  const listId = list.id;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    dispatch({
      type: "ADD_TASK",
      payload: { boardId, listId, title: newTaskTitle },
    });

    setNewTaskTitle("");
    setShowForm(false);
  };

  return (
    <>
      <div className="py-2 px-4 h-full rounded-md bg-slate-200 min-w-[272px]">
        <h3 className="text-md font-semibold mb-5">{list.title}</h3>
        <Droppable droppableId={listId} type="TASK">
          {(provided, snapshot) => (
            <ul
              className={`space-y-2 min-h-5 ${
                snapshot.isDraggingOver ? "bg-slate-300 rounded p-1" : ""
              }`}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {tasks.map((task, index) => (
                <Draggable
                  key={task.id}
                  draggableId={task.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`${
                        snapshot.isDragging ? "opacity-50" : ""
                      }`}
                    >
                      <TaskCard task={task} />
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
        <div className="mt-2">
          {!showForm ? (
            <Button className="text-sm!" onClick={() => setShowForm(true)}>
              <Plus size={14} /> Add Task
            </Button>
          ) : (
            <form onSubmit={handleAddTask} className="space-y-2">
              <label htmlFor="task-input" className="sr-only">
                Task
              </label>
              <input
                id="task-input"
                type="text"
                placeholder="Add task"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
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
        </div>
      </div>
    </>
  );
}

export default ListCard;
