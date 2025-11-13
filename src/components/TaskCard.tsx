import type { Task } from "../types/types";

interface TaskCardProps {
  task: Task;
}

function TaskCard({ task }: TaskCardProps) {
  return (
    <>
      <div className="flex gap-2 items-center py-1 px-2 rounded-md bg-slate-300">
        <div>{task.title}</div>
      </div>
    </>
  );
}

export default TaskCard;
