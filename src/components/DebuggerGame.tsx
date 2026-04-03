import { useState, useCallback, useEffect } from "react";
import { puzzles, levels, executeLine } from "@/lib/puzzles";
import CodePanel from "./CodePanel";
import WelcomeScreen from "./WelcomeScreen";
import ConceptSimulation from "./ConceptSimulation";
import { Glossary } from "./Glossary";
import { Button } from "@/components/ui/button";
import { Bug, Lightbulb, ChevronRight, Home, BookOpen, Eye, EyeOff } from "lucide-react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

type GamePhase = "welcome" | "concept" | "read" | "identify" | "fix" | "complete";

const STORAGE_KEY = "bughunter-completed";
const SEEN_CONCEPTS_KEY = "bughunter-seen-concepts";

function loadCompleted(): Set<string> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch { return new Set(); }
}

function saveCompleted(set: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

function loadSeenConcepts(): Set<number> {
  try {
    const saved = localStorage.getItem(SEEN_CONCEPTS_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch { return new Set(); }
}

function saveSeenConcepts(set: Set<number>) {
  localStorage.setItem(SEEN_CONCEPTS_KEY, JSON.stringify([...set]));
}

// Simple executor to compute the actual buggy output
function computeOutput(puzzle: typeof puzzles[0], fixed: boolean, fixedCode?: string): string {
  let vars: Record<string, any> = {};
  let line = 0;
  let iterations = 0;
  const maxIter = 200;
  
  while (line < puzzle.lines.length && iterations < maxIter) {
    iterations++;
    const result = executeLine(puzzle, line, vars, fixed, fixedCode);
    vars = result.vars;
    if (result.done) break;
    line = result.nextLine;
  }
  
  // Return the most relevant variable as output
  const keys = Object.keys(vars).filter(k => k !== "i" && k !== "x" && k !== "y" && k !== "temp");
  if (keys.length === 0) return "No output";
  const lastKey = keys[keys.length - 1];
  const val = vars[lastKey];
  return `${lastKey} = ${Array.isArray(val) ? `[${val.join(", ")}]` : val}`;
}

const DebuggerGame = () => {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("welcome");
  const [showBug, setShowBug] = useState(false);
  const [selectedFix, setSelectedFix] = useState<number | null>(null);
  const [isFixed, setIsFixed] = useState(false);
  const [fixedCode, setFixedCode] = useState<string | undefined>();
  const [showHint, setShowHint] = useState(false);
  const [message, setMessage] = useState("");
  const [completedPuzzles, setCompletedPuzzles] = useState<Set<string>>(loadCompleted);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [seenConcepts, setSeenConcepts] = useState<Set<number>>(loadSeenConcepts);
  const [showExplanations, setShowExplanations] = useState(true);

  const puzzle = puzzles[puzzleIdx];
  const currentLevel = levels.find(l => l.level === puzzle.level)!;

  const selectPuzzle = useCallback((idx: number) => {
    const targetPuzzle = puzzles[idx];
    const level = targetPuzzle.level;
    const hasSeenConcept = seenConcepts.has(level);

    setPuzzleIdx(idx);
    setShowBug(false);
    setSelectedFix(null);
    setIsFixed(false);
    setFixedCode(undefined);
    setShowHint(false);
    setMessage("");
    setWrongAttempts(0);
    setPhase(hasSeenConcept ? "read" : "concept");
  }, [seenConcepts]);

  const handleConceptDone = () => {
    const newSeen = new Set(seenConcepts);
    newSeen.add(puzzle.level);
    setSeenConcepts(newSeen);
    saveSeenConcepts(newSeen);
    setPhase("read");
  };

  const handleReadDone = () => {
    setPhase("identify");
    setMessage("Now find the bug! Click 'Reveal Bug' to see which line is wrong.");
  };

  const handleIdentifyBug = () => {
    setShowBug(true);
    setPhase("fix");
    setMessage(`🐛 Line ${puzzle.bugLineIndex + 1} has the bug! Choose the correct fix below.`);
  };

  const handleApplyFix = (optionIdx: number) => {
    setSelectedFix(optionIdx);
    const option = puzzle.fixOptions[optionIdx];
    if (option.isCorrect) {
      setIsFixed(true);
      setFixedCode(option.replacement);
      setPhase("complete");
      const newCompleted = new Set<string>(completedPuzzles);
      newCompleted.add(puzzle.id);
      setCompletedPuzzles(newCompleted);
      saveCompleted(newCompleted);
      setMessage(`✅ ${option.explanation}`);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#10b981", "#3b82f6", "#f59e0b"]
      });
    } else {
      setWrongAttempts(w => w + 1);
      setMessage(`❌ ${option.explanation} Try again!`);
      setSelectedFix(null);
    }
  };

  const nextPuzzle = () => {
    const sameLevelPuzzles = puzzles
      .map((p, i) => ({ puzzle: p, idx: i }))
      .filter(x => x.puzzle.level === puzzle.level && x.puzzle.levelOrder > puzzle.levelOrder)
      .sort((a, b) => a.puzzle.levelOrder - b.puzzle.levelOrder);
    
    if (sameLevelPuzzles.length > 0) {
      selectPuzzle(sameLevelPuzzles[0].idx);
    } else {
      const nextLevelPuzzles = puzzles
        .map((p, i) => ({ puzzle: p, idx: i }))
        .filter(x => x.puzzle.level === puzzle.level + 1)
        .sort((a, b) => a.puzzle.levelOrder - b.puzzle.levelOrder);
      
      if (nextLevelPuzzles.length > 0) {
        selectPuzzle(nextLevelPuzzles[0].idx);
      } else {
        setPhase("welcome");
      }
    }
  };

  const goHome = () => setPhase("welcome");

  // ── Welcome Screen ──
  if (phase === "welcome") {
    return <WelcomeScreen onSelectPuzzle={selectPuzzle} completedPuzzles={completedPuzzles} />;
  }

  // ── Concept Lesson + Simulation ──
  if (phase === "concept") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          {/* Level Header */}
          <div className="text-center mb-8">
            <span className="text-5xl mb-4 block">{currentLevel.icon}</span>
            <span className="text-sm font-mono font-bold text-primary uppercase tracking-widest">
              Level {currentLevel.level}
            </span>
            <h2 className="text-3xl font-sans font-bold text-foreground mt-2">
              {currentLevel.name}
            </h2>
            <p className="text-lg text-muted-foreground mt-2">{currentLevel.tagline}</p>
          </div>

          {/* Concept Explanation */}
          <div className="rounded-xl border border-accent/30 bg-card p-6 shadow-lg mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-accent" />
              <h3 className="font-sans font-bold text-lg text-foreground">
                {currentLevel.conceptIntro.title}
              </h3>
            </div>
            {currentLevel.conceptIntro.paragraphs.map((p: string, i: number) => (
              <p key={i} className="text-base text-foreground/80 leading-relaxed mb-3 last:mb-0">
                {p}
              </p>
            ))}
            <div className="mt-4 rounded-lg bg-accent/5 border border-accent/20 p-4 space-y-2">
              <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider">
                Key Points
              </span>
              {currentLevel.conceptIntro.keyPoints.map((kp: string, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-accent text-base mt-0.5">✦</span>
                  <span className="text-sm text-foreground/70 font-mono leading-relaxed">{kp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Simulation */}
          <div className="rounded-xl border border-primary/30 bg-card p-6 shadow-lg mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🎬</span>
              <h3 className="font-sans font-bold text-lg text-foreground">
                Watch It In Action
              </h3>
            </div>
            <ConceptSimulation level={currentLevel.level} />
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <Button onClick={handleConceptDone} size="lg" className="gap-2 font-mono text-base px-8 py-6">
              I understand — let's debug!
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Compute outputs for display ──
  const buggyOutput = computeOutput(puzzle, false);
  const expectedComment = puzzle.lines.find(l => l.code.trim().startsWith("//"));
  const expectedOutput = expectedComment ? expectedComment.code.trim().replace("// ", "") : "";

  // ── Main Debug View ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={goHome} className="gap-1.5 font-mono text-sm">
              <Home className="w-4 h-4" />
              Menu
            </Button>
            <div className="h-5 w-px bg-border" />
            <Bug className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-sans font-bold text-foreground tracking-tight hidden sm:block">
              Bug Hunter
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Glossary />
            <span className="text-xs font-mono font-semibold text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded">
              Lvl {puzzle.level}.{puzzle.levelOrder}
            </span>
            <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
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
      <div className="border-b border-border px-5 py-4 bg-secondary/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-sans font-bold text-foreground text-lg">{puzzle.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{puzzle.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <BookOpen className="w-4 h-4 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground/60 font-mono">{puzzle.concept}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 max-w-5xl mx-auto w-full">
        {/* Code Panel */}
        <div className="flex-1 border-r border-border flex flex-col min-w-0">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-accent/60" />
              <div className="w-3 h-3 rounded-full bg-primary/60" />
              <span className="ml-2 text-xs text-muted-foreground font-mono">algorithm.js</span>
            </div>
            <button
              onClick={() => setShowExplanations(!showExplanations)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
            >
              {showExplanations ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showExplanations ? "Hints on" : "Hints off"}
            </button>
          </div>
          <div className="flex-1 py-4 overflow-auto">
            <CodePanel
              lines={puzzle.lines}
              activeLine={-1}
              bugLine={puzzle.bugLineIndex}
              showBug={showBug}
              isFixed={isFixed}
              fixedLineCode={fixedCode}
              showExplanations={showExplanations}
            />
          </div>

          {/* Output comparison */}
          {phase !== "read" && (
            <div className="border-t border-border px-5 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-card p-3">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">Expected</span>
                  <p className="text-base font-mono font-semibold text-primary mt-1">{expectedOutput}</p>
                </div>
                <div className={`rounded-lg border p-3 ${
                  isFixed ? "border-primary/40 bg-primary/5" : "border-destructive/40 bg-destructive/5"
                }`}>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                    {isFixed ? "Fixed Output" : "Buggy Output"}
                  </span>
                  <p className={`text-base font-mono font-semibold mt-1 ${isFixed ? "text-primary" : "text-destructive"}`}>
                    {isFixed ? computeOutput(puzzle, true, fixedCode) : buggyOutput}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t border-border p-4 flex items-center gap-3 flex-wrap">
            {phase === "read" && (
              <Button onClick={handleReadDone} size="lg" className="gap-2 font-mono text-sm">
                <Bug className="w-4 h-4" />
                I've read the code — Find the Bug!
              </Button>
            )}
            {phase === "identify" && (
              <Button onClick={handleIdentifyBug} variant="destructive" size="lg" className="gap-2 font-mono text-sm">
                <Bug className="w-4 h-4" />
                Reveal Bug
              </Button>
            )}
            {phase === "complete" && (
              <div className="flex gap-3">
                <Button onClick={nextPuzzle} size="lg" className="gap-2 font-mono text-sm">
                  <ChevronRight className="w-4 h-4" />
                  Next Puzzle
                </Button>
                <Button onClick={goHome} variant="outline" size="lg" className="gap-2 font-mono text-sm">
                  <Home className="w-4 h-4" />
                  All Puzzles
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 lg:w-96 flex flex-col">
          {/* Phase indicator */}
          <div className="px-5 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              {["read", "identify", "fix", "complete"].map((p, i) => (
                <div key={p} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                    phase === p
                      ? "bg-primary text-primary-foreground"
                      : ["read", "identify", "fix", "complete"].indexOf(phase) > i
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    {i + 1}
                  </div>
                  {i < 3 && <div className={`w-6 h-0.5 ${
                    ["read", "identify", "fix", "complete"].indexOf(phase) > i ? "bg-primary/40" : "bg-border"
                  }`} />}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              <span>Read</span>
              <span>Find</span>
              <span>Fix</span>
              <span>Done</span>
            </div>
          </div>

          {/* Right panel content */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {/* Phase-specific guidance */}
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-lg border border-border bg-card p-4"
              >
                {phase === "read" && (
                  <>
                    <h4 className="font-sans font-bold text-base text-foreground mb-2">📖 Step 1: Read the Code</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Read through the code carefully. Each line has a hint explaining what it does. 
                      Think about what the code <strong>should</strong> produce vs what it <strong>actually</strong> does.
                    </p>
                  </>
                )}
                {phase === "identify" && (
                  <>
                    <h4 className="font-sans font-bold text-base text-foreground mb-2">🔍 Step 2: Find the Bug</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Something is wrong with this code. Look at the expected vs actual output below the code.
                      When you're ready, click "Reveal Bug" to see which line is faulty.
                    </p>
                  </>
                )}
                {phase === "fix" && (
                  <>
                    <h4 className="font-sans font-bold text-base text-foreground mb-2">🔧 Step 3: Fix the Bug</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      The buggy line is highlighted in red. Choose the correct fix from the options below.
                    </p>
                    {/* Fix Options */}
                    <div className="space-y-2">
                      {puzzle.fixOptions.map((opt, idx) => (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          key={idx}
                          onClick={() => handleApplyFix(idx)}
                          className="w-full text-left px-4 py-3 rounded-lg border border-border bg-secondary/30 text-sm font-mono text-foreground hover:border-primary hover:bg-primary/5 transition-all"
                        >
                          <code>{opt.label}</code>
                        </motion.button>
                      ))}
                    </div>
                    {wrongAttempts > 0 && (
                      <p className="text-xs text-destructive font-mono mt-2">
                        {wrongAttempts} wrong {wrongAttempts === 1 ? "try" : "tries"}
                      </p>
                    )}
                  </>
                )}
                {phase === "complete" && (
                  <>
                    <h4 className="font-sans font-bold text-base text-primary mb-2">🎉 Bug Fixed!</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      The code now produces the correct result.
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Lesson Card */}
            {phase === "complete" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-primary/20 bg-primary/5 p-4"
              >
                <div className="text-xs font-mono font-semibold text-primary uppercase mb-2">
                  📚 What You Learned
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {puzzle.lesson}
                </p>
              </motion.div>
            )}

            {/* Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`rounded-lg p-3 text-sm font-sans leading-relaxed ${
                  phase === "complete"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : message.startsWith("❌")
                    ? "bg-destructive/10 text-destructive border border-destructive/20"
                    : "bg-secondary text-foreground border border-border"
                }`}
              >
                {message}
              </motion.div>
            )}

            {/* Hint */}
            {(phase === "read" || phase === "identify") && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors font-mono"
              >
                <Lightbulb className="w-4 h-4" />
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
