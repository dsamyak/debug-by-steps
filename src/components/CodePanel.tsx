import { CodeLine } from "@/lib/puzzles";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";

interface CodePanelProps {
  lines: CodeLine[];
  activeLine: number;
  bugLine: number;
  showBug: boolean;
  isFixed: boolean;
  fixedLineCode?: string;
  showExplanations: boolean;
}

const CodePanel = ({ lines, activeLine, bugLine, showBug, isFixed, fixedLineCode, showExplanations }: CodePanelProps) => {
  return (
    <div className="font-mono text-lg sm:text-xl leading-loose select-none">
      {lines.map((line, idx) => {
        const isActive = idx === activeLine;
        const isBug = showBug && idx === bugLine && !isFixed;
        const isFixedLine = isFixed && idx === bugLine;
        const displayCode = isFixedLine && fixedLineCode ? fixedLineCode : line.code;
        const showExp = showExplanations && line.explanation;

        const highlightedCode = Prism.highlight(displayCode, Prism.languages.javascript, "javascript");

        return (
          <div key={idx}>
            <div
              className={`flex items-center transition-all duration-200 group ${
                isActive
                  ? "bg-primary/10 border-l-4 border-primary"
                  : isBug
                  ? "bg-destructive/10 border-l-4 border-destructive"
                  : isFixedLine
                  ? "bg-primary/10 border-l-4 border-primary"
                  : "border-l-4 border-transparent hover:bg-secondary/30"
              }`}
            >
              <span className="w-12 text-right pr-4 text-muted-foreground/40 text-base py-1.5 shrink-0">
                {idx + 1}
              </span>
              <span
                className={`flex-1 py-1.5 px-3 whitespace-pre ${
                  isActive
                    ? "text-foreground font-medium"
                    : isBug
                    ? "text-destructive line-through opacity-80"
                    : isFixedLine
                    ? "text-primary font-medium"
                    : "text-foreground/70"
                }`}
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
              {isBug && (
                <span className="text-sm text-destructive mr-4 font-bold">← BUG</span>
              )}
              {isFixedLine && (
                <span className="text-sm text-primary mr-4 font-bold">← FIXED</span>
              )}
            </div>
            {showExp && (
              <div className="ml-12 px-4 py-2 text-sm text-accent bg-accent/5 border-l-4 border-accent/30 italic leading-relaxed">
                💡 {line.explanation}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CodePanel;
