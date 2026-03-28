import { cn } from "@/lib/utils";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  preparing: "bg-blue-100 text-blue-800 border-blue-200",
  ready: "bg-emerald-100 text-emerald-800 border-emerald-200",
  served: "bg-slate-100 text-slate-600 border-slate-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels = {
  pending: "Pending",
  preparing: "Preparing",
  ready: "Ready",
  served: "Served",
  cancelled: "Cancelled",
};

export default function OrderStatusBadge({ status }) {
  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border",
      statusStyles[status] || statusStyles.pending
    )}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full mr-2",
        status === "pending" && "bg-amber-500 animate-pulse",
        status === "preparing" && "bg-blue-500 animate-pulse",
        status === "ready" && "bg-emerald-500",
        status === "served" && "bg-slate-400",
        status === "cancelled" && "bg-red-500"
      )} />
      {statusLabels[status] || status}
    </span>
  );
}