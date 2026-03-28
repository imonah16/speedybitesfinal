import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart3, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import StatCard from "../components/StatCard";
import { format, subDays, startOfDay, isAfter } from "date-fns";

const COLORS = ["hsl(24, 70%, 45%)", "hsl(16, 80%, 52%)", "hsl(142, 60%, 40%)", "hsl(200, 65%, 45%)", "hsl(280, 55%, 50%)"];

export default function Analytics() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await base44.entities.Order.list("-created_date", 200);
      setOrders(data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const validOrders = orders.filter(o => o.status !== "cancelled");
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

  // Revenue by day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayStart = startOfDay(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const dayOrders = validOrders.filter(o => {
      const d = new Date(o.created_date);
      return d >= dayStart && d < dayEnd;
    });
    return {
      day: format(date, "EEE"),
      date: format(date, "MMM d"),
      revenue: dayOrders.reduce((s, o) => s + (o.total || 0), 0),
      orders: dayOrders.length,
    };
  });

  // Popular items
  const itemCounts = {};
  validOrders.forEach(o => {
    o.items?.forEach(item => {
      if (!itemCounts[item.name]) itemCounts[item.name] = { name: item.name, quantity: 0, revenue: 0 };
      itemCounts[item.name].quantity += item.quantity;
      itemCounts[item.name].revenue += item.price * item.quantity;
    });
  });
  const topItems = Object.values(itemCounts).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  // Status distribution
  const statusCounts = {};
  orders.forEach(o => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Payment methods
  const paymentCounts = {};
  validOrders.forEach(o => {
    const method = o.payment_method || "cash";
    paymentCounts[method] = (paymentCounts[method] || 0) + 1;
  });
  const paymentData = Object.entries(paymentCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-3xl lg:text-4xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Business insights and performance metrics</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`£${totalRevenue.toFixed(2)}`} icon={DollarSign} trend="up" />
        <StatCard title="Total Orders" value={validOrders.length} icon={ShoppingCart} />
        <StatCard title="Avg Order Value" value={`£${avgOrderValue.toFixed(2)}`} icon={TrendingUp} />
        <StatCard title="Items Sold" value={Object.values(itemCounts).reduce((s, i) => s + i.quantity, 0)} icon={BarChart3} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="font-heading text-lg font-semibold mb-4">Revenue (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 15%, 88%)" />
              <XAxis dataKey="day" fontSize={12} tick={{ fill: "hsl(20, 10%, 45%)" }} />
              <YAxis fontSize={12} tick={{ fill: "hsl(20, 10%, 45%)" }} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid hsl(30, 15%, 88%)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                formatter={(value) => [`£${value.toFixed(2)}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="hsl(24, 70%, 45%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Trend */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="font-heading text-lg font-semibold mb-4">Orders Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 15%, 88%)" />
              <XAxis dataKey="day" fontSize={12} tick={{ fill: "hsl(20, 10%, 45%)" }} />
              <YAxis fontSize={12} tick={{ fill: "hsl(20, 10%, 45%)" }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(30, 15%, 88%)" }} />
              <Line type="monotone" dataKey="orders" stroke="hsl(16, 80%, 52%)" strokeWidth={3} dot={{ fill: "hsl(16, 80%, 52%)", r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Items */}
        <div className="lg:col-span-2 bg-card border rounded-xl p-6">
          <h3 className="font-heading text-lg font-semibold mb-4">Top Selling Items</h3>
          {topItems.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topItems.map((item, i) => (
                <div key={item.name} className="flex items-center gap-4">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{item.name}</span>
                      <span className="text-sm text-muted-foreground">{item.quantity} sold · £{item.revenue.toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(item.quantity / topItems[0].quantity) * 100}%`,
                          backgroundColor: COLORS[i % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="font-heading text-lg font-semibold mb-4">Payment Methods</h3>
          {paymentData.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                    {paymentData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {paymentData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="capitalize">{d.name}</span>
                    </div>
                    <span className="font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}