export interface CodeLine {
  code: string;
  isBugLine?: boolean;
  explanation?: string; // What this line does in plain English
}

export interface FixOption {
  label: string;
  replacement: string;
  isCorrect: boolean;
  explanation?: string; // Why this fix is right/wrong
}

export interface Puzzle {
  id: string;
  title: string;
  description: string;
  category: PuzzleCategory;
  difficulty: "Easy" | "Medium" | "Hard";
  lines: CodeLine[];
  bugLineIndex: number;
  fixOptions: FixOption[];
  variables: Record<string, number | string | boolean | number[]>;
  expectedOutput?: string;
  hint: string;
  concept: string; // CS concept being taught
  lesson: string; // Explanation shown after solving
}

export type PuzzleCategory =
  | "Loop Errors"
  | "Comparison Bugs"
  | "Initialization"
  | "Array Logic"
  | "Accumulator Patterns"
  | "Boundary Conditions"
  | "String Manipulation"
  | "Boolean Logic"
  | "Nested Loops";

export const categoryDescriptions: Record<PuzzleCategory, string> = {
  "Loop Errors": "Bugs in loop bounds, off-by-one errors, and infinite loops.",
  "Comparison Bugs": "Wrong operators in if-statements and conditionals.",
  "Initialization": "Variables starting with the wrong value.",
  "Array Logic": "Mistakes when reading, writing, or traversing arrays.",
  "Accumulator Patterns": "Errors in summing, counting, or building results.",
  "Boundary Conditions": "Edge cases at the start, end, or limits of data.",
  "String Manipulation": "Errors in building, slicing, and concatenating text.",
  "Boolean Logic": "Flawed use of AND, OR, NOT operators.",
  "Nested Loops": "Mistakes in loops within loops, like 2D grids."
};

export const categoryIcons: Record<PuzzleCategory, string> = {
  "Loop Errors": "🔄",
  "Comparison Bugs": "⚖️",
  "Initialization": "🏁",
  "Array Logic": "📦",
  "Accumulator Patterns": "📊",
  "Boundary Conditions": "🧱",
  "String Manipulation": "🔤",
  "Boolean Logic": "🔀",
  "Nested Loops": "🔁"
};

