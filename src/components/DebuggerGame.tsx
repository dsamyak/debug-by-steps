import { useState, useCallback } from "react";
import { Puzzle, puzzles, executeLine } from "@/lib/puzzles";
import CodePanel from "./CodePanel";
import MemoryWatch from "./MemoryWatch";
import { Button } from "@/components/ui/button";
import { Play, SkipForward, RotateCcw, Bug, CheckCircle, Lightbulb, ChevronRight } from "lucide-react";

type GamePhase = "stepping" | "identify" | "fix" | "verify" | "complete";

const DebuggerGame = () => {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("stepping");
  const [currentLine, setCurrentLine] = useState(-1);
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [prevVariables, setPrevVariables] = useState<Record<string, any>>({});
  const [isDone, setIsDone] = useState(false);
  const [showBug, setShowBug] = useState(false);
  const [selectedFix, setSelectedFix] = useState<number | null>(null);
  const [isFixed, setIsFixed] = useState(false);
  const [fixedCode, setFixedCode] = useState<string | undefined>();
  const [showHint, setShowHint] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [message, setMessage] = useState("");

  const puzzle = puzzles[puzzleIdx];

  const reset = useCallback(() => {
    setCurrentLine(-1);
    setVariables({});
    setPrevVariables({});
    setIsDone(false);
    setShowBug(false);
    setSelectedFix(null);
    setIsFixed(false);
    setFixedCode(undefined);
    setShowHint(false);
    setStepCount(0);
    setMessage("");
    setPhase("stepping");
  }, []);

  const stepForward = useCallback(() => {
    if (isDone) return;

    const nextLine = currentLine === -1 ? 0 : currentLine;
    const result = executeLine(puzzle, nextLine, variables, isFixed, fixedCode);

    setPrevVariables({ ...variables });
    setVariables(result.vars);
    setStepCount(s => s + 1);

    if (result.done) {
      setIsDone(true);
      setCurrentLine(-1);
      if (phase === "stepping") {
        setPhase("identify");
        setMessage("Execution complete. Can you spot which line has the bug? Click 'Mark Bug' to identify it.");
      } else if (phase === "verify") {
        setPhase("complete");
        setMessage("🎉 Bug fixed! The code now produces the correct result.");
      }
    } else {
      setCurrentLine(result.nextLine);
    }
  }, [currentLine, variables, isDone, puzzle, phase, isFixed, fixedCode]);

  const handleIdentifyBug = () => {
    setShowBug(true);
    setPhase("fix");
    setMessage(`Line ${puzzle.bugLineIndex + 1} is the buggy line! Now choose the correct fix below.`);
  };

  const handleApplyFix = (optionIdx: number) => {
    setSelectedFix(optionIdx);
    const option = puzzle.fixOptions[optionIdx];
    if (option.isCorrect) {
      setIsFixed(true);
      setFixedCode(option.replacement);
      setPhase("verify");
      setMessage("Great choice! Now step through the fixed code to verify it works.");
      // Reset execution state for re-run
      setCurrentLine(-1);
      setVariables({});
      setPrevVariables({});
      setIsDone(false);
      setStepCount(0);
    } else {
      setMessage("❌ That's not quite right. Think about what the code needs to do and try again.");
      setSelectedFix(null);
    }
  };

  const nextPuzzle = () => {
    setPuzzleIdx((puzzleIdx + 1) % puzzles.length);
    reset();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bug className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-sans font-bold text-foreground tracking-tight">
              Bug Hunter
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-mono">
            <span className="text-muted-foreground">
              Puzzle {puzzleIdx + 1}/{puzzles.length}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
              puzzle.difficulty === "Easy" ? "bg-primary/20 text-primary" :
              puzzle.difficulty === "Medium" ? "bg-accent/20 text-accent" :
              "bg-destructive/20 text-destructive"
            }`}>
              {puzzle.difficulty}
            </span>
          </div>
        </div>
      </header>

      {/* Puzzle Info */}
      <div className="border-b border-border px-6 py-3 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-sans font-semibold text-foreground">{puzzle.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{puzzle.description}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Left: Code */}
        <div className="flex-1 border-r border-border flex flex-col">
          <div className="px-4 py-2 border-b border-border flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-accent/60" />
            <div className="w-3 h-3 rounded-full bg-primary/60" />
            <span className="ml-2 text-xs text-muted-foreground font-mono">algorithm.js</span>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <CodePanel
              lines={puzzle.lines}
              activeLine={currentLine}
              bugLine={puzzle.bugLineIndex}
              showBug={showBug}
              isFixed={isFixed}
              fixedLineCode={fixedCode}
            />
          </div>

          {/* Controls */}
          <div className="border-t border-border p-4 flex items-center gap-3 flex-wrap">
            {(phase === "stepping" || phase === "verify") && (
              <>
                <Button
                  onClick={stepForward}
                  disabled={isDone}
                  className="gap-2 font-mono"
                  size="sm"
                >
                  <SkipForward className="w-4 h-4" />
                  Step Forward
                </Button>
                <span className="text-xs text-muted-foreground font-mono">
                  Steps: {stepCount}
                </span>
              </>
            )}
            {phase === "identify" && (
              <Button onClick={handleIdentifyBug} variant="destructive" className="gap-2 font-mono" size="sm">
                <Bug className="w-4 h-4" />
                Reveal Bug
              </Button>
            )}
            {phase === "complete" && (
              <Button onClick={nextPuzzle} className="gap-2 font-mono" size="sm">
                <ChevronRight className="w-4 h-4" />
                Next Puzzle
              </Button>
            )}
            <Button onClick={reset} variant="outline" className="gap-2 font-mono ml-auto" size="sm">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Right: Memory Watch + Fix Panel */}
        <div className="w-80 flex flex-col">
          <div className="px-4 py-2 border-b border-border">
            <span className="text-xs text-primary font-mono font-semibold tracking-wider uppercase">
              ⬡ Memory Watch
            </span>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <MemoryWatch variables={variables} previousVariables={prevVariables} />
          </div>

          {/* Fix Options */}
          {phase === "fix" && (
            <div className="border-t border-border p-4 space-y-2">
              <span className="text-xs text-accent font-mono font-semibold uppercase">Choose Fix</span>
              {puzzle.fixOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyFix(idx)}
                  className="w-full text-left px-3 py-2 rounded border border-border bg-secondary/50 text-sm font-mono text-foreground hover:border-primary hover:bg-primary/10 transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Message / Hint */}
          <div className="border-t border-border p-4">
            {message && (
              <p className={`text-sm font-sans mb-2 ${
                phase === "complete" ? "text-primary" : "text-foreground"
              }`}>
                {message}
              </p>
            )}
            {phase === "stepping" && !isDone && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors font-mono"
              >
                <Lightbulb className="w-3 h-3" />
                {showHint ? puzzle.hint : "Show hint"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebuggerGame;
