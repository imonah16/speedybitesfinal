import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ChefHat, Clock, CheckCircle2, Bell, RefreshCw, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow, differenceInMinutes } from "date-fns";
import { cn } from "@/lib/utils";

function OrderAge({ createdDate }) {
  const [mins, setMins] = useState(differenceInMinutes(new Date(), new Date(createdDate)));

  useEffect(() => {
    const interval = setInterval(() => {
      setMins(differenceInMinutes(new Date(), new Date(createdDate)));
    }, 30000);
    return () => clearInterval(interval);
  }, [createdDate]);

  const urgent = mins >= 15;
  const warning = mins >= 8;

  return (
    <span className={cn(
      "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
      urgent ? "bg-red-100 text-red-700 animate-pulse" :
      warning ? "bg-amber-100 text-amber-700" :
      "bg-secondary text-muted-foreground"
    )}>
      <Clock className="h-3 w-3" />
      {mins < 1 ? "Just now" : `${mins}m`}
    </span>
  );
}

function OrderCard({ order, onUpdateStatus }) {
  const isPending = order.status === "pending";
  const isPreparing = order.status === "preparing";
  const isReady = order.status === "ready";

  const borderColor = isPending
    ? "border-l-amber-400"
    : isPreparing
    ? "border-l-blue-400"
    : "border-l-emerald-400";

  const handleMarkReady = async () => {
    await onUpdateStatus(order.id, "ready");
    toast.success(`🔔 Order ${order.order_number} is ready!`, {
      description: order.table_number
        ? `Table ${order.table_number} — please bring to front-of-house`
        : order.customer_name
        ? `${order.customer_name} — ready for collection`
        : "Ready for collection",
      duration: 6000,
    });
  };

  return (
    <div className={cn(
      "bg-card border-2 border-l-4 rounded-xl p-4 space-y-3 shadow-sm hover:shadow-md transition-all",
      borderColor,
      isReady && "opacity-80"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-lg text-primary">
              {order.order_type === "takeaway" ? "🥡" : "🪑"}
              {order.table_number ? ` T${order.table_number}` : ""}
            </span>
            {order.customer_name && (
              <span className="text-sm font-medium text-muted-foreground">{order.customer_name}</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground font-mono">{order.order_number}</span>
        </div>
        <OrderAge createdDate={order.created_date} />
      </div>

      {/* Items */}
      <div className="space-y-2 border-t pt-3">
        {order.items?.map((item, idx) => (
          <div key={idx}>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-primary min-w-[1.5rem]">{item.quantity}×</span>
              <span className="font-semibold text-sm">{item.name}</span>
            </div>
            {item.notes && (
              <p className="ml-8 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-0.5 italic">
                ↳ {item.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Order Notes */}
      {order.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs text-amber-800">
          <span className="font-semibold">Note: </span>{order.notes}
        </div>
      )}

      {/* Actions */}
      <div className="pt-1 space-y-2">
        {isPending && (
          <Button
            onClick={() => onUpdateStatus(order.id, "preparing")}
            variant="outline"
            className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
            size="sm"
          >
            <ChefHat className="h-4 w-4 mr-2" /> Start Preparing
          </Button>
        )}
        {isPreparing && (
          <Button
            onClick={handleMarkReady}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            size="sm"
          >
            <Bell className="h-4 w-4 mr-2" /> Mark as Ready
          </Button>
        )}
        {isReady && (
          <Button
            onClick={() => onUpdateStatus(order.id, "served")}
            variant="outline"
            className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            size="sm"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Served
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadOrders = useCallback(async () => {
    const data = await base44.entities.Order.list("-created_date", 100);
    setOrders(data.filter(o => ["pending", "preparing", "ready"].includes(o.status)));
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();
    const unsubscribe = base44.entities.Order.subscribe((event) => {
      if (event.type === "create" && ["pending", "preparing", "ready"].includes(event.data.status)) {
        setOrders(prev => [event.data, ...prev]);
        toast.info(`🆕 New order: ${event.data.order_number}`, { duration: 4000 });
      } else if (event.type === "update") {
        setOrders(prev =>
          prev
            .map(o => o.id === event.id ? event.data : o)
            .filter(o => ["pending", "preparing", "ready"].includes(o.status))
        );
      } else if (event.type === "delete") {
        setOrders(prev => prev.filter(o => o.id !== event.id));
      }
      setLastUpdated(new Date());
    });
    return () => unsubscribe();
  }, [loadOrders]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    await base44.entities.Order.update(orderId, { status: newStatus });
  };

  const pending = orders.filter(o => o.status === "pending");
  const preparing = orders.filter(o => o.status === "preparing");
  const ready = orders.filter(o => o.status === "ready");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const SectionHeader = ({ label, count, color, dot }) => (
    <div className="flex items-center gap-2 mb-4">
      <span className={cn("w-3 h-3 rounded-full", dot)} />
      <h2 className={cn("font-heading text-lg font-bold", color)}>{label}</h2>
      <span className="ml-auto bg-secondary text-foreground text-xs font-bold px-2.5 py-0.5 rounded-full">
        {count}
      </span>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 min-h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Utensils className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold">Kitchen Display</h1>
            <p className="text-xs text-muted-foreground">
              {orders.length} active · Live · Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadOrders}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-20 w-20 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <h3 className="font-heading text-xl font-semibold mb-1">Kitchen is clear!</h3>
          <p className="text-muted-foreground text-sm">New orders will appear here in real-time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div>
            <SectionHeader label="New Orders" count={pending.length} color="text-amber-600" dot="bg-amber-400" />
            <div className="space-y-3">
              {pending.length === 0 ? (
                <div className="border border-dashed rounded-xl p-6 text-center text-sm text-muted-foreground">No new orders</div>
              ) : pending.map(o => (
                <OrderCard key={o.id} order={o} onUpdateStatus={handleUpdateStatus} />
              ))}
            </div>
          </div>

          {/* Preparing Column */}
          <div>
            <SectionHeader label="Preparing" count={preparing.length} color="text-blue-600" dot="bg-blue-400" />
            <div className="space-y-3">
              {preparing.length === 0 ? (
                <div className="border border-dashed rounded-xl p-6 text-center text-sm text-muted-foreground">Nothing preparing</div>
              ) : preparing.map(o => (
                <OrderCard key={o.id} order={o} onUpdateStatus={handleUpdateStatus} />
              ))}
            </div>
          </div>

          {/* Ready Column */}
          <div>
            <SectionHeader label="Ready to Serve" count={ready.length} color="text-emerald-600" dot="bg-emerald-400" />
            <div className="space-y-3">
              {ready.length === 0 ? (
                <div className="border border-dashed rounded-xl p-6 text-center text-sm text-muted-foreground">Nothing ready yet</div>
              ) : ready.map(o => (
                <OrderCard key={o.id} order={o} onUpdateStatus={handleUpdateStatus} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}