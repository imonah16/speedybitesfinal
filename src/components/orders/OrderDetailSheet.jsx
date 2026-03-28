import { X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OrderStatusBadge from "../OrderStatusBadge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const statusFlow = ["pending", "preparing", "ready", "served"];

export default function OrderDetailSheet({ order, onClose, onUpdateStatus, onUpdatePayment }) {
  const currentIdx = statusFlow.indexOf(order.status);
  const nextStatus = currentIdx >= 0 && currentIdx < statusFlow.length - 1 ? statusFlow[currentIdx + 1] : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-full max-w-lg bg-card shadow-2xl overflow-y-auto animate-in slide-in-from-right"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card z-10 flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="font-heading text-xl font-bold">{order.order_number}</h2>
            <p className="text-sm text-muted-foreground">
              {format(new Date(order.created_date), "MMMM d, yyyy · h:mm a")}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status + Info */}
          <div className="flex items-center gap-4 flex-wrap">
            <OrderStatusBadge status={order.status} />
            {order.table_number && (
              <span className="text-sm text-muted-foreground">Table {order.table_number}</span>
            )}
            {order.customer_name && (
              <span className="text-sm text-muted-foreground">{order.customer_name}</span>
            )}
          </div>

          {/* Status Actions */}
          {nextStatus && order.status !== "cancelled" && (
            <Button
              onClick={() => onUpdateStatus(order.id, nextStatus)}
              className="w-full h-11 shadow-md shadow-primary/10"
            >
              Move to {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          {order.status !== "cancelled" && order.status !== "served" && (
            <Button
              variant="outline"
              onClick={() => onUpdateStatus(order.id, "cancelled")}
              className="w-full text-destructive border-destructive/20 hover:bg-destructive/5"
            >
              Cancel Order
            </Button>
          )}

          {/* Items */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 px-3 bg-secondary/50 rounded-lg">
                  <div>
                    <span className="font-medium text-sm">{item.quantity}× {item.name}</span>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground italic mt-0.5">{item.notes}</p>
                    )}
                  </div>
                  <span className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${(order.subtotal || 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${(order.tax || 0).toFixed(2)}</span></div>
            <div className="flex justify-between font-heading font-bold text-lg pt-2 border-t">
              <span>Total</span><span className="text-primary">${(order.total || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="border-t pt-4 space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Payment</h3>
            <div className="flex gap-3">
              <Select
                value={order.payment_status || "unpaid"}
                onValueChange={v => onUpdatePayment(order.id, v, order.payment_method)}
              >
                <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={order.payment_method || "cash"}
                onValueChange={v => onUpdatePayment(order.id, order.payment_status, v)}
              >
                <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {order.notes && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">Notes</h3>
              <p className="text-sm bg-secondary/50 p-3 rounded-lg">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}