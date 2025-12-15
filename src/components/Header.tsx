import { Undo2, Redo2 } from "lucide-react";
import Container from "./Container";
import { useBoard } from "../contexts/BoardContext";
import { useToast } from "../contexts/ToastContext";

function Header() {
  const { canUndo, canRedo, undo, redo } = useBoard();
  const { addToast } = useToast();

  const handleUndo = () => {
    if (canUndo) {
      undo();
      addToast("Action undone", "info");
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      redo();
      addToast("Action redone", "info");
    }
  };

  return (
    <header>
      <Container className="flex flex-wrap justify-between items-center gap-5 h-20 py-3 bg-slate-500">
        <h1 className="font-bold tracking-tight text-2xl md:text-3xl">
          Trello Clone
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className={`p-2 rounded-md transition-colors ${canUndo
              ? "bg-slate-400 hover:bg-slate-300 text-white"
              : "bg-slate-600 text-slate-400 cursor-not-allowed"
              }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={20} />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className={`p-2 rounded-md transition-colors ${canRedo
              ? "bg-slate-400 hover:bg-slate-300 text-white"
              : "bg-slate-600 text-slate-400 cursor-not-allowed"
              }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={20} />
          </button>
        </div>
      </Container>
    </header>
  );
}

export default Header;

