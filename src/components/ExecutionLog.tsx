interface ExecutionLogEntry {
  step: number;
  line: number;
  description?: string;
  conditionEval?: string;
}

interface ExecutionLogProps {
  entries: ExecutionLogEntry[];
}

const ExecutionLog = ({ entries }: ExecutionLogProps) => {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <p className="text-muted-foreground text-sm font-mono">
          Execution trace will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 font-mono text-sm max-h-48 overflow-y-auto">
      {entries.map((entry, idx) => (
        <div
          key={idx}
          className={`flex gap-2 py-1 px-2 rounded ${
            idx === entries.length - 1 ? "bg-primary/10 text-foreground" : "text-muted-foreground"
          }`}
        >
          <span className="text-muted-foreground/50 w-6 text-right shrink-0">
            {entry.step}
          </span>
          <span className="text-code-gutter shrink-0">L{entry.line}</span>
          <span className="flex-1 truncate">
            {entry.conditionEval && (
              <span className={`${entry.conditionEval.includes("true") ? "text-primary" : "text-destructive"}`}>
                {entry.conditionEval}
              </span>
            )}
            {entry.description && !entry.conditionEval && (
              <span>{entry.description}</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
};

export type { ExecutionLogEntry };
export default ExecutionLog;
