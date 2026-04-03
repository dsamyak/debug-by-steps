import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimulationProps {
  level: number;
}

// ─── Level 1: Variables & Initialization ───
function VariablesSim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const maxSteps = 5;

  useEffect(() => {
    if (!playing) return;
    if (step >= maxSteps) { setPlaying(false); return; }
    const t = setTimeout(() => setStep(s => s + 1), 1200);
    return () => clearTimeout(t);
  }, [playing, step]);

  const boxes: { name: string; value: string; highlight: boolean; wrong?: boolean }[] = [];
  
  if (step >= 1) boxes.push({ name: "count", value: step >= 2 ? "0" : "1", highlight: step === 1 || step === 2, wrong: step === 1 });
  if (step >= 3) boxes.push({ name: "sum", value: "0", highlight: step === 3 });
  if (step >= 4) boxes.push({ name: "product", value: step >= 5 ? "1" : "0", highlight: step === 4 || step === 5, wrong: step === 4 });

  const messages = [
    "Let's see how variables store values...",
    "❌ let count = 1 → Starts at 1, but we haven't counted anything yet!",
    "✅ let count = 0 → Correct! We start from zero.",
    "✅ let sum = 0 → For addition, start at 0.",
    "❌ let product = 0 → Anything × 0 = 0 forever!",
    "✅ let product = 1 → For multiplication, start at 1 (identity element)."
  ];

  return (
    <div className="space-y-6">
      <p className="text-base text-muted-foreground text-center">{messages[step]}</p>
      
      {/* Variable Boxes */}
      <div className="flex justify-center gap-6 min-h-[120px] items-end">
        <AnimatePresence>
          {boxes.map((box) => (
            <motion.div
              key={box.name + box.value}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`flex flex-col items-center`}
            >
              <div className={`w-24 h-24 rounded-xl border-3 flex items-center justify-center text-3xl font-bold font-mono transition-all ${
                box.wrong
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : box.highlight
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground"
              }`}>
                {box.value}
              </div>
              <span className={`mt-2 text-sm font-mono font-bold ${
                box.wrong ? "text-destructive" : "text-foreground"
              }`}>{box.name}</span>
              {box.wrong && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-destructive mt-1">
                  ✗ Wrong!
                </motion.span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <SimControls step={step} maxSteps={maxSteps} playing={playing} setPlaying={setPlaying} setStep={setStep} />
    </div>
  );
}

// ─── Level 2: Loops ───
function LoopsSim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const arr = [10, 20, 30, 40, 50];
  const maxSteps = 7;

  useEffect(() => {
    if (!playing) return;
    if (step >= maxSteps) { setPlaying(false); return; }
    const t = setTimeout(() => setStep(s => s + 1), 1000);
    return () => clearTimeout(t);
  }, [playing, step]);

  // step 0: show array
  // steps 1-4: visit elements 0-3 (buggy: i < length-1)
  // step 5: loop ends, show missed element
  // step 6: show correct fix
  // step 7: all visited

  const buggyVisited = Math.min(step, 4); // visits 0,1,2,3 only
  const showMissed = step >= 5;
  const showFix = step >= 6;
  const sum = arr.slice(0, buggyVisited).reduce((a, b) => a + b, 0);

  const messages = [
    "Here's an array with 5 numbers. Let's loop through them...",
    `i=0: Adding arr[0] = 10. Sum = 10`,
    `i=1: Adding arr[1] = 20. Sum = 30`,
    `i=2: Adding arr[2] = 30. Sum = 60`,
    `i=3: Adding arr[3] = 40. Sum = 100`,
    `❌ Loop stopped! i < arr.length-1 means i < 4, so arr[4]=50 was SKIPPED!`,
    `✅ Fix: Use i < arr.length → i goes 0,1,2,3,4 — all 5 elements!`,
    `✅ Now sum = 150. All elements visited!`
  ];

  return (
    <div className="space-y-6">
      <p className="text-base text-muted-foreground text-center">{messages[step]}</p>

      {/* Array visualization */}
      <div className="flex justify-center gap-2">
        {arr.map((val, i) => {
          const visited = showFix ? true : i < buggyVisited;
          const missed = showMissed && i === 4 && !showFix;
          const active = !showMissed && !showFix && i === buggyVisited - 1 && step > 0;
          return (
            <motion.div
              key={i}
              animate={{
                scale: active ? 1.15 : 1,
                y: active ? -8 : 0
              }}
              className={`relative w-16 h-20 rounded-lg border-2 flex flex-col items-center justify-center transition-colors ${
                missed
                  ? "border-destructive bg-destructive/15 text-destructive"
                  : visited
                  ? "border-primary bg-primary/15 text-primary"
                  : active
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              <span className="text-2xl font-bold font-mono">{val}</span>
              <span className="text-[10px] font-mono mt-1 opacity-60">[{i}]</span>
              {missed && (
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-3 -right-2 text-lg">❌</motion.div>
              )}
              {showFix && i === 4 && (
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-3 -right-2 text-lg">✅</motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Sum display */}
      <div className="text-center">
        <span className="text-sm font-mono text-muted-foreground">sum = </span>
        <motion.span 
          key={sum}
          initial={{ scale: 1.3, color: "hsl(var(--primary))" }}
          animate={{ scale: 1, color: "hsl(var(--foreground))" }}
          className="text-2xl font-bold font-mono"
        >
          {showFix ? 150 : sum}
        </motion.span>
      </div>

      <SimControls step={step} maxSteps={maxSteps} playing={playing} setPlaying={setPlaying} setStep={setStep} />
    </div>
  );
}

// ─── Level 3: Decisions ───
function DecisionsSim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const maxSteps = 5;

  useEffect(() => {
    if (!playing) return;
    if (step >= maxSteps) { setPlaying(false); return; }
    const t = setTimeout(() => setStep(s => s + 1), 1400);
    return () => clearTimeout(t);
  }, [playing, step]);

  const messages = [
    "Let's see how comparison operators work...",
    "Finding the MAX: compare each number to our current max.",
    "❌ if (nums[i] < max) → This updates when smaller, finding the MINIMUM!",
    "✅ if (nums[i] > max) → This updates when bigger, finding the MAXIMUM!",
    "Boolean logic: && means BOTH true, || means EITHER true.",
    "❌ (isVip && isBirthday) blocks birthday-only customers. ✅ Use || instead!"
  ];

  return (
    <div className="space-y-6">
      <p className="text-base text-muted-foreground text-center">{messages[step]}</p>

      {/* Comparison visualization */}
      <div className="flex justify-center items-center gap-4 min-h-[140px]">
        {step >= 1 && step <= 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl border-2 border-primary bg-primary/10 flex items-center justify-center text-2xl font-bold font-mono text-primary">7</div>
              <span className="text-xs font-mono mt-1 text-muted-foreground">nums[i]</span>
            </div>
            <div className={`text-3xl font-bold font-mono ${step === 2 ? "text-destructive" : step === 3 ? "text-primary" : "text-foreground"}`}>
              {step === 2 ? "<" : step === 3 ? ">" : "?"}
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl border-2 border-accent bg-accent/10 flex items-center justify-center text-2xl font-bold font-mono text-accent">3</div>
              <span className="text-xs font-mono mt-1 text-muted-foreground">max</span>
            </div>
            <div className="ml-4 text-lg font-mono">
              →{" "}
              <span className={step === 2 ? "text-destructive font-bold" : step === 3 ? "text-primary font-bold" : "text-foreground"}>
                {step === 2 ? "false ✗" : step === 3 ? "true ✓" : "?"}
              </span>
            </div>
          </motion.div>
        )}

        {step >= 4 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center gap-3 justify-center">
              <div className={`px-4 py-2 rounded-lg border-2 text-base font-mono ${step >= 5 ? "border-destructive/50 bg-destructive/5" : "border-border"}`}>
                <span className="text-destructive font-bold">false</span> && <span className="text-primary font-bold">true</span> = <span className="text-destructive font-bold">false</span>
              </div>
              {step >= 5 && <span className="text-destructive text-lg">❌ AND blocks</span>}
            </div>
            <div className="flex items-center gap-3 justify-center">
              <div className={`px-4 py-2 rounded-lg border-2 text-base font-mono ${step >= 5 ? "border-primary/50 bg-primary/5" : "border-border"}`}>
                <span className="text-destructive font-bold">false</span> || <span className="text-primary font-bold">true</span> = <span className="text-primary font-bold">true</span>
              </div>
              {step >= 5 && <span className="text-primary text-lg">✅ OR passes</span>}
            </div>
          </motion.div>
        )}
      </div>

      <SimControls step={step} maxSteps={maxSteps} playing={playing} setPlaying={setPlaying} setStep={setStep} />
    </div>
  );
}

// ─── Level 4: Data & Strings ───
function DataSim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const maxSteps = 6;

  useEffect(() => {
    if (!playing) return;
    if (step >= maxSteps) { setPlaying(false); return; }
    const t = setTimeout(() => setStep(s => s + 1), 1200);
    return () => clearTimeout(t);
  }, [playing, step]);

  const grades = [80, 90, 70];
  const sums = [0, 80, 170, 240];
  const currentSum = step <= 3 ? sums[step] : 240;

  const messages = [
    "The accumulator pattern: build a result step by step.",
    "sum = 0 + 80 → sum = 80",
    "sum = 80 + 90 → sum = 170",
    "sum = 170 + 70 → sum = 240",
    "❌ avg = sum * 3 = 720. Multiply?! That's wrong!",
    "✅ avg = sum / 3 = 80. Divide the total by count!",
    "The fence post problem: 4 items need only 3 dashes: 1-2-3-4"
  ];

  return (
    <div className="space-y-6">
      <p className="text-base text-muted-foreground text-center">{messages[step]}</p>

      <div className="flex justify-center items-center gap-3 min-h-[100px]">
        {/* Grades array */}
        {step <= 3 && grades.map((g, i) => (
          <motion.div
            key={i}
            animate={{ scale: step === i + 1 ? 1.2 : 1, y: step === i + 1 ? -10 : 0 }}
            className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center text-xl font-bold font-mono ${
              i < step ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground"
            }`}
          >
            {g}
          </motion.div>
        ))}

        {/* Average calculation */}
        {step >= 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-2">
            <code className={`text-lg font-mono ${step === 4 ? "text-destructive" : "text-primary"}`}>
              {step === 4 ? "240 × 3 = 720 ❌" : "240 ÷ 3 = 80 ✅"}
            </code>
          </motion.div>
        )}

        {step >= 6 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1 text-xl font-mono">
            <span className="text-primary">1</span>
            <span className="text-accent">-</span>
            <span className="text-primary">2</span>
            <span className="text-accent">-</span>
            <span className="text-primary">3</span>
            <span className="text-accent">-</span>
            <span className="text-primary">4</span>
            <span className="text-destructive line-through ml-1">-</span>
          </motion.div>
        )}
      </div>

      {step <= 3 && (
        <div className="text-center">
          <span className="text-sm font-mono text-muted-foreground">sum = </span>
          <motion.span key={currentSum} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="text-2xl font-bold font-mono text-foreground">
            {currentSum}
          </motion.span>
        </div>
      )}

      <SimControls step={step} maxSteps={maxSteps} playing={playing} setPlaying={setPlaying} setStep={setStep} />
    </div>
  );
}

