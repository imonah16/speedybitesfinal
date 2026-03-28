import { cn } from "@/lib/utils";

export default function StatCard({ title, value, subtitle, icon: Icon, trend, className }) {
  return (
    <div className={cn(
      "bg-card rounded-xl border p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium tracking-wide uppercase">{title}</p>
          <p className="text-3xl font-heading font-bold">{value}</p>
          {subtitle && (
            <p className={cn(
              "text-sm font-medium",
              trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-muted-foreground"
            )}>
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}