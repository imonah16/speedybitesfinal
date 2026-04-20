import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const statusConfig = {
  available: { label: "Available", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  occupied: { label: "Occupied", color: "bg-red-100 text-red-700 border-red-200" },
  reserved: { label: "Reserved", color: "bg-amber-100 text-amber-700 border-amber-200" },
  maintenance: { label: "Unavailable", color: "bg-slate-100 text-slate-600 border-slate-200" },
};

export default function PublicTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.RestaurantTable.list("table_number").then(data => {
      setTables(data);
      setLoading(false);
    });
  }, []);

  const available = tables.filter(t => t.status === "available").length;

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="font-heading text-4xl font-bold mb-2">Table Availability</h1>
        <p className="text-muted-foreground">
          {available > 0 ? `${available} table${available > 1 ? "s" : ""} available right now` : "No tables available at the moment"}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map(table => {
          const config = statusConfig[table.status] || statusConfig.available;
          return (
            <div key={table.id} className="bg-card border rounded-2xl p-5 text-center hover:shadow-md transition-shadow">
              <div className="font-heading text-3xl font-bold text-primary mb-1">{table.table_number}</div>
              <div className="text-xs text-muted-foreground mb-3">{table.capacity} seats · {table.location}</div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${config.color}`}>
                {config.label}
              </span>
            </div>
          );
        })}
      </div>

      {available > 0 && (
        <div className="text-center mt-12">
          <Link to="/order">
            <Button size="lg" className="h-12 px-10 shadow-lg shadow-primary/20">Order for a Table</Button>
          </Link>
        </div>
      )}
    </div>
  );
}