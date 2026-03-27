export interface CodeLine {
  code: string;
  isBugLine?: boolean;
}

export interface FixOption {
  label: string;
  replacement: string;
  isCorrect: boolean;
}

export interface Puzzle {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  lines: CodeLine[];
  bugLineIndex: number; // 0-based
  fixOptions: FixOption[];
  variables: Record<string, number | string | boolean | number[]>;
  expectedOutput?: string;
  hint: string;
}

export const puzzles: Puzzle[] = [
  {
    id: "off-by-one",
    title: "The Missing Element",
    description: "This function should sum all elements of an array, but it's missing one. Watch the loop counter carefully.",
    difficulty: "Easy",
    lines: [
      { code: "let arr = [10, 20, 30, 40, 50];" },
      { code: "let sum = 0;" },
      { code: "let i = 0;" },
      { code: "while (i < arr.length - 1) {", isBugLine: true },
      { code: "  sum = sum + arr[i];" },
      { code: "  i = i + 1;" },
      { code: "}" },
      { code: "// sum should be 150" },
    ],
    bugLineIndex: 3,
    fixOptions: [
      { label: "i < arr.length", replacement: "while (i < arr.length) {", isCorrect: true },
      { label: "i <= arr.length", replacement: "while (i <= arr.length) {", isCorrect: false },
      { label: "i < arr.length + 1", replacement: "while (i < arr.length + 1) {", isCorrect: false },
    ],
    variables: {},
    hint: "How many elements are in the array? What's the last valid index?",
  },
  {
    id: "wrong-comparison",
    title: "Backwards Bouncer",
    description: "This code should find the maximum value in a list. But the comparison is backwards!",
    difficulty: "Easy",
    lines: [
      { code: "let nums = [3, 7, 2, 9, 5];" },
      { code: "let max = nums[0];" },
      { code: "let i = 1;" },
      { code: "while (i < nums.length) {" },
      { code: "  if (nums[i] < max) {", isBugLine: true },
      { code: "    max = nums[i];" },
      { code: "  }" },
      { code: "  i = i + 1;" },
      { code: "}" },
      { code: "// max should be 9" },
    ],
    bugLineIndex: 4,
    fixOptions: [
      { label: "nums[i] > max", replacement: "  if (nums[i] > max) {", isCorrect: true },
      { label: "nums[i] >= max", replacement: "  if (nums[i] >= max) {", isCorrect: false },
      { label: "nums[i] == max", replacement: "  if (nums[i] == max) {", isCorrect: false },
    ],
    variables: {},
    hint: "To find the maximum, we want to update when we find something bigger, not smaller.",
  },
  {
    id: "wrong-init",
    title: "The Counter Catastrophe",
    description: "This code counts how many even numbers are in the list. But the count is wrong!",
    difficulty: "Medium",
    lines: [
      { code: "let data = [4, 7, 2, 9, 6, 1];" },
      { code: "let count = 1;", isBugLine: true },
      { code: "let i = 0;" },
      { code: "while (i < data.length) {" },
      { code: "  if (data[i] % 2 == 0) {" },
      { code: "    count = count + 1;" },
      { code: "  }" },
      { code: "  i = i + 1;" },
      { code: "}" },
      { code: "// count should be 3" },
    ],
    bugLineIndex: 1,
    fixOptions: [
      { label: "let count = 0;", replacement: "let count = 0;", isCorrect: true },
      { label: "let count = -1;", replacement: "let count = -1;", isCorrect: false },
      { label: "let count = data.length;", replacement: "let count = data.length;", isCorrect: false },
    ],
    variables: {},
    hint: "What should the count be before we start counting anything?",
  },
  {
    id: "update-timing",
    title: "Too Early!",
    description: "This code should swap the minimum element to the front. But something updates too soon...",
    difficulty: "Hard",
    lines: [
      { code: "let arr = [5, 1, 8, 3];" },
      { code: "let minIdx = 0;" },
      { code: "let i = 1;" },
      { code: "while (i < arr.length) {" },
      { code: "  minIdx = i;", isBugLine: true },
      { code: "  if (arr[i] < arr[minIdx]) {" },
      { code: "    // minIdx already set" },
      { code: "  }" },
      { code: "  i = i + 1;" },
      { code: "}" },
      { code: "// swap arr[0] and arr[minIdx]" },
      { code: "let temp = arr[0];" },
      { code: "arr[0] = arr[minIdx];" },
      { code: "arr[minIdx] = temp;" },
      { code: "// arr[0] should be 1" },
    ],
    bugLineIndex: 4,
    fixOptions: [
      { label: "Move update inside if-block", replacement: "  if (arr[i] < arr[minIdx]) {", isCorrect: false },
      { label: "Remove this line; update minIdx inside if", replacement: "  // (removed)", isCorrect: true },
      { label: "minIdx = 0;", replacement: "  minIdx = 0;", isCorrect: false },
    ],
    variables: {},
    hint: "minIdx should only change when we actually find a smaller element.",
  },
];