// ─── Level 5: Arrays & Nesting ───
function ArraysSim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const maxSteps = 6;

  useEffect(() => {
    if (!playing) return;
    if (step >= maxSteps) { setPlaying(false); return; }
    const t = setTimeout(() => setStep(s => s + 1), 1200);
    return () => clearTimeout(t);
  }, [playing, step]);

  const src = [1, 2, 3, 4];

  const messages = [
    "Arrays use indices starting from 0. The last index is length - 1.",
    "Reversing: dest[0] = src[4-1-0] = src[3] = 4",
    "dest[1] = src[4-1-1] = src[2] = 3",
    "dest[2] = src[4-1-2] = src[1] = 2",
    "dest[3] = src[4-1-3] = src[0] = 1",
    "❌ src[length - i] when i=0 → src[4] doesn't exist! Off by one!",
    "✅ Use src[length - 1 - i] to stay in bounds. Result: [4, 3, 2, 1]"
  ];

  const reversed = step >= 6 ? [4, 3, 2, 1] : [
    step >= 1 ? 4 : "?",
    step >= 2 ? 3 : "?",
    step >= 3 ? 2 : "?",
    step >= 4 ? 1 : "?"
  ];

  return (
    <div className="space-y-6">
      <p className="text-base text-muted-foreground text-center">{messages[step]}</p>

      <div className="flex flex-col items-center gap-4">
        {/* Source array */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-muted-foreground mr-2 w-12 text-right">src:</span>
          {src.map((v, i) => {
            const active = step >= 1 && step <= 4 && (4 - step) === i;
            return (
              <motion.div key={i}
                animate={{ scale: active ? 1.15 : 1, y: active ? -5 : 0 }}
                className={`w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center font-mono ${
                  active ? "border-accent bg-accent/15 text-accent" : "border-border bg-card text-foreground"
                }`}
              >
                <span className="text-xl font-bold">{v}</span>
                <span className="text-[9px] opacity-50">[{i}]</span>
              </motion.div>
            );
          })}
        </div>

        {/* Arrow */}
        <div className="text-2xl text-muted-foreground">↓</div>

        {/* Dest array */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-muted-foreground mr-2 w-12 text-right">dest:</span>
          {reversed.map((v, i) => {
            const justFilled = step >= 1 && step <= 4 && (step - 1) === i;
            return (
              <motion.div key={i}
                animate={{ scale: justFilled ? 1.15 : 1 }}
                className={`w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center font-mono ${
                  justFilled ? "border-primary bg-primary/15 text-primary" :
                  v !== "?" ? "border-primary/50 bg-primary/5 text-primary" :
                  "border-border/50 bg-card text-muted-foreground/40"
                }`}
              >
                <span className="text-xl font-bold">{v}</span>
                <span className="text-[9px] opacity-50">[{i}]</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <SimControls step={step} maxSteps={maxSteps} playing={playing} setPlaying={setPlaying} setStep={setStep} />
    </div>
  );
}

// ─── Simulation Controls ───
function SimControls({ step, maxSteps, playing, setPlaying, setStep }: {
  step: number; maxSteps: number; playing: boolean;
  setPlaying: (v: boolean) => void; setStep: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        size="sm"
        variant="outline"
        onClick={() => { setStep(0); setPlaying(false); }}
        className="gap-1.5 font-mono text-sm"
      >
        <RotateCcw className="w-4 h-4" /> Restart
      </Button>
      <Button
        size="sm"
        onClick={() => setPlaying(!playing)}
        disabled={step >= maxSteps && !playing}
        className="gap-1.5 font-mono text-sm"
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        {playing ? "Pause" : step >= maxSteps ? "Done" : "Play"}
      </Button>
      {/* Progress dots */}
      <div className="flex gap-1 ml-2">
        {Array.from({ length: maxSteps + 1 }).map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
        ))}
      </div>
    </div>
  );
}

// ─── Main Export ───
export default function ConceptSimulation({ level }: SimulationProps) {
  switch (level) {
    case 1: return <VariablesSim />;
    case 2: return <LoopsSim />;
    case 3: return <DecisionsSim />;
    case 4: return <DataSim />;
    case 5: return <ArraysSim />;
    default: return null;
  }
}
