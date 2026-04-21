import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { 
  DollarSign, ShoppingCart, Clock, CheckCircle2, 
  TrendingUp, ArrowRight, ChefHat 
} from "lucide-react";
import StatCard from "../components/StatCard";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { format } from "date-fns";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const orderData = await base44.entities.Order.list("-created_date", 50);
    setOrders(orderData);
    setLoading(false);
  };

  const todayOrders = orders.filter(o => {
    const created = new Date(o.created_date);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  });

  const todayRevenue = todayOrders
    .filter(o => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "preparing");
  const completedToday = todayOrders.filter(o => o.status === "served").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl lg:text-4xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={`£${todayRevenue.toFixed(2)}`}
          subtitle={`${todayOrders.length} orders today`}

          icon={DollarSign}
          trend="up"
        />
        <StatCard
          title="Active Orders"
          value={pendingOrders.length}
          subtitle="In progress"
          icon={Clock}
        />
        <StatCard
          title="Completed Today"
          value={completedToday}
          subtitle="Orders served"
          icon={CheckCircle2}
          trend="up"
        />
        <StatCard
          title="Total Orders"
          value={orders.length}
          subtitle="All time"
          icon={TrendingUp}
        />
      </div>

      {/* Quick Actions + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="font-heading text-xl font-semibold">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/new-order"
              className="flex items-center justify-between p-4 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-medium">New Order</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/kitchen"
              className="flex items-center justify-between p-4 bg-card border rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <ChefHat className="h-5 w-5 text-primary" />
                <span className="font-medium">Kitchen Display</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              to="/orders"
              className="flex items-center justify-between p-4 bg-card border rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-medium">View All Orders</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-primary font-medium hover:underline">
              View all
            </Link>
          </div>
          <div className="bg-card border rounded-xl overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No orders yet. Create your first order!
              </div>
            ) : (
              <div className="divide-y">
                {orders.slice(0, 6).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-heading font-bold text-primary">
                        #{order.table_number || "—"}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.items?.length || 0} items · {format(new Date(order.created_date), "h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-sm">£{(order.total || 0).toFixed(2)}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}