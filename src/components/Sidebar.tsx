import { useState } from "react";
import Button from "./ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBoard } from "../contexts/BoardContext";
import type { Board } from "../types/types";

function Sidebar() {
  const [show, setShow] = useState(true);
  const { state, dispatch } = useBoard();

  const handleSelectBoard = (boardId: string) => {
    dispatch({ type: "SELECT_BOARD", payload: boardId });
  };

  return (
    <aside
      className={`bg-gray-100 p-4 ${show ? "w-1/6" : "w-min"} overflow-hidden`}
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
            <ul className="space-y-2">
              {state.boards.map((board: Board) => (
                <li key={board.id}>
                  <Button
                    className={`${
                      state.selectedBoardId === board.id
                        ? "cursor-not-allowed! bg-slate-200!"
                        : ""
                    }`}
                    onClick={() => handleSelectBoard(board.id)}
                  >
                    {board.title}
                  </Button>
                  {/* <a href={`${board.id}`}>{board.title}</a> */}
                </li>
              ))}
            </ul>
          ) : (
            <p>No Boards Available.</p>
          )}
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
