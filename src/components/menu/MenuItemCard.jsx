import { Pencil, Trash2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MenuItemCard({ item, categoryName, onEdit, onDelete, onToggle }) {
  return (
    <div className={cn(
      "bg-card border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg group",
      !item.is_available && "opacity-60"
    )}>
      {item.image_url ? (
        <div className="h-40 overflow-hidden">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="h-24 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
          <span className="text-4xl opacity-30">🍽️</span>
        </div>
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-xs text-muted-foreground">{categoryName}</p>
          </div>
          <span className="text-lg font-heading font-bold text-primary">${item.price?.toFixed(2)}</span>
        </div>
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {item.preparation_time || 15} min
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggle}
              className={cn(
                "px-2 py-1 rounded text-xs font-medium transition-colors",
                item.is_available !== false
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              )}
            >
              {item.is_available !== false ? "Available" : "Unavailable"}
            </button>
            <button onClick={onEdit} className="p-1.5 rounded hover:bg-secondary transition-colors">
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded hover:bg-red-50 transition-colors">
              <Trash2 className="h-3.5 w-3.5 text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}