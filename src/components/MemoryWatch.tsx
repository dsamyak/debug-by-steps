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
        if (timeoutRef.current[key]) clearTimeout(timeoutRef.current[key]);
        timeoutRef.current[key] = setTimeout(() => {
          setChangedKeys(prev => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        }, 1200);
      }
    }
    if (newChanged.size > 0) {
      setChangedKeys(prev => new Set([...prev, ...newChanged]));
    }
  }, [variables, previousVariables]);

  const entries = Object.entries(variables);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="text-2xl mb-2">🔍</div>
        <p className="text-muted-foreground text-base font-mono">
          No variables yet
        </p>
        <p className="text-muted-foreground/60 text-sm mt-1">
          Click "Step Forward" to begin execution
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {entries.map(([key, value]) => {
        const isChanged = changedKeys.has(key);
        const displayValue = Array.isArray(value)
          ? `[${value.join(", ")}]`
          : typeof value === "string"
          ? `"${value}"`
          : String(value);

        const prevValue = previousVariables[key];
        const prevDisplay = prevValue !== undefined
          ? Array.isArray(prevValue)
            ? `[${prevValue.join(", ")}]`
            : typeof prevValue === "string"
            ? `"${prevValue}"`
            : String(prevValue)
          : null;

        return (
          <div
            key={key}
            className={`rounded-md border px-3 py-2 font-mono text-base transition-all duration-300 ${
              isChanged
                ? "border-memory-changed bg-memory-changed/5 scale-[1.01] shadow-sm shadow-memory-changed/10"
                : "border-border bg-secondary/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">{key}</span>
              <span className={`font-semibold ${isChanged ? "text-memory-changed" : "text-foreground"}`}>
                {displayValue}
              </span>
            </div>
            {isChanged && prevDisplay !== null && prevDisplay !== displayValue && (
              <div className="text-sm text-muted-foreground/60 mt-0.5 text-right">
                was: <span className="line-through">{prevDisplay}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MemoryWatch;
