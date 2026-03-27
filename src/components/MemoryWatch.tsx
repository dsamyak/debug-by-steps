import { useEffect, useRef, useState } from "react";

interface MemoryWatchProps {
  variables: Record<string, any>;
  previousVariables: Record<string, any>;
}

const MemoryWatch = ({ variables, previousVariables }: MemoryWatchProps) => {
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set());
  const timeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const newChanged = new Set<string>();
    for (const key of Object.keys(variables)) {
      const curr = JSON.stringify(variables[key]);
      const prev = JSON.stringify(previousVariables[key]);
      if (curr !== prev) {
        newChanged.add(key);
        // Clear previous timeout for this key
        if (timeoutRef.current[key]) clearTimeout(timeoutRef.current[key]);
        timeoutRef.current[key] = setTimeout(() => {
          setChangedKeys(prev => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        }, 800);
      }
    }
    if (newChanged.size > 0) {
      setChangedKeys(prev => new Set([...prev, ...newChanged]));
    }
  }, [variables, previousVariables]);

  const entries = Object.entries(variables);

  if (entries.length === 0) {
    return (
      <div className="text-muted-foreground text-sm font-mono italic">
        No variables yet. Step forward to begin...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => {
        const isChanged = changedKeys.has(key);
        const displayValue = Array.isArray(value)
          ? `[${value.join(", ")}]`
          : String(value);

        return (
          <div
            key={key}
            className={`flex items-center justify-between rounded-md border px-3 py-2 font-mono text-sm transition-all duration-300 ${
              isChanged
                ? "border-memory-changed bg-memory-changed/10 text-memory-changed scale-[1.02]"
                : "border-border bg-secondary/50 text-foreground"
            }`}
          >
            <span className="text-muted-foreground">{key}</span>
            <span className={`font-semibold ${isChanged ? "text-memory-changed" : ""}`}>
              {displayValue}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default MemoryWatch;