export const puzzles: Puzzle[] = [
  // ── Loop Errors ──
  {
    id: "off-by-one",
    title: "The Missing Element",
    description: "This code should sum ALL elements of an array. Step through and watch — does it actually add every number?",
    category: "Loop Errors",
    difficulty: "Easy",
    lines: [
      { code: "let arr = [10, 20, 30, 40, 50];", explanation: "Create an array with 5 numbers (indices 0-4)" },
      { code: "let sum = 0;", explanation: "Initialize our running total to 0" },
      { code: "let i = 0;", explanation: "Start our loop counter at index 0" },
      { code: "while (i < arr.length - 1) {", isBugLine: true, explanation: "🔍 Loop condition: arr.length is 5, so this checks i < 4" },
      { code: "  sum = sum + arr[i];", explanation: "Add the current element to our sum" },
      { code: "  i = i + 1;", explanation: "Move to the next index" },
      { code: "}", explanation: "End of loop — jump back to check condition" },
      { code: "// sum should be 150", explanation: "Expected result: 10+20+30+40+50 = 150" },
    ],
    bugLineIndex: 3,
    fixOptions: [
      { label: "i < arr.length", replacement: "while (i < arr.length) {", isCorrect: true, explanation: "✅ Correct! arr.length is 5, so i goes 0,1,2,3,4 — all 5 elements." },
      { label: "i <= arr.length", replacement: "while (i <= arr.length) {", isCorrect: false, explanation: "❌ This would try to access arr[5] which doesn't exist (index out of bounds)." },
      { label: "i < arr.length + 1", replacement: "while (i < arr.length + 1) {", isCorrect: false, explanation: "❌ Same problem — i would reach 5, and arr[5] is undefined." },
    ],
    variables: {},
    hint: "arr.length is 5, but valid indices are 0-4. What does 'i < arr.length - 1' actually mean?",
    concept: "Off-by-one errors",
    lesson: "Off-by-one errors are the most common bug in programming. Remember: array indices go from 0 to length-1. To visit ALL elements, use 'i < arr.length' (not 'i < arr.length - 1', which skips the last one). Always trace through the last iteration mentally!",
  },
  {
    id: "infinite-loop-risk",
    title: "The Frozen Machine",
    description: "This code should count down from 5 to 1. But watch what happens to the counter variable...",
    category: "Loop Errors",
    difficulty: "Medium",
    lines: [
      { code: "let n = 5;", explanation: "Start counting from 5" },
      { code: "let result = 0;", explanation: "Accumulate our result" },
      { code: "while (n > 0) {", explanation: "Keep going while n is positive" },
      { code: "  result = result + n;", explanation: "Add current n to result" },
      { code: "  n = n + 1;", isBugLine: true, explanation: "🔍 This changes n — but in which direction?" },
      { code: "}", explanation: "Loop back to check condition" },
      { code: "// result should be 15", explanation: "Expected: 5+4+3+2+1 = 15" },
    ],
    bugLineIndex: 4,
    fixOptions: [
      { label: "n = n - 1", replacement: "  n = n - 1;", isCorrect: true, explanation: "✅ Correct! To count DOWN, we subtract 1 each time." },
      { label: "n = n - 2", replacement: "  n = n - 2;", isCorrect: false, explanation: "❌ This would skip numbers: 5, 3, 1 → result would be 9, not 15." },
      { label: "n = 0", replacement: "  n = 0;", isCorrect: false, explanation: "❌ This would exit immediately after one iteration, giving result = 5." },
    ],
    variables: {},
    hint: "If n starts at 5 and we add 1 each time, will n ever become 0 or less?",
    concept: "Loop direction and termination",
    lesson: "A loop must make progress toward its exit condition. If the condition is 'n > 0' but n increases, the loop never ends (infinite loop). Always verify that your loop variable moves TOWARD the boundary, not away from it. This is called 'loop termination' — a fundamental concept in algorithm correctness.",
  },

  // ── Comparison Bugs ──
  {
    id: "wrong-comparison",
    title: "Backwards Bouncer",
    description: "This code finds the MAXIMUM value. But watch the comparison — is it selecting the right numbers?",
    category: "Comparison Bugs",
    difficulty: "Easy",
    lines: [
      { code: "let nums = [3, 7, 2, 9, 5];", explanation: "Our array of numbers to search" },
      { code: "let max = nums[0];", explanation: "Assume the first element (3) is the max" },
      { code: "let i = 1;", explanation: "Start comparing from the second element" },
      { code: "while (i < nums.length) {", explanation: "Visit every remaining element" },
      { code: "  if (nums[i] < max) {", isBugLine: true, explanation: "🔍 When do we update max? When nums[i] is LESS than max?" },
      { code: "    max = nums[i];", explanation: "Update max to this value" },
      { code: "  }", explanation: "End of if-block" },
      { code: "  i = i + 1;", explanation: "Move to next element" },
      { code: "}", explanation: "Loop back" },
      { code: "// max should be 9", explanation: "The largest number in the array" },
    ],
    bugLineIndex: 4,
    fixOptions: [
      { label: "nums[i] > max", replacement: "  if (nums[i] > max) {", isCorrect: true, explanation: "✅ Correct! We update max when we find something BIGGER." },
      { label: "nums[i] >= max", replacement: "  if (nums[i] >= max) {", isCorrect: false, explanation: "❌ Close! >= would work here but is semantically wrong — equal values don't need updating." },
      { label: "nums[i] == max", replacement: "  if (nums[i] == max) {", isCorrect: false, explanation: "❌ This only updates when values are equal, which defeats the purpose." },
    ],
    variables: {},
    hint: "To find the maximum, when should we update? When we find something bigger or smaller?",
    concept: "Comparison operator direction",
    lesson: "A reversed comparison operator is a subtle bug because the code still 'runs' fine — it just produces the wrong answer. Here, using '<' instead of '>' means we find the MINIMUM instead of the MAXIMUM. Always read conditionals aloud: 'If the new number is GREATER than the current max, update.' The English tells you the operator.",
  },
  {
    id: "wrong-equality",
    title: "The Password Gate",
    description: "This code checks if a target number exists in an array. But the check is wrong...",
    category: "Comparison Bugs",
    difficulty: "Medium",
    lines: [
      { code: "let items = [5, 12, 8, 3, 20];", explanation: "Array to search through" },
      { code: "let target = 8;", explanation: "The number we're looking for" },
      { code: "let found = 0;", explanation: "0 means not found, 1 means found" },
      { code: "let i = 0;", explanation: "Start at the beginning" },
      { code: "while (i < items.length) {", explanation: "Check every element" },
      { code: "  if (items[i] != target) {", isBugLine: true, explanation: "🔍 We set found=1 when items[i] does NOT equal target?" },
      { code: "    found = 1;", explanation: "Mark as found" },
      { code: "  }", explanation: "End if" },
      { code: "  i = i + 1;", explanation: "Next element" },
      { code: "}", explanation: "Loop back" },
      { code: "// found should be 1", explanation: "8 is in the array, so found = 1" },
    ],
    bugLineIndex: 5,
    fixOptions: [
      { label: "items[i] == target", replacement: "  if (items[i] == target) {", isCorrect: true, explanation: "✅ Correct! We want to set found=1 when we find an EQUAL match." },
      { label: "items[i] > target", replacement: "  if (items[i] > target) {", isCorrect: false, explanation: "❌ This checks if elements are bigger, not equal to the target." },
      { label: "items[i] <= target", replacement: "  if (items[i] <= target) {", isCorrect: false, explanation: "❌ This would match too many elements, not just the target." },
    ],
    variables: {},
    hint: "We want found=1 when we find the target. Should we check for equality or inequality?",
    concept: "Equality vs inequality operators",
    lesson: "Using != instead of == is a logic inversion bug. The code does the OPPOSITE of what's intended. When writing search logic, always verify: 'Am I checking for the condition I WANT, or its inverse?' This is especially tricky because both == and != are valid syntax — the compiler can't catch this for you.",
  },

  // ── Initialization ──
  {
    id: "wrong-init",
    title: "The Counter Catastrophe",
    description: "This code counts even numbers. But the count starts wrong — watch the initial value carefully.",
    category: "Initialization",
    difficulty: "Easy",
    lines: [
      { code: "let data = [4, 7, 2, 9, 6, 1];", explanation: "Array with 3 even numbers: 4, 2, 6" },
      { code: "let count = 1;", isBugLine: true, explanation: "🔍 Count starts at 1 — but we haven't counted anything yet!" },
      { code: "let i = 0;", explanation: "Start at the beginning" },
      { code: "while (i < data.length) {", explanation: "Visit every element" },
      { code: "  if (data[i] % 2 == 0) {", explanation: "Check if element is even (remainder 0 when divided by 2)" },
      { code: "    count = count + 1;", explanation: "Found an even number, increment count" },
      { code: "  }", explanation: "End if" },
      { code: "  i = i + 1;", explanation: "Next element" },
      { code: "}", explanation: "Loop back" },
      { code: "// count should be 3", explanation: "There are 3 even numbers: 4, 2, 6" },
    ],
    bugLineIndex: 1,
    fixOptions: [
      { label: "let count = 0;", replacement: "let count = 0;", isCorrect: true, explanation: "✅ Correct! Start counting from 0 — we haven't found any evens yet." },
      { label: "let count = -1;", replacement: "let count = -1;", isCorrect: false, explanation: "❌ Starting at -1 would make the final count 2 instead of 3." },
      { label: "let count = data.length;", replacement: "let count = data.length;", isCorrect: false, explanation: "❌ Starting at 6 and adding would give 9, way too high." },
    ],
    variables: {},
    hint: "Before the loop starts, how many even numbers have we found? That should be the initial value.",
    concept: "Variable initialization",
    lesson: "Initialization bugs are sneaky because they shift every result by a constant amount. A counter should start at 0, a sum should start at 0, and a product should start at 1. The initial value represents the 'identity' — the state before any work is done. Always ask: 'What is the correct answer if the loop runs zero times?'",
  },
  {
    id: "wrong-product-init",
    title: "The Multiplier Malfunction",
    description: "This code computes the product of all numbers. But something is off with the starting value...",
    category: "Initialization",
    difficulty: "Medium",
    lines: [
      { code: "let vals = [2, 3, 4];", explanation: "Three numbers to multiply together" },
      { code: "let product = 0;", isBugLine: true, explanation: "🔍 Product starts at 0 — what happens when you multiply by 0?" },
      { code: "let i = 0;", explanation: "Start index" },
      { code: "while (i < vals.length) {", explanation: "Visit each element" },
      { code: "  product = product * vals[i];", explanation: "Multiply current product by this element" },
      { code: "  i = i + 1;", explanation: "Next element" },
      { code: "}", explanation: "Loop back" },
      { code: "// product should be 24", explanation: "Expected: 2 × 3 × 4 = 24" },
    ],
    bugLineIndex: 1,
    fixOptions: [
      { label: "let product = 1;", replacement: "let product = 1;", isCorrect: true, explanation: "✅ Correct! 1 is the multiplicative identity — 1 × anything = anything." },
      { label: "let product = 2;", replacement: "let product = 2;", isCorrect: false, explanation: "❌ Starting at 2 would double the result: 2×2×3×4 = 48." },
      { label: "let product = vals[0];", replacement: "let product = vals[0];", isCorrect: false, explanation: "❌ Then you'd multiply vals[0] twice since the loop also hits index 0." },
    ],
    variables: {},
    hint: "0 × anything = 0. What number, when multiplied, doesn't change the result?",
    concept: "Multiplicative identity",
    lesson: "For addition, the identity element is 0 (0 + x = x). For multiplication, it's 1 (1 × x = x). Starting a product at 0 means every multiplication gives 0 — a classic 'zero-product' bug. This connects to the mathematical concept of identity elements in algebra.",
  },

  // ── Array Logic ──
  {
    id: "update-timing",
    title: "Too Early!",
    description: "This code should find the index of the smallest element. But the index updates unconditionally...",
    category: "Array Logic",
    difficulty: "Hard",
    lines: [
      { code: "let arr = [5, 1, 8, 3];", explanation: "Array to search — minimum is 1 at index 1" },
      { code: "let minIdx = 0;", explanation: "Assume first element is the minimum" },
      { code: "let i = 1;", explanation: "Start checking from second element" },
      { code: "while (i < arr.length) {", explanation: "Visit remaining elements" },
      { code: "  minIdx = i;", isBugLine: true, explanation: "🔍 This sets minIdx to i EVERY iteration, not just when we find a smaller element!" },
      { code: "  if (arr[i] < arr[minIdx]) {", explanation: "Check if current element is smaller" },
      { code: "    // minIdx already set", explanation: "minIdx was already changed above — this if is useless!" },
      { code: "  }", explanation: "End if" },
      { code: "  i = i + 1;", explanation: "Next element" },
      { code: "}", explanation: "Loop back" },
      { code: "// swap arr[0] and arr[minIdx]", explanation: "Put the minimum at the front" },
      { code: "let temp = arr[0];", explanation: "Save arr[0] before overwriting" },
      { code: "arr[0] = arr[minIdx];", explanation: "Put minimum at front" },
      { code: "arr[minIdx] = temp;", explanation: "Put old front value where minimum was" },
      { code: "// arr[0] should be 1", explanation: "The smallest element should now be first" },
    ],
    bugLineIndex: 4,
    fixOptions: [
      { label: "Move update inside if-block", replacement: "  if (arr[i] < arr[minIdx]) {", isCorrect: false, explanation: "❌ This would create a duplicate if-statement." },
      { label: "Remove line; put minIdx = i inside if", replacement: "  // (removed)", isCorrect: true, explanation: "✅ Correct! minIdx should only update when we actually find a smaller element." },
      { label: "minIdx = 0;", replacement: "  minIdx = 0;", isCorrect: false, explanation: "❌ Resetting to 0 each time would never let us track the real minimum index." },
    ],
    variables: {},
    hint: "minIdx should only change when we actually find a smaller element, not every iteration.",
    concept: "Conditional vs unconditional updates",
    lesson: "Placing an update OUTSIDE a conditional means it happens every time, not just when the condition is met. This is a 'scope error' — the assignment is in the wrong scope. In selection sort, minIdx must only update inside the if-block. Always check: is this statement in the right scope?",
  },
  {
    id: "reverse-copy",
    title: "The Mirror Mistake",
    description: "This code should reverse an array into a new array. Watch the index math carefully...",
    category: "Array Logic",
    difficulty: "Hard",
    lines: [
      { code: "let src = [1, 2, 3, 4];", explanation: "Source array to reverse" },
      { code: "let dest = [0, 0, 0, 0];", explanation: "Destination array (same size)" },
      { code: "let i = 0;", explanation: "Loop counter" },
      { code: "while (i < src.length) {", explanation: "Process each element" },
      { code: "  dest[i] = src[src.length - i];", isBugLine: true, explanation: "🔍 When i=0: src.length-i = 4, but src[4] doesn't exist!" },
      { code: "  i = i + 1;", explanation: "Next element" },
      { code: "}", explanation: "Loop back" },
      { code: "// dest should be [4, 3, 2, 1]", explanation: "Reversed order" },
    ],
    bugLineIndex: 4,
    fixOptions: [
      { label: "src[src.length - 1 - i]", replacement: "  dest[i] = src[src.length - 1 - i];", isCorrect: true, explanation: "✅ Correct! The last valid index is length-1, so we need length-1-i." },
      { label: "src[src.length + i]", replacement: "  dest[i] = src[src.length + i];", isCorrect: false, explanation: "❌ This goes way beyond array bounds." },
      { label: "src[i - 1]", replacement: "  dest[i] = src[i - 1];", isCorrect: false, explanation: "❌ When i=0, this accesses src[-1] which is invalid." },
    ],
    variables: {},
    hint: "Array indices go 0 to length-1. If length is 4, the last index is 3, not 4.",
    concept: "Array index arithmetic",
    lesson: "When computing array indices with arithmetic, always check boundary values. Plug in i=0 and i=length-1 mentally: does the computed index stay in bounds? For reversing, the mapping is: position i maps to position (length-1-i). The '-1' accounts for zero-based indexing.",
  },

  // ── Accumulator Patterns ──
  {
    id: "average-bug",
    title: "The Wrong Average",
    description: "This code computes an average but divides at the wrong time. Watch sum and count carefully.",
    category: "Accumulator Patterns",
    difficulty: "Medium",
    lines: [
      { code: "let grades = [80, 90, 70];", explanation: "Three test scores" },
      { code: "let sum = 0;", explanation: "Running total" },
      { code: "let i = 0;", explanation: "Loop counter" },
      { code: "while (i < grades.length) {", explanation: "Visit each grade" },
      { code: "  sum = sum + grades[i];", explanation: "Add grade to total" },
      { code: "  i = i + 1;", explanation: "Next grade" },
      { code: "}", explanation: "Loop back" },
      { code: "let avg = sum * grades.length;", isBugLine: true, explanation: "🔍 Multiplying sum by count? That doesn't compute an average..." },
      { code: "// avg should be 80", explanation: "Expected: (80+90+70)/3 = 80" },
    ],
    bugLineIndex: 7,
    fixOptions: [
      { label: "sum / grades.length", replacement: "let avg = sum / grades.length;", isCorrect: false, explanation: "Actually wait — this IS correct. Let me reconsider..." },
      { label: "sum / grades.length", replacement: "let avg = sum / grades.length;", isCorrect: true, explanation: "✅ Correct! Average = total sum ÷ number of items." },
      { label: "sum - grades.length", replacement: "let avg = sum - grades.length;", isCorrect: false, explanation: "❌ Subtracting the count from the sum doesn't give an average." },
      { label: "sum + grades.length", replacement: "let avg = sum + grades.length;", isCorrect: false, explanation: "❌ Adding the count to sum is meaningless for averaging." },
    ],
    variables: {},
    hint: "Average = total / count. What operation should we use?",
    concept: "Accumulator then reduce pattern",
    lesson: "The accumulator pattern has two phases: (1) ACCUMULATE — loop through data, building up a total. (2) REDUCE — after the loop, compute the final answer from the accumulated value. Here, we accumulate a sum, then divide by count. Using the wrong operator in the reduce step is a common mistake.",
  },

  // ── Boundary Conditions ──
  {
    id: "fence-post",
    title: "The Fence Post Problem",
    description: "This code builds a string like '1-2-3-4' with dashes between numbers. But there's an extra dash...",
    category: "Boundary Conditions",
    difficulty: "Hard",
    lines: [
      { code: "let nums = [1, 2, 3, 4];", explanation: "Numbers to join with dashes" },
      { code: "let out = \"\";", explanation: "Start with empty string" },
      { code: "let i = 0;", explanation: "Loop counter" },
      { code: "while (i < nums.length) {", explanation: "Visit each number" },
      { code: "  out = out + nums[i];", explanation: "Append the number" },
      { code: "  out = out + \"-\";", isBugLine: true, explanation: "🔍 This adds a dash AFTER every number, even the last one!" },
      { code: "  i = i + 1;", explanation: "Next number" },
      { code: "}", explanation: "Loop back" },
      { code: "// out should be \"1-2-3-4\"", explanation: "Dashes between numbers, not after the last" },
    ],
    bugLineIndex: 5,
    fixOptions: [
      { label: "Add dash only if not last element", replacement: "  if (i < nums.length - 1) { out = out + \"-\"; }", isCorrect: true, explanation: "✅ Correct! Only add a dash if there's another number coming after." },
      { label: "out = out + \" \";", replacement: "  out = out + \" \";", isCorrect: false, explanation: "❌ This changes the separator but doesn't fix the trailing character problem." },
      { label: "Remove this line", replacement: "  // (removed)", isCorrect: false, explanation: "❌ Removing all dashes means we get '1234' with no separators at all." },
    ],
    variables: {},
    hint: "How many dashes do you need between 4 numbers? It's one fewer than the number count.",
    concept: "Fence post problem",
    lesson: "The fence post problem: to build a fence with N posts, you need N-1 rails between them. Similarly, joining N items with separators needs N-1 separators. Solutions: (1) Add separator only when it's not the last item, (2) Add the first item outside the loop, then loop from index 1 adding separator+item. This appears everywhere: CSV files, SQL queries, URL parameters.",
  },

  // ── String Manipulation ──
  {
    id: "string-length",
    title: "Password Validator",
    description: "This code checks if a password is at least 8 characters long and has no spaces. Watch the boolean flags carefully.",
    category: "String Manipulation",
    difficulty: "Medium",
    lines: [
      { code: "let pwd = \"secret123\";", explanation: "The user's password" },
      { code: "let isValid = true;", explanation: "Assume valid initially" },
      { code: "if (pwd.length < 8) {", isBugLine: true, explanation: "🔍 Wait, what if it's exactly 8? Is it valid?" },
      { code: "  isValid = false;", explanation: "Too short" },
      { code: "}", explanation: "End if" },
      { code: "// isValid should be true (length is 9)", explanation: "Expected result: true" }
    ],
    bugLineIndex: 2,
    fixOptions: [
      { label: "pwd.length > 8", replacement: "if (pwd.length > 8) {", isCorrect: false, explanation: "❌ This flags it as invalid if it's longer than 8, which is the opposite of 'at least 8'." },
      { label: "pwd.length <= 7", replacement: "if (pwd.length <= 7) {", isCorrect: true, explanation: "✅ Correct! If it's 7 or less, it's too short. This is equivalent to < 8." },
      { label: "pwd.length == 8", replacement: "if (pwd.length == 8) {", isCorrect: false, explanation: "❌ This only marks it invalid if it's exactly 8." }
    ],
    variables: {},
    hint: "If the requirement is 'at least 8' (≥ 8), the invalid condition is the opposite (< 8 or ≤ 7).",
    concept: "String Length & Inverse Logic",
    lesson: "When validating string lengths or ranges, be very careful with inclusive vs exclusive bounds. The opposite of '>= 8' is '< 8' (or '<= 7' for integers). Being off by one here leads to frustrating user experiences where valid passwords are rejected."
  },

  // ── Boolean Logic ──
  {
    id: "boolean-logic-discount",
    title: "The Discount Dilemma",
    description: "A customer gets a discount if they are a VIP OR if it's their birthday. But nobody is getting the discount!",
    category: "Boolean Logic",
    difficulty: "Easy",
    lines: [
      { code: "let isVip = false;", explanation: "Not a VIP" },
      { code: "let isBirthday = true;", explanation: "But it is their birthday!" },
      { code: "let getDiscount = false;", explanation: "Flag for discount" },
      { code: "if (isVip && isBirthday) {", isBugLine: true, explanation: "🔍 && means AND. So they must be BOTH VIP AND Birthday?" },
      { code: "  getDiscount = true;", explanation: "Grant discount" },
      { code: "}", explanation: "End if" },
      { code: "// getDiscount should be true", explanation: "Because it's their birthday, they should get it" }
    ],
    bugLineIndex: 3,
    fixOptions: [
      { label: "isVip || isBirthday", replacement: "if (isVip || isBirthday) {", isCorrect: true, explanation: "✅ Correct! || means OR. If EITHER condition is true, they get the discount." },
      { label: "isVip != isBirthday", replacement: "if (isVip != isBirthday) {", isCorrect: false, explanation: "❌ This is XOR (exclusive OR). If they were both VIP and Birthday, they wouldn't get it!" },
      { label: "!isVip && !isBirthday", replacement: "if (!isVip && !isBirthday) {", isCorrect: false, explanation: "❌ This grants the discount only if they are neither." }
    ],
    variables: {},
    hint: "Read the requirement: 'VIP OR birthday'. Which operator means OR?",
    concept: "Logical AND vs OR",
    lesson: "Confusing && (AND) with || (OR) is a classic logic error. AND is restrictive (requires all conditions). OR is permissive (requires any condition). Always test boolean branches with a truth table: what happens with (T,T), (T,F), (F,T), and (F,F)?"
  },

  // ── Nested Loops ──
  {
    id: "nested-loop-grid",
    title: "The Broken Grid",
    description: "This code tries to count the total number of cells in a 3x3 grid. But it double-counts something...",
    category: "Nested Loops",
    difficulty: "Hard",
    lines: [
      { code: "let width = 3;", explanation: "Grid width" },
      { code: "let height = 3;", explanation: "Grid height" },
      { code: "let cells = 0;", explanation: "Total cell counter" },
      { code: "let y = 0;", explanation: "Row counter" },
      { code: "while (y < height) {", explanation: "For each row" },
      { code: "  let x = 0;", explanation: "Start column counter at 0" },
      { code: "  while (x < width) {", explanation: "For each column in row" },
      { code: "    cells = cells + 1;", explanation: "Count the cell" },
      { code: "    x = x + 1;", explanation: "Next column" },
      { code: "  }", explanation: "End inner loop" },
      { code: "  y = x + 1;", isBugLine: true, explanation: "🔍 y is being updated using x instead of y!" },
      { code: "}", explanation: "End outer loop" },
      { code: "// cells should be 9", explanation: "3x3 grid means 9 cells" }
    ],
    bugLineIndex: 10,
    fixOptions: [
      { label: "y = y + 1;", replacement: "  y = y + 1;", isCorrect: true, explanation: "✅ Correct! The outer loop counter 'y' must be updated independently of 'x'." },
      { label: "x = y + 1;", replacement: "  x = y + 1;", isCorrect: false, explanation: "❌ Modifying x here doesn't advance the outer loop, leading to an infinite loop." },
      { label: "y = y + x;", replacement: "  y = y + x;", isCorrect: false, explanation: "❌ This skips rows by adding the entire width to y at once." }
    ],
    variables: {},
    hint: "Which variable controls the outer loop? Look at how it's being updated.",
    concept: "Nested Loop Counters",
    lesson: "In nested loops, it's very easy to mix up the inner counter (often 'j' or 'x') with the outer counter (often 'i' or 'y'). Accidentally modifying the inner counter in the outer block, or vice versa, causes skipping, infinite loops, or incorrect logic. Always keep loop variables strictly separated."
  }
];

