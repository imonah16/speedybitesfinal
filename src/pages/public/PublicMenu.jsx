import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function PublicMenu() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("all");

  useEffect(() => {
    Promise.all([
      base44.entities.MenuCategory.list("sort_order"),
      base44.entities.MenuItem.list("name"),
    ]).then(([cats, menuItems]) => {
      setCategories(cats.filter(c => c.is_active !== false));
      setItems(menuItems.filter(i => i.is_available !== false));
      setLoading(false);
    });
  }, []);

  const filtered = selected === "all"
    ? [...items].sort((a, b) => {
        const catA = categories.findIndex(c => c.id === a.category_id);
        const catB = categories.findIndex(c => c.id === b.category_id);
        return catA - catB;
      })
    : items.filter(i => i.category_id === selected);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="font-heading text-4xl font-bold mb-2">Our Menu</h1>
        <p className="text-muted-foreground">Fresh, delicious food made to order</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 justify-center flex-wrap">
        <button
          onClick={() => setSelected("all")}
          className={cn("px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
            selected === "all" ? "bg-primary text-primary-foreground shadow" : "bg-secondary hover:bg-secondary/80"
          )}
        >All</button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelected(cat.id)}
            className={cn("px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              selected === cat.id ? "bg-primary text-primary-foreground shadow" : "bg-secondary hover:bg-secondary/80"
            )}
          >{cat.icon} {cat.name}</button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(item => (
          <div key={item.id} className="bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group">
            {item.image_url ? (
              <div className="h-44 overflow-hidden">
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            ) : (
              <div className="h-32 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <span className="text-5xl opacity-30">🍽️</span>
              </div>
            )}
            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{item.name}</h3>
                <span className="font-heading font-bold text-primary text-lg">£{item.price?.toFixed(2)}</span>
              </div>
              {item.description && <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>}
              <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                <Clock className="h-3 w-3" /> {item.preparation_time || 15} min
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link to="/order">
          <Button size="lg" className="h-12 px-10 shadow-lg shadow-primary/20">Place an Order</Button>
        </Link>
      </div>
    </div>
  );
}