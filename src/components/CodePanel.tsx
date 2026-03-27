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
    <div className="font-mono text-base sm:text-lg leading-relaxed select-none">
      {lines.map((line, idx) => {
        const isActive = idx === activeLine;
        const isBug = showBug && idx === bugLine && !isFixed;
        const isFixedLine = isFixed && idx === bugLine;
        const displayCode = isFixedLine && fixedLineCode ? fixedLineCode : line.code;
        const showExp = showExplanations && isActive && line.explanation;

        // Highlight the code using Prism
        const highlightedCode = Prism.highlight(displayCode, Prism.languages.javascript, "javascript");

        return (
          <div key={idx}>
            <div
              className={`flex items-center transition-all duration-200 group ${
                isActive
                  ? "bg-primary/10 border-l-[3px] border-primary"
                  : isBug
                  ? "bg-destructive/10 border-l-[3px] border-destructive"
                  : isFixedLine
                  ? "bg-primary/10 border-l-[3px] border-primary"
                  : "border-l-[3px] border-transparent hover:bg-secondary/30"
              }`}
            >
              <span className="w-10 text-right pr-3 text-code-gutter text-sm py-1 shrink-0">
                {idx + 1}
              </span>
              <span
                className={`flex-1 py-1 px-2 whitespace-pre ${
                  isActive
                    ? "text-foreground font-medium"
                    : isBug
                    ? "text-destructive line-through opacity-80"
                    : isFixedLine
                    ? "text-primary font-medium"
                    : "text-foreground/60"
                }`}
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
              {isActive && (
                <span className="text-xs text-primary mr-3 animate-pulse">◀</span>
              )}
            </div>
            {showExp && (
              <div className="ml-10 px-3 py-1.5 text-sm text-accent bg-accent/5 border-l-[3px] border-accent/30 italic">
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
