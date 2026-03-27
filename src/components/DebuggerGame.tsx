import { useState, useCallback, useEffect } from "react";
import { puzzles, executeLine } from "@/lib/puzzles";
import CodePanel from "./CodePanel";
import MemoryWatch from "./MemoryWatch";
import ExecutionLog, { ExecutionLogEntry } from "./ExecutionLog";
import WelcomeScreen from "./WelcomeScreen";
import { Glossary } from "./Glossary";
import { Button } from "@/components/ui/button";
import { SkipForward, RotateCcw, Bug, Lightbulb, ChevronRight, Home, Eye, EyeOff, BookOpen, ChevronLeft } from "lucide-react";

type GamePhase = "welcome" | "stepping" | "quiz" | "identify" | "fix" | "verify" | "complete";

const STORAGE_KEY = "bughunter-completed";

function loadCompleted(): Set<string> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch { return new Set(); }
}

function saveCompleted(set: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

const DebuggerGame = () => {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("welcome");
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
  const [showExplanations, setShowExplanations] = useState(true);
  const [executionLog, setExecutionLog] = useState<ExecutionLogEntry[]>([]);
  const [completedPuzzles, setCompletedPuzzles] = useState<Set<string>>(loadCompleted);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [rightPanelTab, setRightPanelTab] = useState<"memory" | "log">("memory");
  const [answeredQuizzes, setAnsweredQuizzes] = useState<Set<number>>(new Set());
  const [stateHistory, setStateHistory] = useState<any[]>([]);

  const puzzle = puzzles[puzzleIdx];

  const resetExecution = useCallback(() => {
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
    setExecutionLog([]);
    setWrongAttempts(0);
    setPhase("stepping");
    setRightPanelTab("memory");
    setAnsweredQuizzes(new Set());
    setStateHistory([]);
  }, []);

  const selectPuzzle = useCallback((idx: number) => {
    setPuzzleIdx(idx);
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
    setExecutionLog([]);
    setWrongAttempts(0);
    setPhase("stepping");
    setRightPanelTab("memory");
    setAnsweredQuizzes(new Set());
    setStateHistory([]);
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase === "welcome") return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!isDone && (phase === "stepping" || phase === "verify")) {
          stepForward();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const stepForward = useCallback(() => {
    if (isDone) return;
    const nextLine = currentLine === -1 ? 0 : currentLine;
    
    // Check for inline quiz BEFORE stepping
    const lineObj = puzzle.lines[nextLine];
    if (lineObj && lineObj.quiz && !answeredQuizzes.has(nextLine)) {
      setPhase("quiz");
      return;
    }

    // Save state history
    setStateHistory(prev => [...prev, {
      currentLine,
      variables,
      prevVariables,
      isDone,
      showBug,
      selectedFix,
      isFixed,
      fixedCode,
      stepCount,
      message,
      executionLog,
      phase,
      answeredQuizzes: new Set(answeredQuizzes),
      rightPanelTab
    }]);

    const result = executeLine(puzzle, nextLine, variables, isFixed, fixedCode);

    setPrevVariables({ ...variables });
    setVariables(result.vars);
    setStepCount(s => s + 1);

    // Add to execution log
    setExecutionLog(prev => [...prev, {
      step: prev.length + 1,
      line: nextLine + 1,
      description: result.lineExplanation,
      conditionEval: result.conditionEval,
    }]);

    if (result.done) {
      setIsDone(true);
      setCurrentLine(-1);
      if (phase === "stepping") {
        setPhase("identify");
        setMessage("✋ Execution complete! Did you notice anything wrong with the result? Click 'Reveal Bug' to see the faulty line.");
      } else if (phase === "verify") {
        setPhase("complete");
        const newCompleted = new Set<string>(completedPuzzles);
        newCompleted.add(puzzle.id);
        setCompletedPuzzles(newCompleted);
        saveCompleted(newCompleted);
        setMessage("🎉 Bug fixed and verified! The code now produces the correct result.");
      }
    } else {
      setCurrentLine(result.nextLine);
    }
  }, [currentLine, variables, isDone, puzzle, phase, isFixed, fixedCode, completedPuzzles, answeredQuizzes, rightPanelTab]);

  const stepBackward = useCallback(() => {
    if (stateHistory.length === 0) return;
    const prevState = stateHistory[stateHistory.length - 1];
    setStateHistory(prev => prev.slice(0, -1));
    
    setCurrentLine(prevState.currentLine);
    setVariables(prevState.variables);
    setPrevVariables(prevState.prevVariables);
    setIsDone(prevState.isDone);
    setShowBug(prevState.showBug);
    setSelectedFix(prevState.selectedFix);
    setIsFixed(prevState.isFixed);
    setFixedCode(prevState.fixedCode);
    setStepCount(prevState.stepCount);
    setMessage(prevState.message);
    setExecutionLog(prevState.executionLog);
    setPhase(prevState.phase);
    setAnsweredQuizzes(prevState.answeredQuizzes);
    setRightPanelTab(prevState.rightPanelTab);
  }, [stateHistory]);

  const handleQuizAnswer = (option: string) => {
    const nextLine = currentLine === -1 ? 0 : currentLine;
    const quiz = puzzle.lines[nextLine].quiz!;
    if (option === quiz.answer) {
      setAnsweredQuizzes(prev => new Set(prev).add(nextLine));
      setPhase("stepping");
      setMessage("✅ Correct prediction! You can now resume stepping forward.");
      setWrongAttempts(0);
    } else {
      setWrongAttempts(w => w + 1);
      setMessage("❌ Not quite! Review the current variables and try again.");
    }
  };

  const handleIdentifyBug = () => {
    setShowBug(true);
    setPhase("fix");
    setMessage(`🐛 Line ${puzzle.bugLineIndex + 1} contains the bug! Read the explanation, then choose the correct fix.`);
  };

  const handleApplyFix = (optionIdx: number) => {
    setSelectedFix(optionIdx);
    const option = puzzle.fixOptions[optionIdx];
    if (option.isCorrect) {
      setIsFixed(true);
      setFixedCode(option.replacement);
      setPhase("verify");
      setMessage(`✅ ${option.explanation} Now step through the fixed code to verify.`);
      setCurrentLine(-1);
      setVariables({});
      setPrevVariables({});
      setIsDone(false);
      setStepCount(0);
      setExecutionLog([]);
    } else {
      setWrongAttempts(w => w + 1);
      setMessage(`${option.explanation} Try again!`);
      setSelectedFix(null);
    }
  };

  const nextPuzzle = () => {
    const nextIdx = (puzzleIdx + 1) % puzzles.length;
    selectPuzzle(nextIdx);
  };

  const goHome = () => {
    setPhase("welcome");
  };

  if (phase === "welcome") {
    return <WelcomeScreen onSelectPuzzle={selectPuzzle} completedPuzzles={completedPuzzles} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={goHome} className="gap-1.5 font-mono text-xs">
              <Home className="w-3.5 h-3.5" />
              Menu
            </Button>
            <div className="h-4 w-px bg-border" />
            <Bug className="w-5 h-5 text-primary" />
            <h1 className="text-base font-sans font-bold text-foreground tracking-tight hidden sm:block">
              Bug Hunter
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm font-mono">
            <Glossary />
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
              puzzle.difficulty === "Easy" ? "bg-primary/20 text-primary" :
              puzzle.difficulty === "Medium" ? "bg-accent/20 text-accent" :
              "bg-destructive/20 text-destructive"
            }`}>
              {puzzle.difficulty}
            </span>
            <span className="text-muted-foreground text-xs hidden sm:block">
              {puzzle.category}
            </span>
          </div>
        </div>
      </header>

      {/* Puzzle Info Bar */}
      <div className="border-b border-border px-4 py-3 bg-secondary/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="font-sans font-semibold text-foreground text-sm">{puzzle.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{puzzle.description}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-muted-foreground/60" />
            <span className="text-[10px] text-muted-foreground/60 font-mono">{puzzle.concept}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Code */}
        <div className="flex-1 border-r border-border flex flex-col min-w-0">
          <div className="px-4 py-2 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-accent/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-primary/60" />
              <span className="ml-2 text-[10px] text-muted-foreground font-mono">algorithm.js</span>
            </div>
            <button
              onClick={() => setShowExplanations(!showExplanations)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors font-mono"
            >
              {showExplanations ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {showExplanations ? "Hints on" : "Hints off"}
            </button>
          </div>
          <div className="flex-1 py-3 overflow-auto">
            <CodePanel
              lines={puzzle.lines}
              activeLine={currentLine}
              bugLine={puzzle.bugLineIndex}
              showBug={showBug}
              isFixed={isFixed}
              fixedLineCode={fixedCode}
              showExplanations={showExplanations}
            />
          </div>

          {/* Controls */}
          <div className="border-t border-border p-3 flex items-center gap-2 flex-wrap">
            {(phase === "stepping" || phase === "verify" || phase === "quiz") && (
              <>
                <Button
                  onClick={stepBackward}
                  disabled={stateHistory.length === 0}
                  variant="outline"
                  className="gap-1.5 font-mono text-xs"
                  size="sm"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Step Back
                </Button>
                <Button
                  onClick={stepForward}
                  disabled={isDone || phase === "quiz"}
                  className="gap-1.5 font-mono text-xs"
                  size="sm"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  Step Forward
                </Button>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Step {stepCount} · <kbd className="px-1 py-0.5 rounded bg-secondary text-[9px]">Space</kbd>
                </span>
              </>
            )}
            {phase === "identify" && (
              <Button onClick={handleIdentifyBug} variant="destructive" className="gap-1.5 font-mono text-xs" size="sm">
                <Bug className="w-3.5 h-3.5" />
                Reveal Bug
              </Button>
            )}
            {phase === "complete" && (
              <div className="flex gap-2">
                <Button onClick={nextPuzzle} className="gap-1.5 font-mono text-xs" size="sm">
                  <ChevronRight className="w-3.5 h-3.5" />
                  Next Puzzle
                </Button>
                <Button onClick={goHome} variant="outline" className="gap-1.5 font-mono text-xs" size="sm">
                  <Home className="w-3.5 h-3.5" />
                  All Puzzles
                </Button>
              </div>
            )}
            <Button onClick={resetExecution} variant="ghost" className="gap-1.5 font-mono text-xs ml-auto" size="sm">
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-72 lg:w-80 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setRightPanelTab("memory")}
              className={`flex-1 px-3 py-2 text-[10px] font-mono font-semibold uppercase tracking-wider transition-colors ${
                rightPanelTab === "memory"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ⬡ Memory
            </button>
            <button
              onClick={() => setRightPanelTab("log")}
              className={`flex-1 px-3 py-2 text-[10px] font-mono font-semibold uppercase tracking-wider transition-colors ${
                rightPanelTab === "log"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              📋 Trace Log
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-3 overflow-auto">
            {rightPanelTab === "memory" ? (
              <MemoryWatch variables={variables} previousVariables={prevVariables} />
            ) : (
              <ExecutionLog entries={executionLog} />
            )}
          </div>

          {/* Condition Evaluator */}
          {(executionLog.length > 0 && executionLog[executionLog.length - 1].conditionEval && phase !== "quiz") && (
            <div className="border-t border-border px-3 py-2">
              <div className="text-[10px] text-muted-foreground font-mono uppercase mb-1">Condition</div>
              <div className={`font-mono text-sm font-semibold ${
                executionLog[executionLog.length - 1].conditionEval?.includes("true")
                  ? "text-primary"
                  : "text-destructive"
              }`}>
                {executionLog[executionLog.length - 1].conditionEval}
              </div>
            </div>
          )}

          {/* Quiz Options */}
          {phase === "quiz" && (
            <div className="border-t border-border p-3 space-y-2 flex-grow bg-primary/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-primary font-mono font-bold uppercase tracking-wide">🧠 Concept Check</span>
                {wrongAttempts > 0 && (
                  <span className="text-[10px] text-destructive font-mono">
                    {wrongAttempts} wrong {wrongAttempts === 1 ? "try" : "tries"}
                  </span>
                )}
              </div>
              <p className="text-sm font-sans mb-4 leading-relaxed font-semibold text-foreground/90">
                {puzzle.lines[currentLine === -1 ? 0 : currentLine].quiz?.prompt}
              </p>
              <div className="space-y-2">
                {puzzle.lines[currentLine === -1 ? 0 : currentLine].quiz?.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuizAnswer(opt)}
                    className="w-full text-left px-4 py-2.5 rounded-md border border-border bg-card text-xs font-mono text-foreground hover:border-primary hover:bg-primary/10 transition-all active:scale-[0.99] shadow-sm"
                  >
                    <code>{opt}</code>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fix Options */}
          {phase === "fix" && (
            <div className="border-t border-border p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-accent font-mono font-semibold uppercase">Choose Fix</span>
                {wrongAttempts > 0 && (
                  <span className="text-[10px] text-destructive font-mono">
                    {wrongAttempts} wrong {wrongAttempts === 1 ? "try" : "tries"}
                  </span>
                )}
              </div>
              {puzzle.fixOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyFix(idx)}
                  className="w-full text-left px-3 py-2 rounded border border-border bg-secondary/30 text-xs font-mono text-foreground hover:border-primary hover:bg-primary/5 transition-all active:scale-[0.99]"
                >
                  <code>{opt.label}</code>
                </button>
              ))}
            </div>
          )}

          {/* Lesson Card */}
          {phase === "complete" && (
            <div className="border-t border-border p-3">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <div className="text-[10px] font-mono font-semibold text-primary uppercase mb-1.5">
                  📚 What You Learned
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  {puzzle.lesson}
                </p>
              </div>
            </div>
          )}

          {/* Message & Hint */}
          <div className="border-t border-border p-3">
            {message && (
              <p className={`text-xs font-sans mb-2 leading-relaxed ${
                phase === "complete" ? "text-primary" : "text-foreground"
              }`}>
                {message}
              </p>
            )}
            {(phase === "stepping") && !isDone && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-accent transition-colors font-mono"
              >
                <Lightbulb className="w-3 h-3" />
                {showHint ? puzzle.hint : "Need a hint?"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebuggerGame;
