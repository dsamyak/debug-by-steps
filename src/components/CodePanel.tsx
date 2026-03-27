import { CodeLine } from "@/lib/puzzles";

interface CodePanelProps {
  lines: CodeLine[];
  activeLine: number;
  bugLine: number;
  showBug: boolean;
  isFixed: boolean;
  fixedLineCode?: string;
}

const CodePanel = ({ lines, activeLine, bugLine, showBug, isFixed, fixedLineCode }: CodePanelProps) => {
  return (
    <div className="font-mono text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const isActive = idx === activeLine;
        const isBug = showBug && idx === bugLine && !isFixed;
        const isFixedLine = isFixed && idx === bugLine;
        const displayCode = isFixedLine && fixedLineCode ? fixedLineCode : line.code;

        return (
          <div
            key={idx}
            className={`flex transition-all duration-200 ${
              isActive
                ? "bg-code-active/10 border-l-2 border-code-active"
                : isBug
                ? "bg-code-error/10 border-l-2 border-code-error"
                : isFixedLine
                ? "bg-code-fixed/10 border-l-2 border-code-fixed"
                : "border-l-2 border-transparent"
            }`}
          >
            <span className="w-10 text-right pr-3 select-none text-code-gutter text-xs leading-relaxed py-0.5">
              {idx + 1}
            </span>
            <span
              className={`flex-1 py-0.5 px-2 ${
                isActive
                  ? "text-foreground font-medium"
                  : isBug
                  ? "text-code-error line-through"
                  : isFixedLine
                  ? "text-code-fixed font-medium"
                  : "text-foreground/70"
              }`}
            >
              {displayCode}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default CodePanel;
