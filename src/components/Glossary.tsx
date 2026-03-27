import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const glossaryTerms = [
  {
    term: "Accumulator Pattern",
    definition: "A programming pattern where a variable is updated inside a loop to keep a running total or build a final result (like a sum, product, or combined string).",
  },
  {
    term: "Off-by-One Error",
    definition: "A classic logic error where a loop iterates one time too many or too few, often caused by using < instead of <=, or starting at 1 instead of 0.",
  },
  {
    term: "Infinite Loop",
    definition: "A loop that never terminates because its exit condition is never met. This usually happens when the loop counter is updated in the wrong direction or not at all.",
  },
  {
    term: "Fence Post Problem",
    definition: "The issue of dealing with separators between items. To connect N items, you need N-1 separators (just like building a fence requires 1 less rail than posts).",
  },
  {
    term: "Logical AND (&&)",
    definition: "An operator that returns true ONLY if both conditions are true. It is restrictive. Example: (isVip && isBirthday) means they must be BOTH a VIP AND having a birthday.",
  },
  {
    term: "Logical OR (||)",
    definition: "An operator that returns true if AT LEAST ONE condition is true. It is permissive. Example: (isSaturday || isSunday) means true on either day.",
  },
  {
    term: "Index Out of Bounds",
    definition: "Trying to access an element of an array that doesn't exist. In JavaScript, arrays are 0-indexed, so an array of length 5 has valid indices 0 through 4.",
  },
  {
    term: "String Concatenation",
    definition: "Joining two or more strings end-to-end to form a single string, usually done with the '+' operator.",
  },
  {
    term: "Nested Loops",
    definition: "A loop placed inside another loop. They are often used to work with 2D data like grids or matrices. The inner loop finishes all its iterations for every single iteration of the outer loop.",
  }
];

export function Glossary() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 font-mono text-xs shadow-sm">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline">Glossary</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-primary font-mono">
            <BookOpen className="w-5 h-5" />
            Programming Glossary
          </SheetTitle>
          <SheetDescription className="font-sans text-xs">
            A quick cheat sheet of common programming concepts and bugs you'll encounter in Bug Hunter.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-6 pr-4">
          <div className="space-y-6">
            {glossaryTerms.map((item, i) => (
              <div key={i} className="group">
                <h3 className="font-mono font-semibold text-sm text-foreground mb-1 group-hover:text-primary transition-colors">
                  {item.term}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.definition}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
