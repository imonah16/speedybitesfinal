import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Grid3X3, Plus, Users, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmptyState from "../components/EmptyState";
import { cn } from "@/lib/utils";

const statusColors = {
  available: "bg-emerald-50 border-emerald-200 text-emerald-800",
  occupied: "bg-primary/5 border-primary/20 text-primary",
  reserved: "bg-amber-50 border-amber-200 text-amber-800",
  maintenance: "bg-slate-100 border-slate-200 text-slate-600",
};

const statusDots = {
  available: "bg-emerald-500",
  occupied: "bg-primary",
  reserved: "bg-amber-500",
  maintenance: "bg-slate-400",
};

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ table_number: "", capacity: "4", location: "indoor", status: "available" });

  useEffect(() => { loadTables(); }, []);

  const loadTables = async () => {
    const data = await base44.entities.RestaurantTable.list("table_number");
    setTables(data);
    setLoading(false);
  };

  const handleSave = async () => {
    const data = { ...form, table_number: parseInt(form.table_number), capacity: parseInt(form.capacity) };
    if (editing) {
      await base44.entities.RestaurantTable.update(editing.id, data);
    } else {
      await base44.entities.RestaurantTable.create(data);
    }
    setDialogOpen(false);
    setEditing(null);
    setForm({ table_number: "", capacity: "4", location: "indoor", status: "available" });
    loadTables();
  };

  const handleDelete = async (id) => {
    await base44.entities.RestaurantTable.delete(id);
    loadTables();
  };

  const handleStatusChange = async (table, newStatus) => {
    await base44.entities.RestaurantTable.update(table.id, { status: newStatus });
    loadTables();
  };

  const openEdit = (table) => {
    setEditing(table);
    setForm({
      table_number: String(table.table_number),
      capacity: String(table.capacity),
      location: table.location || "indoor",
      status: table.status || "available",
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const summary = {
    available: tables.filter(t => t.status === "available").length,
    occupied: tables.filter(t => t.status === "occupied").length,
    reserved: tables.filter(t => t.status === "reserved").length,
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl lg:text-4xl font-bold">Tables</h1>
          <p className="text-muted-foreground mt-1">
            {summary.available} available · {summary.occupied} occupied · {summary.reserved} reserved
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditing(null); setForm({ table_number: "", capacity: "4", location: "indoor", status: "available" }); } }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm({ table_number: "", capacity: "4", location: "indoor", status: "available" }); }}>
              <Plus className="h-4 w-4 mr-2" /> Add Table
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">{editing ? "Edit Table" : "Add New Table"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Table Number</Label>
                  <Input type="number" value={form.table_number} onChange={e => setForm({ ...form, table_number: e.target.value })} />
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
                </div>
                <div>
                  <Label>Location</Label>
                  <Select value={form.location} onValueChange={v => setForm({ ...form, location: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indoor">Indoor</SelectItem>
                      <SelectItem value="outdoor">Outdoor</SelectItem>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={!form.table_number}>
                  {editing ? "Update" : "Create"} Table
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {tables.length === 0 ? (
        <EmptyState
          icon={Grid3X3}
          title="No tables configured"
          description="Add your restaurant tables to start managing seating and orders."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tables.map(table => (
            <div
              key={table.id}
              className={cn(
                "rounded-xl border-2 p-5 transition-all duration-200 hover:shadow-lg relative group",
                statusColors[table.status] || statusColors.available
              )}
            >
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => openEdit(table)} className="p-1 rounded hover:bg-white/50">
                  <Pencil className="h-3 w-3" />
                </button>
                <button onClick={() => handleDelete(table.id)} className="p-1 rounded hover:bg-red-100">
                  <Trash2 className="h-3 w-3 text-red-500" />
                </button>
              </div>
              <div className="text-center space-y-2">
                <div className="font-heading text-3xl font-bold">{table.table_number}</div>
                <div className="flex items-center justify-center gap-1.5 text-xs">
                  <Users className="h-3 w-3" />
                  {table.capacity} seats
                </div>
                <div className="text-xs capitalize opacity-75">{table.location}</div>
                <div className="flex items-center justify-center gap-1.5">
                  <span className={cn("w-2 h-2 rounded-full", statusDots[table.status])} />
                  <span className="text-xs font-medium capitalize">{table.status}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-current/10">
                <Select
                  value={table.status}
                  onValueChange={v => handleStatusChange(table, v)}
                >
                  <SelectTrigger className="h-8 text-xs bg-white/50 border-current/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}