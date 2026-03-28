import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChefHat, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderStatusBadge from "../components/OrderStatusBadge";
import EmptyState from "../components/EmptyState";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    const data = await base44.entities.Order.list("-created_date", 50);
    setOrders(data.filter(o => o.status === "pending" || o.status === "preparing" || o.status === "ready"));
    setLoading(false);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    await base44.entities.Order.update(orderId, { status: newStatus });
    loadOrders();
  };

  const pendingOrders = orders.filter(o => o.status === "pending");
  const preparingOrders = orders.filter(o => o.status === "preparing");
  const readyOrders = orders.filter(o => o.status === "ready");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const KitchenColumn = ({ title, icon: Icon, orders: columnOrders, color, nextStatus, nextLabel }) => (
    <div className="flex-1 min-w-[300px]">
      <div className="flex items-center gap-2 mb-4 px-1">
        <Icon className={cn("h-5 w-5", color)} />
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        <span className="ml-auto bg-secondary px-2.5 py-0.5 rounded-full text-xs font-bold">
          {columnOrders.length}
        </span>
      </div>
      <div className="space-y-3">
        {columnOrders.length === 0 ? (
          <div className="bg-card border border-dashed rounded-xl p-8 text-center text-sm text-muted-foreground">
            No orders
          </div>
        ) : (
          columnOrders.map(order => (
            <div key={order.id} className="bg-card border rounded-xl p-4 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-primary">
                    #{order.table_number || "—"}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">{order.order_number}</span>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(order.created_date), { addSuffix: false })}
                </span>
              </div>
              <div className="space-y-1.5">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-primary/80">{item.quantity}×</span>
                    <span className="font-medium">{item.name}</span>
                    {item.notes && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded italic ml-auto">
                        {item.notes}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {order.notes && (
                <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg">
                  Note: {order.notes}
                </p>
              )}
              {nextStatus && (
                <Button
                  onClick={() => handleUpdateStatus(order.id, nextStatus)}
                  className="w-full"
                  variant={nextStatus === "ready" ? "default" : "outline"}
                  size="sm"
                >
                  {nextLabel} <ArrowRight className="h-3.5 w-3.5 ml-2" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Kitchen Display</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {orders.length} active orders · Auto-refreshes every 15s
          </p>
        </div>
        <Button variant="outline" onClick={loadOrders} size="sm">
          Refresh
        </Button>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title="Kitchen is clear"
          description="No active orders right now. New orders will appear here automatically."
        />
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4">
          <KitchenColumn
            title="New Orders"
            icon={Clock}
            orders={pendingOrders}
            color="text-amber-500"
            nextStatus="preparing"
            nextLabel="Start Preparing"
          />
          <KitchenColumn
            title="Preparing"
            icon={ChefHat}
            orders={preparingOrders}
            color="text-blue-500"
            nextStatus="ready"
            nextLabel="Mark Ready"
          />
          <KitchenColumn
            title="Ready to Serve"
            icon={CheckCircle2}
            orders={readyOrders}
            color="text-emerald-500"
            nextStatus="served"
            nextLabel="Mark Served"
          />
        </div>
      )}
    </div>
  );
}