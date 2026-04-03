import { puzzles, levels } from "@/lib/puzzles";
import { Bug, BookOpen, Trophy, Lock, ChevronDown, ChevronUp, Sparkles, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "./LanguageSelector";

interface WelcomeScreenProps {
  onSelectPuzzle: (idx: number) => void;
  completedPuzzles: Set<string>;
}

const WelcomeScreen = ({ onSelectPuzzle, completedPuzzles }: WelcomeScreenProps) => {
  const { t } = useTranslation();
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const totalCompleted = completedPuzzles.size;

  // Sort puzzles by level and levelOrder
  const sortedPuzzlesWithIdx = puzzles
    .map((p, idx) => ({ puzzle: p, originalIdx: idx }))
    .sort((a, b) => a.puzzle.level - b.puzzle.level || a.puzzle.levelOrder - b.puzzle.levelOrder);

  // Check if a level is unlocked (all puzzles in previous level completed)
  const isLevelUnlocked = (level: number): boolean => {
    if (level === 1) return true;
    const prevLevelPuzzles = sortedPuzzlesWithIdx.filter(p => p.puzzle.level === level - 1);
    return prevLevelPuzzles.every(p => completedPuzzles.has(p.puzzle.id));
  };

  // Get level completion stats
  const getLevelStats = (level: number) => {
    const levelPuzzles = sortedPuzzlesWithIdx.filter(p => p.puzzle.level === level);
    const completed = levelPuzzles.filter(p => completedPuzzles.has(p.puzzle.id)).length;
    return { total: levelPuzzles.length, completed };
  };

  const isLevelComplete = (level: number) => {
    const stats = getLevelStats(level);
    return stats.completed === stats.total;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Hero */}
      <div className="border-b border-border">
        {/* Top bar with Language Selector */}
        <div className="flex justify-end p-4 max-w-5xl mx-auto">
          <LanguageSelector />
        </div>
        <div className="max-w-3xl mx-auto px-6 py-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Bug className="w-9 h-9 text-primary" />
            <h1 className="text-4xl font-sans font-bold text-foreground tracking-tight">
              {t("common.title")}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t("welcome.subtitle")}
          </p>

          {/* Progress */}
          <div className="mt-5 flex items-center justify-center gap-5">
            <div className="flex items-center gap-2 text-sm font-mono">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground">
                {t("welcome.solved", { completed: totalCompleted, total: puzzles.length })}
              </span>
            </div>
            <div className="h-2 w-40 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(totalCompleted / puzzles.length) * 100}%` }}
              />
            </div>
          </div>

          {/* How it works */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            {[
              { icon: "📖", title: t("welcome.learn_title"), desc: t("welcome.learn_desc") },
              { icon: "👣", title: t("welcome.step_title"), desc: t("welcome.step_desc") },
              { icon: "🔍", title: t("welcome.spot_title"), desc: t("welcome.spot_desc") },
              { icon: "🔧", title: t("welcome.fix_title"), desc: t("welcome.fix_desc") },
            ].map(step => (
              <div key={step.title} className="rounded-lg border border-border bg-card p-3">
                <div className="text-xl mb-1">{step.icon}</div>
                <div className="font-sans font-semibold text-foreground text-sm">{step.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning Path */}
      <div className="max-w-3xl mx-auto px-6 py-8 w-full space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-sans font-bold text-foreground">{t("welcome.learning_path")}</h2>
        </div>

        {levels.map((levelInfo, levelIdx) => {
          const unlocked = isLevelUnlocked(levelInfo.level);
          const stats = getLevelStats(levelInfo.level);
          const complete = isLevelComplete(levelInfo.level);
          const isExpanded = expandedLevel === levelInfo.level;
          const levelPuzzles = sortedPuzzlesWithIdx.filter(p => p.puzzle.level === levelInfo.level);

          return (
            <motion.div
              key={levelInfo.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: levelIdx * 0.08 }}
            >
              <div
                className={`rounded-xl border overflow-hidden transition-all duration-300 ${
                  !unlocked
                    ? "border-border/40 bg-card/30 opacity-60"
                    : complete
                    ? "border-primary/40 bg-primary/5 shadow-sm shadow-primary/10"
                    : "border-border bg-card shadow-sm hover:shadow-md"
                }`}
              >
                {/* Level Header */}
                <button
                  onClick={() => unlocked && setExpandedLevel(isExpanded ? null : levelInfo.level)}
                  disabled={!unlocked}
                  className="w-full text-left px-5 py-4 flex items-center gap-4 group"
                >
                  {/* Level Badge */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-all ${
                    !unlocked
                      ? "bg-secondary/50 text-muted-foreground"
                      : complete
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-foreground"
                  }`}>
                    {!unlocked ? <Lock className="w-5 h-5" /> : complete ? <Sparkles className="w-5 h-5" /> : levelInfo.icon}
                  </div>

                  {/* Level Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                        Level {levelInfo.level}
                      </span>
                      {complete && (
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                          {t("welcome.complete")}
                        </span>
                      )}
                    </div>
                    <h3 className={`font-sans font-semibold text-base mt-0.5 ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {levelInfo.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{levelInfo.tagline}</p>
                  </div>

                  {/* Progress + Chevron */}
                  <div className="flex items-center gap-3 shrink-0">
                    {unlocked && (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: stats.total }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                i < stats.completed ? "bg-primary" : "bg-secondary"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {stats.completed}/{stats.total}
                        </span>
                      </div>
                    )}
                    {unlocked && (
                      isExpanded
                        ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && unlocked && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-4">
                        {/* Concept Intro Card */}
                        <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="w-4 h-4 text-accent" />
                            <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider">
                              📖 {t("welcome.concept", { title: levelInfo.conceptIntro.title })}
                            </span>
                          </div>
                          {levelInfo.conceptIntro.paragraphs.map((p, i) => (
                            <p key={i} className="text-xs text-foreground/80 leading-relaxed mb-2 last:mb-0">
                              {p}
                            </p>
                          ))}
                          <div className="mt-3 space-y-1">
                            <span className="text-[10px] font-mono font-semibold text-accent uppercase">{t("welcome.key_points")}</span>
                            {levelInfo.conceptIntro.keyPoints.map((kp, i) => (
                              <div key={i} className="flex items-start gap-1.5">
                                <span className="text-accent text-xs mt-0.5">•</span>
                                <span className="text-[11px] text-foreground/70 font-mono">{kp}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Puzzles */}
                        <div className="space-y-2">
                          {levelPuzzles.map(({ puzzle, originalIdx }, pIdx) => {
                            const isCompleted = completedPuzzles.has(puzzle.id);
                            return (
                              <motion.button
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: pIdx * 0.05 }}
                                key={puzzle.id}
                                onClick={() => onSelectPuzzle(originalIdx)}
                                className={`w-full text-left rounded-lg border p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                                  isCompleted
                                    ? "border-primary/30 bg-primary/5 hover:border-primary/50"
                                    : "border-border/60 bg-card hover:border-primary/40"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-muted-foreground/60">
                                      {levelInfo.level}.{puzzle.levelOrder}
                                    </span>
                                    <span className={`font-sans font-semibold text-base ${isCompleted ? 'text-primary' : 'text-foreground'}`}>
                                      {isCompleted && "✨ "}{puzzle.title}
                                    </span>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-mono font-bold ${
                                    puzzle.difficulty === "Easy" ? "bg-primary/20 text-primary" :
                                    puzzle.difficulty === "Medium" ? "bg-accent/20 text-accent" :
                                    "bg-destructive/20 text-destructive"
                                  }`}>
                                    {puzzle.difficulty}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1 leading-relaxed">{puzzle.description}</p>
                                <div className="mt-2 flex items-center gap-1.5 opacity-70">
                                  <BookOpen className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-[10px] font-mono text-muted-foreground">{puzzle.concept}</span>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Locked overlay text */}
                {!unlocked && (
                  <div className="px-5 pb-3">
                    <p className="text-[10px] text-muted-foreground/60 font-mono">
                      🔒 {t("welcome.locked_msg", { level: levelInfo.level - 1 })}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default WelcomeScreen;