// Let me just replace this block with the proper puzzles content.

// ── Interpreter ──

export interface StepResult {
  vars: Record<string, any>;
  nextLine: number;
  done: boolean;
  conditionEval?: string; // e.g., "3 < 5 → true"
  lineExplanation?: string;
}

export function executeLine(
  puzzle: Puzzle,
  lineIndex: number,
  vars: Record<string, any>,
  useFixed: boolean,
  fixedLineCode?: string
): StepResult {
  const v = { ...vars };
  for (const k of Object.keys(v)) {
    if (Array.isArray(v[k])) v[k] = [...v[k]];
  }

  const rawLine = puzzle.lines[lineIndex];
  const line = useFixed && lineIndex === puzzle.bugLineIndex && fixedLineCode
    ? fixedLineCode
    : rawLine.code;
  const lineExplanation = rawLine.explanation;

  const trimmed = line.trim();

  if (trimmed.startsWith("//") || trimmed === "" || trimmed === "// (removed)") {
    return { vars: v, nextLine: lineIndex + 1, done: lineIndex + 1 >= puzzle.lines.length, lineExplanation };
  }

  // Handle combined if + assignment on one line (for fence post fix)
  const inlineIf = trimmed.match(/^if\s*\((.+)\)\s*\{\s*(.+)\s*\}$/);
  if (inlineIf) {
    const cond = evalCondition(inlineIf[1], v);
    const condStr = formatCondition(inlineIf[1], v, cond);
    if (cond) {
      // Execute the inner statement
      const innerTrimmed = inlineIf[2].trim();
      const assignMatch = innerTrimmed.match(/^(\w+)\s*=\s*(.+);?$/);
      if (assignMatch) {
        v[assignMatch[1]] = evalExpr(assignMatch[2], v);
      }
    }
    return { vars: v, nextLine: lineIndex + 1, done: lineIndex + 1 >= puzzle.lines.length, conditionEval: condStr, lineExplanation };
  }

  // Let declaration
  const letMatch = trimmed.match(/^let\s+(\w+)\s*=\s*(.+);$/);
  if (letMatch) {
    const [, name, expr] = letMatch;
    v[name] = evalExpr(expr, v);
    return { vars: v, nextLine: lineIndex + 1, done: lineIndex + 1 >= puzzle.lines.length, lineExplanation };
  }

  // Assignment (not let, if, while)
  const assignMatch = trimmed.match(/^(\w+)\s*=\s*(.+);$/);
  if (assignMatch && !trimmed.startsWith("let") && !trimmed.startsWith("if") && !trimmed.startsWith("while")) {
    const [, name, expr] = assignMatch;
    v[name] = evalExpr(expr, v);
    return { vars: v, nextLine: lineIndex + 1, done: lineIndex + 1 >= puzzle.lines.length, lineExplanation };
  }

  // Array assignment
  const arrAssign = trimmed.match(/^(\w+)\[(\w+)\]\s*=\s*(.+);$/);
  if (arrAssign) {
    const [, arrName, idxExpr, valExpr] = arrAssign;
    const idx = evalExpr(idxExpr, v);
    v[arrName][idx] = evalExpr(valExpr, v);
    return { vars: v, nextLine: lineIndex + 1, done: lineIndex + 1 >= puzzle.lines.length, lineExplanation };
  }

  // While
  const whileMatch = trimmed.match(/^while\s*\((.+)\)\s*\{$/);
  if (whileMatch) {
    const cond = evalCondition(whileMatch[1], v);
    const condStr = formatCondition(whileMatch[1], v, cond);
    if (cond) {
      return { vars: v, nextLine: lineIndex + 1, done: false, conditionEval: condStr, lineExplanation };
    } else {
      const closeIdx = findMatchingBrace(puzzle.lines, lineIndex);
      return { vars: v, nextLine: closeIdx + 1, done: closeIdx + 1 >= puzzle.lines.length, conditionEval: condStr, lineExplanation };
    }
  }

  // If
  const ifMatch = trimmed.match(/^if\s*\((.+)\)\s*\{$/);
  if (ifMatch) {
    const cond = evalCondition(ifMatch[1], v);
    const condStr = formatCondition(ifMatch[1], v, cond);
    if (cond) {
      return { vars: v, nextLine: lineIndex + 1, done: false, conditionEval: condStr, lineExplanation };
    } else {
      const closeIdx = findMatchingBrace(puzzle.lines, lineIndex);
      return { vars: v, nextLine: closeIdx + 1, done: closeIdx + 1 >= puzzle.lines.length, conditionEval: condStr, lineExplanation };
    }
  }

  // Closing brace
  if (trimmed === "}") {
    const openIdx = findOpeningBrace(puzzle.lines, lineIndex);
    const openLine = puzzle.lines[openIdx].code.trim();
    if (openLine.startsWith("while")) {
      return { vars: v, nextLine: openIdx, done: false, lineExplanation: "Jump back to loop condition" };
    }
    return { vars: v, nextLine: lineIndex + 1, done: lineIndex + 1 >= puzzle.lines.length, lineExplanation };
  }

  return { vars: v, nextLine: lineIndex + 1, done: lineIndex + 1 >= puzzle.lines.length, lineExplanation };
}

function formatCondition(condExpr: string, vars: Record<string, any>, result: boolean): string {
  const ops = ["==", "!=", "<=", ">=", "<", ">"];
  for (const op of ops) {
    const idx = condExpr.indexOf(op);
    if (idx !== -1 && (op.length === 2 || (condExpr[idx + 1] !== "=" && (idx === 0 || condExpr[idx - 1] !== "<" && condExpr[idx - 1] !== ">" && condExpr[idx - 1] !== "!")))) {
      const leftExpr = condExpr.slice(0, idx).trim();
      const rightExpr = condExpr.slice(idx + op.length).trim();
      const leftVal = evalExpr(leftExpr, vars);
      const rightVal = evalExpr(rightExpr, vars);
      return `${leftVal} ${op} ${rightVal} → ${result}`;
    }
  }
  return `→ ${result}`;
}

function evalExpr(expr: string, vars: Record<string, any>): any {
  const trimmed = expr.trim();

  // String literal
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }

  // Array literal
  if (trimmed.startsWith("[")) {
    const inner = trimmed.slice(1, -1);
    if (inner.trim() === "") return [];
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
  if (lenMatch) return Array.isArray(vars[lenMatch[1]]) ? vars[lenMatch[1]].length : 0;

  // Binary ops (order matters for precedence simulation)
  const binOps = [" + ", " - ", " * ", " / ", " % "];
  for (const op of binOps) {
    const idx = trimmed.lastIndexOf(op);
    if (idx !== -1) {
      const left = evalExpr(trimmed.slice(0, idx), vars);
      const right = evalExpr(trimmed.slice(idx + op.length), vars);
      switch (op.trim()) {
        case "+":
          if (typeof left === "string" || typeof right === "string") return String(left) + String(right);
          return left + right;
        case "-": return left - right;
        case "*": return left * right;
        case "/": return right !== 0 ? Math.floor(left / right) : 0;
        case "%": return left % right;
      }
    }
  }

  // Variable
  if (vars[trimmed] !== undefined) return vars[trimmed];

  // Boolean Literals
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;

  // String .length
  const strLenMatch = trimmed.match(/^(\w+)\.length$/);
  if (strLenMatch && typeof vars[strLenMatch[1]] === 'string') return vars[strLenMatch[1]].length;

  return trimmed;
}

function evalCondition(cond: string, vars: Record<string, any>): boolean {
  cond = cond.trim();
  
  // Handle ! operator
  if (cond.startsWith("!")) {
    return !evalCondition(cond.slice(1), vars);
  }

  // Handle &&
  const andIdx = cond.indexOf(" && ");
  if (andIdx !== -1) {
    return evalCondition(cond.slice(0, andIdx), vars) && evalCondition(cond.slice(andIdx + 4), vars);
  }

  // Handle ||
  const orIdx = cond.indexOf(" || ");
  if (orIdx !== -1) {
    return evalCondition(cond.slice(0, orIdx), vars) || evalCondition(cond.slice(orIdx + 4), vars);
  }

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

  // Fallback to evaluating as an expression (e.g. `if (isDone)`)
  const val = evalExpr(cond, vars);
  return !!val;
}

function findMatchingBrace(lines: CodeLine[], openIdx: number): number {
  let depth = 1;
  for (let i = openIdx + 1; i < lines.length; i++) {
    const t = lines[i].code.trim();
    if (t.includes("{")) depth++;
    if (t === "}" || t.endsWith("}")) {
      // only count standalone } or trailing }
      if (t === "}") depth--;
    }
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
