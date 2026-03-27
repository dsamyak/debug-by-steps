import { puzzles, PuzzleCategory, categoryDescriptions, categoryIcons } from "@/lib/puzzles";
import { Bug, BookOpen, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onSelectPuzzle: (idx: number) => void;
  completedPuzzles: Set<string>;
}

const WelcomeScreen = ({ onSelectPuzzle, completedPuzzles }: WelcomeScreenProps) => {
  const categories = Array.from(new Set(puzzles.map(p => p.category))) as PuzzleCategory[];
  const totalCompleted = completedPuzzles.size;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bug className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-sans font-bold text-foreground tracking-tight">
              Bug Hunter
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Learn to debug algorithms by stepping through code line-by-line. 
            Watch variables change in real-time, spot the bug, and fix it.
          </p>
          
          {/* Progress */}
          <div className="mt-6 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-sm font-mono">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground">
                {totalCompleted}/{puzzles.length} solved
              </span>
            </div>
            <div className="h-2 w-48 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(totalCompleted / puzzles.length) * 100}%` }}
              />
            </div>
          </div>

          {/* How it works */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
            {[
              { icon: "1️⃣", title: "Read", desc: "Understand what the code should do" },
              { icon: "2️⃣", title: "Step", desc: "Execute one line at a time" },
              { icon: "3️⃣", title: "Spot", desc: "Watch variables for wrong values" },
              { icon: "4️⃣", title: "Fix", desc: "Choose the correct fix and verify" },
            ].map(step => (
              <div key={step.title} className="rounded-lg border border-border bg-card p-4">
                <div className="text-lg mb-1">{step.icon}</div>
                <div className="font-sans font-semibold text-foreground text-sm">{step.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-4xl mx-auto px-6 py-8 w-full">
        {categories.map(category => {
          const categoryPuzzles = puzzles.map((p, i) => ({ puzzle: p, idx: i })).filter(x => x.puzzle.category === category);
          return (
            <div key={category} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{categoryIcons[category]}</span>
                <h2 className="font-sans font-semibold text-foreground">{category}</h2>
                <span className="text-xs text-muted-foreground ml-2">
                  {categoryDescriptions[category]}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categoryPuzzles.map(({ puzzle, idx }) => {
                  const isCompleted = completedPuzzles.has(puzzle.id);
                  return (
                    <button
                      key={puzzle.id}
                      onClick={() => onSelectPuzzle(idx)}
                      className={`text-left rounded-lg border p-4 transition-all hover:scale-[1.01] ${
                        isCompleted
                          ? "border-primary/30 bg-primary/5 hover:border-primary/50"
                          : "border-border bg-card hover:border-primary/30 hover:bg-card/80"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-sans font-semibold text-foreground text-sm">
                          {isCompleted && "✅ "}{puzzle.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          puzzle.difficulty === "Easy" ? "bg-primary/20 text-primary" :
                          puzzle.difficulty === "Medium" ? "bg-accent/20 text-accent" :
                          "bg-destructive/20 text-destructive"
                        }`}>
                          {puzzle.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{puzzle.description}</p>
                      <div className="mt-2 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-muted-foreground/60" />
                        <span className="text-[10px] text-muted-foreground/60">{puzzle.concept}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WelcomeScreen;
