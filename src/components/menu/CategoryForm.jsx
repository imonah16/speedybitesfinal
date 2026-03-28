import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CategoryForm({ category, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: category?.name || "",
    description: category?.description || "",
    icon: category?.icon || "🍽️",
    sort_order: category?.sort_order || 0,
  });

  const handleSubmit = async () => {
    if (category) {
      await base44.entities.MenuCategory.update(category.id, form);
    } else {
      await base44.entities.MenuCategory.create(form);
    }
    onSave();
  };

  const emojiOptions = ["🍽️", "🍕", "🍔", "🥗", "🍝", "🍣", "🥩", "🍰", "☕", "🍷", "🥤", "🍜"];

  return (
    <div className="space-y-4 mt-4">
      <div>
        <Label>Category Name</Label>
        <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Appetizers" />
      </div>
      <div>
        <Label>Icon</Label>
        <div className="flex gap-2 flex-wrap mt-2">
          {emojiOptions.map(emoji => (
            <button
              key={emoji}
              onClick={() => setForm({ ...form, icon: emoji })}
              className={`w-10 h-10 rounded-lg text-lg flex items-center justify-center transition-all ${
                form.icon === emoji ? "bg-primary text-primary-foreground scale-110" : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description..." rows={2} />
      </div>
      <div>
        <Label>Sort Order</Label>
        <Input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!form.name}>
          {category ? "Update" : "Create"} Category
        </Button>
      </div>
    </div>
  );
}