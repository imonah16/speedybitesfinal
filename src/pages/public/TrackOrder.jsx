import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Clock, ChefHat, Bell, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const steps = [
  { key: "pending",   label: "Order Received",  icon: Clock,         description: "We've received your order and it's in the queue." },
  { key: "preparing", label: "Preparing",        icon: ChefHat,       description: "Our kitchen is preparing your food." },
  { key: "ready",     label: "Ready",            icon: Bell,          description: "Your order is ready! We're bringing it to you." },
  { key: "served",    label: "Served",           icon: CheckCircle2,  description: "Enjoy your meal!" },
];

const stepIndex = (status) => steps.findIndex(s => s.key === status);

export default function TrackOrder() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlOrder = urlParams.get("order") || "";
  const [query, setQuery] = useState(urlOrder);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrder = async (orderNum) => {
    const num = (orderNum || query).trim().toUpperCase();
    if (!num) return;
    setLoading(true);
    setError("");
    const results = await base44.entities.Order.filter({ order_number: num });
    if (results.length === 0) {
      setError("No order found with that number. Please check and try again.");
      setOrder(null);
    } else {
      setOrder(results[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (urlOrder) fetchOrder(urlOrder);
  }, []);

  useEffect(() => {
    if (!order) return;
    if (order.status === "served" || order.status === "cancelled") return;
    const interval = setInterval(() => fetchOrder(order.order_number), 15000);
    return () => clearInterval(interval);
  }, [order]);

  const handleSearch = async (e) => {
    e.preventDefault();
    fetchOrder(query);
  };

  const currentStep = order ? stepIndex(order.status) : -1;
  const isCancelled = order?.status === "cancelled";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl font-bold mb-2">Track Your Order</h1>
          <p className="text-muted-foreground">Enter your order number to see its current status.</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. ORD-MO7FFHTS"
            className="h-12 text-base"
          />
          <Button type="submit" disabled={loading} className="h-12 px-6">
            {loading
              ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              : <><Search className="h-4 w-4 mr-2" />Track</>
            }
          </Button>
        </form>

        {error && (
          <div className="text-center text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6">
            {error}
          </div>
        )}

        {order && (
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            {/* Order Header */}
            <div className="p-6 border-b bg-secondary/30">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Order Number</p>
                  <p className="font-heading text-2xl font-bold">{order.order_number}</p>
                </div>
                <div className="text-right">
                  {order.customer_name && <p className="font-semibold">{order.customer_name}</p>}
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(order.created_date), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-3 flex-wrap">
                <span className="text-xs px-3 py-1 rounded-full bg-secondary border font-medium">
                  {order.order_type === "takeaway" ? "🥡 Takeaway" : "🪑 Dine In"}
                  {order.table_number ? ` · Table ${order.table_number}` : ""}
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-secondary border font-medium">
                  £{(order.total || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Status Tracker */}
            <div className="p-6">
              {isCancelled ? (
                <div className="flex flex-col items-center py-6 text-center gap-3">
                  <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <XCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <p className="font-heading text-xl font-bold text-destructive">Order Cancelled</p>
                  <p className="text-muted-foreground text-sm">This order has been cancelled. Please contact staff if you need help.</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {steps.map((step, idx) => {
                    const isCompleted = idx < currentStep;
                    const isActive = idx === currentStep;
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="flex gap-4">
                        {/* Icon + Line */}
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-all",
                            isCompleted ? "bg-primary border-primary text-primary-foreground" :
                            isActive    ? "bg-primary/10 border-primary text-primary animate-pulse" :
                                          "bg-secondary border-border text-muted-foreground"
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          {idx < steps.length - 1 && (
                            <div className={cn(
                              "w-0.5 flex-1 my-1 min-h-[2rem]",
                              isCompleted ? "bg-primary" : "bg-border"
                            )} />
                          )}
                        </div>

                        {/* Text */}
                        <div className="pb-6 pt-1.5">
                          <p className={cn(
                            "font-semibold text-sm",
                            isActive ? "text-primary" :
                            isCompleted ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {step.label}
                            {isActive && <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Current</span>}
                          </p>
                          {(isActive || isCompleted) && (
                            <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Items */}
            <div className="px-6 pb-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Your Items</p>
              <div className="space-y-2">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm bg-secondary/50 rounded-lg px-3 py-2">
                    <span>{item.quantity}× {item.name}</span>
                    <span className="font-semibold">£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}