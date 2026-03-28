import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, UtensilsCrossed, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmptyState from "../components/EmptyState";
import CategoryForm from "../components/menu/CategoryForm";
import MenuItemCard from "../components/menu/MenuItemCard";

export default function MenuManagement() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [itemDialog, setItemDialog] = useState(false);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: "", description: "", price: "", category_id: "", 
    image_url: "", preparation_time: "15", is_available: true
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [cats, menuItems] = await Promise.all([
      base44.entities.MenuCategory.list("sort_order"),
      base44.entities.MenuItem.list("name"),
    ]);
    setCategories(cats);
    setItems(menuItems);
    setLoading(false);
  };

  const handleSaveItem = async () => {
    const data = {
      ...itemForm,
      price: parseFloat(itemForm.price),
      preparation_time: parseInt(itemForm.preparation_time),
    };
    if (editingItem) {
      await base44.entities.MenuItem.update(editingItem.id, data);
    } else {
      await base44.entities.MenuItem.create(data);
    }
    setItemDialog(false);
    setEditingItem(null);
    resetItemForm();
    loadData();
  };

  const handleDeleteItem = async (id) => {
    await base44.entities.MenuItem.delete(id);
    loadData();
  };

  const handleToggleAvailability = async (item) => {
    await base44.entities.MenuItem.update(item.id, { is_available: !item.is_available });
    loadData();
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name, description: item.description || "", 
      price: String(item.price), category_id: item.category_id,
      image_url: item.image_url || "", preparation_time: String(item.preparation_time || 15),
      is_available: item.is_available !== false
    });
    setItemDialog(true);
  };

  const resetItemForm = () => {
    setItemForm({ name: "", description: "", price: "", category_id: "", image_url: "", preparation_time: "15", is_available: true });
  };

  const filteredItems = selectedCategory === "all" 
    ? items 
    : items.filter(i => i.category_id === selectedCategory);

  const getCategoryName = (catId) => categories.find(c => c.id === catId)?.name || "Uncategorized";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl lg:text-4xl font-bold">Menu</h1>
          <p className="text-muted-foreground mt-1">{items.length} items across {categories.length} categories</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setEditingCategory(null)}>
                <Plus className="h-4 w-4 mr-2" /> Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading">
                  {editingCategory ? "Edit Category" : "New Category"}
                </DialogTitle>
              </DialogHeader>
              <CategoryForm
                category={editingCategory}
                onSave={() => { setCategoryDialog(false); setEditingCategory(null); loadData(); }}
                onCancel={() => setCategoryDialog(false)}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={itemDialog} onOpenChange={(open) => { setItemDialog(open); if (!open) { setEditingItem(null); resetItemForm(); } }}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingItem(null); resetItemForm(); }}>
                <Plus className="h-4 w-4 mr-2" /> Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-heading">{editingItem ? "Edit Item" : "New Menu Item"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Name</Label>
                    <Input value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} placeholder="e.g. Margherita Pizza" />
                  </div>
                  <div>
                    <Label>Price ($)</Label>
                    <Input type="number" step="0.01" value={itemForm.price} onChange={e => setItemForm({ ...itemForm, price: e.target.value })} placeholder="0.00" />
                  </div>
                  <div>
                    <Label>Prep Time (min)</Label>
                    <Input type="number" value={itemForm.preparation_time} onChange={e => setItemForm({ ...itemForm, preparation_time: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <Label>Category</Label>
                    <Select value={itemForm.category_id} onValueChange={v => setItemForm({ ...itemForm, category_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Description</Label>
                    <Textarea value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} placeholder="Brief description..." rows={2} />
                  </div>
                  <div className="col-span-2">
                    <Label>Image URL</Label>
                    <Input value={itemForm.image_url} onChange={e => setItemForm({ ...itemForm, image_url: e.target.value })} placeholder="https://..." />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => { setItemDialog(false); setEditingItem(null); resetItemForm(); }}>Cancel</Button>
                  <Button onClick={handleSaveItem} disabled={!itemForm.name || !itemForm.price || !itemForm.category_id}>
                    {editingItem ? "Update" : "Create"} Item
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          All Items
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No menu items yet"
          description="Add your first menu item to get started. Create categories first, then add items to them."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <MenuItemCard
              key={item.id}
              item={item}
              categoryName={getCategoryName(item.category_id)}
              onEdit={() => openEditItem(item)}
              onDelete={() => handleDeleteItem(item.id)}
              onToggle={() => handleToggleAvailability(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}