// Interpreter: execute one line, return updated variables
export function executeLine(
  puzzle: Puzzle,
  lineIndex: number,
  vars: Record<string, any>,
  useFixed: boolean,
  fixedLineCode?: string
): { vars: Record<string, any>; nextLine: number; done: boolean } {
  const v = { ...vars };
  // Deep clone arrays
  for (const k of Object.keys(v)) {
    if (Array.isArray(v[k])) v[k] = [...v[k]];
  }

  const line = useFixed && lineIndex === puzzle.bugLineIndex && fixedLineCode
    ? fixedLineCode
    : puzzle.lines[lineIndex].code;

  const trimmed = line.trim();

  // Skip comments and empty
  if (trimmed.startsWith("//") || trimmed === "" || trimmed === "// (removed)") {
    return { vars: v, nextLine: lineIndex + 1, done: lineIndex + 1 >= puzzle.lines.length };
  }

  // Variable declaration: let x = expr;
  const letMatch = trimmed.match(/^let\s+(\w+)\s*=\s*(.+);$/);
  if (letMatch) {
    const [, name, expr] = letMatch;
    v[name] = evalExpr(expr, v);
    return { vars: v, nextLine: lineIndex + 1, done: lineIndex + 1 >= puzzle.lines.length };
  }

  // Assignment: x = expr;  or  x[expr] = expr;
  const assignMatch = trimmed.match(/^(\w+)\s*=\s*(.+);$/);
  if (assignMatch && !trimmed.startsWith("let") && !trimmed.startsWith("if") && !trimmed.startsWith("while")) {
    const [, name, expr] = assignMatch;
    v[name] = evalExpr(expr, v);
    return { vars: v, nextLine: lineIndex + 1, done: lineIndex + 1 >= puzzle.lines.length };
  }

  // Array element assignment: arr[idx] = expr;
  const arrAssign = trimmed.match(/^(\w+)\[(\w+)\]\s*=\s*(.+);$/);
  if (arrAssign) {
    const [, arrName, idxExpr, valExpr] = arrAssign;
    const idx = evalExpr(idxExpr, v);
    v[arrName][idx] = evalExpr(valExpr, v);
    return { vars: v, nextLine: lineIndex + 1, done: lineIndex + 1 >= puzzle.lines.length };
  }

  // While loop header
  const whileMatch = trimmed.match(/^while\s*\((.+)\)\s*\{$/);
  if (whileMatch) {
    const cond = evalCondition(whileMatch[1], v);
    if (cond) {
      return { vars: v, nextLine: lineIndex + 1, done: false };
    } else {
      // Jump past matching }
      const closeIdx = findMatchingBrace(puzzle.lines, lineIndex);
      return { vars: v, nextLine: closeIdx + 1, done: closeIdx + 1 >= puzzle.lines.length };
    }
  }

  // If statement
  const ifMatch = trimmed.match(/^if\s*\((.+)\)\s*\{$/);
  if (ifMatch) {
    const cond = evalCondition(ifMatch[1], v);
    if (cond) {
      return { vars: v, nextLine: lineIndex + 1, done: false };
    } else {
      const closeIdx = findMatchingBrace(puzzle.lines, lineIndex);
      return { vars: v, nextLine: closeIdx + 1, done: closeIdx + 1 >= puzzle.lines.length };
    }
  }

  // Closing brace - check if it's end of while loop
  if (trimmed === "}") {
    // Find the matching opening brace
    const openIdx = findOpeningBrace(puzzle.lines, lineIndex);
    const openLine = puzzle.lines[openIdx].code.trim();
    if (openLine.startsWith("while")) {
      // Go back to while to re-evaluate
      return { vars: v, nextLine: openIdx, done: false };
    }
    return { vars: v, nextLine: lineIndex + 1, done: lineIndex + 1 >= puzzle.lines.length };
  }

  // Fallthrough
  return { vars: v, nextLine: lineIndex + 1, done: lineIndex + 1 >= puzzle.lines.length };
}

function evalExpr(expr: string, vars: Record<string, any>): any {
  const trimmed = expr.trim();

  // Array literal
  if (trimmed.startsWith("[")) {
    const inner = trimmed.slice(1, -1);
    return inner.split(",").map(s => evalExpr(s.trim(), vars));
  }

  // Number
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);

  // arr[idx]
  const arrAccess = trimmed.match(/^(\w+)\[(\w+)\]$/);
  if (arrAccess) {
    return vars[arrAccess[1]][evalExpr(arrAccess[2], vars)];
  }

  // arr.length
  const lenMatch = trimmed.match(/^(\w+)\.length$/);
  if (lenMatch) return vars[lenMatch[1]].length;

  // Binary: a op b
  const binOps = [" + ", " - ", " * ", " % "];
  for (const op of binOps) {
    const idx = trimmed.lastIndexOf(op);
    if (idx !== -1) {
      const left = evalExpr(trimmed.slice(0, idx), vars);
      const right = evalExpr(trimmed.slice(idx + op.length), vars);
      switch (op.trim()) {
        case "+": return left + right;
        case "-": return left - right;
        case "*": return left * right;
        case "%": return left % right;
      }
    }
  }

  // Variable
  if (vars[trimmed] !== undefined) return vars[trimmed];

  return trimmed;
}

function evalCondition(cond: string, vars: Record<string, any>): boolean {
  const ops = ["==", "!=", "<=", ">=", "<", ">"];
  for (const op of ops) {
    const idx = cond.indexOf(op);
    if (idx !== -1 && (op.length === 2 || (cond[idx + 1] !== "=" && (idx === 0 || cond[idx - 1] !== "<" && cond[idx - 1] !== ">" && cond[idx - 1] !== "!")))) {
      const left = evalExpr(cond.slice(0, idx), vars);
      const right = evalExpr(cond.slice(idx + op.length), vars);
      switch (op) {
        case "==": return left == right;
        case "!=": return left != right;
        case "<": return left < right;
        case ">": return left > right;
        case "<=": return left <= right;
        case ">=": return left >= right;
      }
    }
  }
  return false;
}

function findMatchingBrace(lines: CodeLine[], openIdx: number): number {
  let depth = 1;
  for (let i = openIdx + 1; i < lines.length; i++) {
    const t = lines[i].code.trim();
    if (t.includes("{")) depth++;
    if (t === "}") depth--;
    if (depth === 0) return i;
  }
  return lines.length - 1;
}

function findOpeningBrace(lines: CodeLine[], closeIdx: number): number {
  let depth = 1;
  for (let i = closeIdx - 1; i >= 0; i--) {
    const t = lines[i].code.trim();
    if (t === "}") depth++;
    if (t.includes("{")) depth--;
    if (depth === 0) return i;
  }
  return 0;
}
