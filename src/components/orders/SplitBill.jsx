import { useState } from "react";
import { Users, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SplitBill({ total }) {
  const [splits, setSplits] = useState(2);
  const [paidCount, setPaidCount] = useState(0);

  const perPerson = total / splits;
  const remaining = (splits - paidCount) * perPerson;

  return (
    <div className="border-t pt-4 space-y-4">
      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Split Bill</h3>

      {/* Number of ways to split */}
      <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Users className="h-4 w-4 text-primary" />
          Split between
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setSplits(s => Math.max(2, s - 1)); setPaidCount(p => Math.min(p, splits - 2)); }}
            className="h-7 w-7 rounded-md border bg-background flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="font-bold w-4 text-center">{splits}</span>
          <button
            onClick={() => setSplits(s => s + 1)}
            className="h-7 w-7 rounded-md border bg-background flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Per person amount */}
      <div className="text-center py-2">
        <p className="text-xs text-muted-foreground">Each person pays</p>
        <p className="font-heading text-3xl font-bold text-primary">£{perPerson.toFixed(2)}</p>
      </div>

      {/* Per-person payment tracker */}
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: splits }, (_, i) => {
          const paid = i < paidCount;
          return (
            <button
              key={i}
              onClick={() => setPaidCount(paid ? i : i + 1)}
              className={cn(
                "p-3 rounded-lg border-2 text-sm font-medium transition-all",
                paid
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
              )}
            >
              {paid ? "✓ Paid" : `Person ${i + 1}`}
              <div className="text-xs mt-0.5 font-normal">£{perPerson.toFixed(2)}</div>
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <div className="flex justify-between items-center text-sm pt-1 border-t">
        <span className="text-muted-foreground">{paidCount} of {splits} paid</span>
        <span className={cn("font-semibold", remaining === 0 ? "text-emerald-600" : "text-foreground")}>
          {remaining === 0 ? "Fully paid ✓" : `£${remaining.toFixed(2)} remaining`}
        </span>
      </div>
    </div>
  );
}