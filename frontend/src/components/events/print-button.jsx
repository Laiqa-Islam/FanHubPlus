import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Prints the pass.
 *
 * The browser's own print dialog is the download: every desktop browser
 * offers "Save as PDF" there, and every phone offers a share sheet. That is a
 * real PDF with selectable text, produced without shipping a PDF library to
 * generate a layout the browser already knows how to make.
 */
export function PrintButton() {
  return (
    <Button size="sm" onClick={() => window.print()}>
      <Printer className="mr-1.5 h-3.5 w-3.5" aria-hidden />
      Print / save as PDF
    </Button>
  );
}
