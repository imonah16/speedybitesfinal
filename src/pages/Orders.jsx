import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ShoppingCart, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import OrderStatusBadge from "../components/OrderStatusBadge";
import EmptyState from "../components/EmptyState";
import OrderDetailSheet from "../components/orders/OrderDetailSheet";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    const data = await base44.entities.Order.list("-created_date", 100);
    setOrders(data);
    setLoading(false);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    await base44.entities.Order.update(orderId, { status: newStatus });
    loadOrders();
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handleUpdatePayment = async (orderId, paymentStatus, paymentMethod) => {
    await base44.entities.Order.update(orderId, { payment_status: paymentStatus, payment_method: paymentMethod });
    loadOrders();
  };

  const filtered = orders.filter(o => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return o.order_number?.toLowerCase().includes(q) || 
             o.customer_name?.toLowerCase().includes(q) ||
             String(o.table_number).includes(q);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl lg:text-4xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} orders</p>
        </div>
        <Link to="/new-order">
          <Button>
            <ShoppingCart className="h-4 w-4 mr-2" /> New Order
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="served">Served</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No orders found"
          description={orders.length === 0 ? "Create your first order to get started." : "Try adjusting your filters."}
        />
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="divide-y">
            {filtered.map(order => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="w-full flex items-center justify-between p-4 lg:p-5 hover:bg-secondary/50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center font-heading font-bold text-primary text-sm">
                    #{order.table_number || "—"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{order.order_number}</p>
                      {order.customer_name && (
                        <span className="text-xs text-muted-foreground">• {order.customer_name}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.items?.length || 0} items · {format(new Date(order.created_date), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-heading font-bold hidden sm:block">£{(order.total || 0).toFixed(2)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailSheet
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
          onUpdatePayment={handleUpdatePayment}
        />
      )}
    </div>
  );
}