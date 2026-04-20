import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Minus, Plus, ShoppingCart, X, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function PublicOrder() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [tableId, setTableId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [orderType, setOrderType] = useState("dine_in");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    Promise.all([
      base44.entities.MenuCategory.list("sort_order"),
      base44.entities.MenuItem.list("name"),
      base44.entities.RestaurantTable.list("table_number"),
    ]).then(([cats, menuItems, tableData]) => {
      setCategories(cats.filter(c => c.is_active !== false));
      setItems(menuItems.filter(i => i.is_available !== false));
      setTables(tableData.filter(t => t.status === "available"));
      setLoading(false);
    });
  }, []);

  const addToCart = (item) => {
    const existing = cart.find(c => c.menu_item_id === item.id);
    if (existing) {
      setCart(cart.map(c => c.menu_item_id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { menu_item_id: item.id, name: item.name, price: item.price, quantity: 1, notes: "" }]);
    }
  };

  const updateQuantity = (menuItemId, delta) => {
    setCart(cart.map(c => {
      if (c.menu_item_id === menuItemId) {
        const newQty = c.quantity + delta;
        return newQty <= 0 ? null : { ...c, quantity: newQty };
      }
      return c;
    }).filter(Boolean));
  };

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const selectedTable = tables.find(t => t.id === tableId);

  const handleSubmit = async () => {
    setSubmitting(true);
    const num = `ORD-${Date.now().toString(36).toUpperCase()}`;

    await base44.entities.Order.create({
      order_number: num,
      order_type: orderType,
      table_id: orderType === "dine_in" ? (tableId || undefined) : undefined,
      table_number: orderType === "dine_in" ? selectedTable?.table_number : undefined,
      status: "pending",
      items: cart,
      subtotal, tax, total,
      notes: orderNotes,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      payment_status: "unpaid",
      payment_method: "cash",
    });
    if (tableId) await base44.entities.RestaurantTable.update(tableId, { status: "occupied" });

    setOrderNumber(num);
    setSubmitted(true);
    setSubmitting(false);
  };

  const filteredItems = selectedCategory === "all" ? items : items.filter(i => i.category_id === selectedCategory);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (submitted) return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
      </div>
      <h2 className="font-heading text-3xl font-bold mb-2">Order Received!</h2>
      <p className="text-muted-foreground mb-1">Your order <span className="font-semibold text-foreground">{orderNumber}</span> has been placed.</p>
      <p className="text-muted-foreground mb-2">We'll start preparing it right away!</p>
      <p className="text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-8">💵 Please pay cash when your order is ready.</p>
      <Button onClick={() => {
        setSubmitted(false); setCart([]); setCustomerName(""); setCustomerEmail(""); setCustomerPhone(""); setOrderNotes(""); setTableId("");
      }}>
        Place Another Order
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Menu Side */}
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl font-bold mb-6">Place an Order</h1>

          {/* Order Type Toggle */}
          <div className="flex bg-secondary rounded-xl p-1 mb-6 w-fit">
            {[["dine_in", "🪑 Dine In"], ["takeaway", "🥡 Takeaway"]].map(([val, label]) => (
              <button key={val} onClick={() => setOrderType(val)}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${orderType === val ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-5">
            <button onClick={() => setSelectedCategory("all")}
              className={cn("px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === "all" ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80")}>
              All
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                className={cn("px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80")}>
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredItems.map(item => {
              const inCart = cart.find(c => c.menu_item_id === item.id);
              return (
                <button key={item.id} onClick={() => addToCart(item)}
                  className={cn("text-left p-4 rounded-xl border transition-all hover:shadow-md",
                    inCart ? "border-primary bg-primary/5 shadow-sm" : "bg-card hover:border-primary/30")}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                      {item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>}
                    </div>
                    <span className="font-heading font-bold text-primary">£{item.price.toFixed(2)}</span>
                  </div>
                  {inCart && (
                    <div className="mt-2 flex justify-end">
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">×{inCart.quantity}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cart Side */}
      <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l bg-card flex flex-col">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold">Your Order</h2>
          <ShoppingCart className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {orderType === "dine_in" && (
            <div>
              <Label className="text-xs">Table</Label>
              <Select value={tableId} onValueChange={setTableId}>
                <SelectTrigger><SelectValue placeholder="Select table" /></SelectTrigger>
                <SelectContent>
                  {tables.map(t => (
                    <SelectItem key={t.id} value={t.id}>Table {t.table_number} ({t.capacity} seats)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label className="text-xs">Your Name</Label>
            <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder={orderType === "takeaway" ? "Name for collection" : "Optional"} />
          </div>
          <div>
            <Label className="text-xs">Email Address</Label>
            <Input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="your@email.com" />
          </div>
          <div>
            <Label className="text-xs">Phone Number</Label>
            <Input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="e.g. 07400 123456" />
          </div>

          {cart.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">Tap items to add them to your order</div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.menu_item_id} className="bg-secondary/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{item.name}</span>
                    <button onClick={() => updateQuantity(item.menu_item_id, -item.quantity)}>
                      <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.menu_item_id, -1)} className="h-7 w-7 rounded-md border flex items-center justify-center hover:bg-background transition-colors">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-semibold text-sm w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.menu_item_id, 1)} className="h-7 w-7 rounded-md border flex items-center justify-center hover:bg-background transition-colors">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="font-semibold text-sm">£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <Label className="text-xs">Special Requests</Label>
            <Textarea value={orderNotes} onChange={e => setOrderNotes(e.target.value)} placeholder="Any allergies or special requests..." rows={2} />
          </div>
        </div>

        <div className="p-6 border-t space-y-3 bg-card">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax (8%)</span><span>£{tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-heading font-bold text-lg pt-2 border-t">
              <span>Total</span><span className="text-primary">£{total.toFixed(2)}</span>
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={cart.length === 0 || submitting} className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20">
            {submitting
              ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              : <><ChevronRight className="h-4 w-4 mr-2" /> Place Order (Pay Cash)</>
            }
          </Button>
        </div>
      </div>
    </div>
  );
}