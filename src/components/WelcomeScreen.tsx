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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
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

      {/* Categories Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 w-full space-y-12">
        {[
          {
            title: "1. Beginner Basics",
            description: "Start your journey with fundamental concepts",
            categories: ["Initialization", "Loop Errors", "Boolean Logic"] as PuzzleCategory[],
          },
          {
            title: "2. Intermediate Concepts",
            description: "Build your logic testing and data manipulation skills",
            categories: ["Comparison Bugs", "String Manipulation", "Accumulator Patterns"] as PuzzleCategory[],
          },
          {
            title: "3. Advanced Algorithms",
            description: "Master complex data structures and boundary testing",
            categories: ["Array Logic", "Boundary Conditions", "Nested Loops"] as PuzzleCategory[],
          }
        ].map(track => (
          <div key={track.title} className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-sans font-bold text-foreground tracking-tight">{track.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{track.description}</p>
            </div>
            
            <div className="space-y-8">
              {track.categories.map(category => {
                const categoryPuzzles = puzzles.map((p, i) => ({ puzzle: p, idx: i })).filter(x => x.puzzle.category === category);
                if (categoryPuzzles.length === 0) return null; // safety check
                
                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-3 border-b border-border/50 pb-2">
                      <span className="text-xl">{categoryIcons[category]}</span>
                      <h3 className="font-sans font-semibold text-foreground text-lg">{category}</h3>
                      <span className="text-xs text-muted-foreground ml-2 hidden sm:block">
                        {categoryDescriptions[category]}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {categoryPuzzles.map(({ puzzle, idx }) => {
                        const isCompleted = completedPuzzles.has(puzzle.id);
                        return (
                          <button
                            key={puzzle.id}
                            onClick={() => onSelectPuzzle(idx)}
                            className={`text-left rounded-lg border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                              isCompleted
                                ? "border-primary/40 bg-primary/10 hover:border-primary/60"
                                : "border-border/60 bg-card hover:border-primary/40 hover:bg-card/80"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`font-sans font-semibold text-sm ${isCompleted ? 'text-primary' : 'text-foreground'}`}>
                                {isCompleted && "✨ "}{puzzle.title}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono font-bold ${
                                puzzle.difficulty === "Easy" ? "bg-primary/20 text-primary" :
                                puzzle.difficulty === "Medium" ? "bg-accent/20 text-accent" :
                                "bg-destructive/20 text-destructive"
                              }`}>
                                {puzzle.difficulty}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{puzzle.description}</p>
                            <div className="mt-3 flex items-center gap-1.5 opacity-80">
                              <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-xs font-mono text-muted-foreground">{puzzle.concept}</span>
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
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;
