import { useState, type FormEvent } from "react";
import Button from "./ui/Button";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { useBoard } from "../contexts/BoardContext";
import type { Board } from "../types/types";

function Sidebar() {
  const [show, setShow] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const { state, dispatch } = useBoard();

  const handleSelectBoard = (boardId: string) => {
    dispatch({ type: "SELECT_BOARD", payload: boardId });
  };

  const handleAddBoard = (e: FormEvent) => {
    e.preventDefault();

    dispatch({ type: "ADD_BOARD", payload: newBoardTitle });
    setNewBoardTitle("");
    setShowForm(false);
  };

  return (
    <aside
      className={`bg-gray-100 p-4 min-w-fit ${show ? "w-1/6" : "w-min"} overflow-x-hidden overflow-y-auto`}
    >
      <div className="flex justify-between items-center gap-3">
        {show && (
          <h2 className="font-semibold tracking-tight text-xl">SideBar</h2>
        )}
        <Button onClick={() => setShow(!show)} className="p-2! bg-gray-300">
          {show ? <ChevronLeft /> : <ChevronRight />}
        </Button>
      </div>
      {show && (
        <div className="mt-4">
          <h3 className="font-semibold tracking-tighter text-lg mb-2">
            Your Boards
          </h3>
          {state.boards.length ? (
            <>
              <div className="space-y-2">
                <ul className="space-y-2">
                  {state.boards.map((board: Board) => (
                    <li key={board.id} className="w-full">
                      <Button
                        className={`${
                          state.selectedBoardId === board.id
                            ? "cursor-not-allowed! bg-slate-200!"
                            : ""
                        }`}
                        fullWidth={true}
                        onClick={() => handleSelectBoard(board.id)}
                      >
                        {board.title}
                      </Button>
                    </li>
                  ))}
                </ul>

                {!showForm ? (
                  <div>
                    <Button onClick={() => setShowForm(true)}>
                      <Plus size={16} />
                      Add board
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleAddBoard} className="space-y-2">
                    <label htmlFor="board-input" className="sr-only">
                      Board
                    </label>
                    <input
                      id="board-input"
                      type="text"
                      placeholder="Add Board"
                      value={newBoardTitle}
                      onChange={(e) => setNewBoardTitle(e.target.value)}
                      className="border py-1 px-2 rounded-sm focus:outline-none w-full"
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
            </>
          ) : (
            <p>No Boards Available.</p>
          )}
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
