"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type Lead = {
  id: string;
  name: string;
  whatsapp: string;
  birthDate: string | null;
  acquisitionChannel: string | null;
  status: "new" | "repeat";
  interestedTreatment: string | null;
  bookingSuccess: boolean;
  createdAt: string;
};

export function LeadsTable({ leads, role }: { leads: Lead[]; role: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    birthDate: "",
    acquisitionChannel: "",
    status: "new" as "new" | "repeat",
    interestedTreatment: "",
    bookingSuccess: false,
  });

  function resetForm() {
    setForm({
      name: "",
      whatsapp: "",
      birthDate: "",
      acquisitionChannel: "",
      status: "new",
      interestedTreatment: "",
      bookingSuccess: false,
    });
    setEditing(null);
  }

  function openEdit(lead: Lead) {
    setEditing(lead);
    setForm({
      name: lead.name,
      whatsapp: lead.whatsapp,
      birthDate: lead.birthDate ? format(new Date(lead.birthDate), "yyyy-MM-dd") : "",
      acquisitionChannel: lead.acquisitionChannel || "",
      status: lead.status,
      interestedTreatment: lead.interestedTreatment || "",
      bookingSuccess: lead.bookingSuccess,
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = editing ? `/api/leads/${editing.id}` : "/api/leads";
    const method = editing ? "PUT" : "POST";
    const body = {
      ...form,
      birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : null,
    };
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    resetForm();
    setOpen(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this lead?")) return;
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger render={<Button>Add Lead</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Lead" : "New Lead"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input id="birthDate" type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acquisitionChannel">Acquisition Channel</Label>
                <Input id="acquisitionChannel" value={form.acquisitionChannel} onChange={(e) => setForm({ ...form, acquisitionChannel: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(v) => v && setForm({ ...form, status: v as "new" | "repeat" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="repeat">Repeat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestedTreatment">Interested Treatment</Label>
                <Input id="interestedTreatment" value={form.interestedTreatment} onChange={(e) => setForm({ ...form, interestedTreatment: e.target.value })} />
              </div>
              <Button type="submit">{editing ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>WhatsApp</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell>{lead.whatsapp}</TableCell>
              <TableCell>
                <Badge variant={lead.status === "new" ? "secondary" : "default"}>
                  {lead.status}
                </Badge>
              </TableCell>
              <TableCell>{lead.acquisitionChannel || "-"}</TableCell>
              <TableCell>{format(new Date(lead.createdAt), "dd MMM yyyy")}</TableCell>
              <TableCell className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(lead)}>Edit</Button>
                {role === "manager" && (
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(lead.id)}>Delete</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {leads.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">No leads yet</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
