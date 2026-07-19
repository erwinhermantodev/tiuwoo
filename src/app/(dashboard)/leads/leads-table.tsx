"use client";

import { useState, useMemo } from "react";
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
import { Pill } from "@/components/ui/badge";
import { Plus } from "lucide-react";
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

const filters = ["All", "New", "Repeat", "Not booked"] as const;

export function LeadsTable({ leads, role }: { leads: Lead[]; role: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    birthDate: "",
    acquisitionChannel: "",
    status: "new" as "new" | "repeat",
    interestedTreatment: "",
    bookingSuccess: false,
  });

  const filteredLeads = useMemo(() => {
    if (activeFilter === "All") return leads;
    if (activeFilter === "New") return leads.filter((l) => l.status === "new" && !l.bookingSuccess);
    if (activeFilter === "Repeat") return leads.filter((l) => l.status === "repeat");
    if (activeFilter === "Not booked") return leads.filter((l) => !l.bookingSuccess);
    return leads;
  }, [leads, activeFilter]);

  const counts = useMemo(() => ({
    All: leads.length,
    New: leads.filter((l) => l.status === "new" && !l.bookingSuccess).length,
    Repeat: leads.filter((l) => l.status === "repeat").length,
    "Not booked": leads.filter((l) => !l.bookingSuccess).length,
  }), [leads]);

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`text-[12px] font-semibold px-3.5 py-1.5 rounded-[999px] border transition-colors ${
                activeFilter === f
                  ? "bg-[#8E4A50] text-[#FBF3F1] border-[#8E4A50]"
                  : "bg-white text-[#4A4038] border-[#E6DAD3] hover:bg-[#EFE7E1]"
              }`}
            >
              {f} · {counts[f as keyof typeof counts]}
            </button>
          ))}
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger render={
            <Button size="pill" className="bg-[#8E4A50] text-[#FBF3F1] hover:bg-[#8E4A50]/80 border-none rounded-[999px]">
              <Plus className="size-4" />
              Add lead
            </Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Lead" : "New Lead"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lf-name">Name</Label>
                <Input id="lf-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-[6px] border-[#B8ABA0]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lf-whatsapp">WhatsApp</Label>
                <Input id="lf-whatsapp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} required className="rounded-[6px] border-[#B8ABA0]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lf-birth">Birth Date</Label>
                <Input id="lf-birth" type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} className="rounded-[6px] border-[#B8ABA0]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lf-channel">Acquisition Channel</Label>
                <Input id="lf-channel" value={form.acquisitionChannel} onChange={(e) => setForm({ ...form, acquisitionChannel: e.target.value })} className="rounded-[6px] border-[#B8ABA0]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lf-status">Status</Label>
                <Select value={form.status} onValueChange={(v) => v && setForm({ ...form, status: v as "new" | "repeat" })}>
                  <SelectTrigger className="rounded-[6px] border-[#B8ABA0]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="repeat">Repeat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lf-treatment">Interested Treatment</Label>
                <Input id="lf-treatment" value={form.interestedTreatment} onChange={(e) => setForm({ ...form, interestedTreatment: e.target.value })} className="rounded-[6px] border-[#B8ABA0]" />
              </div>
              <div className="pt-1">
                <Button type="submit" size="pill" className="w-full justify-center bg-[#8E4A50] text-[#FBF3F1] hover:bg-[#8E4A50]/80 border-none rounded-[999px]">
                  {editing ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>WhatsApp</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Interested in</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLeads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell className="font-[family-name:var(--font-mono)] text-[12.5px]">{lead.whatsapp}</TableCell>
              <TableCell>{lead.acquisitionChannel || "-"}</TableCell>
              <TableCell>{lead.interestedTreatment || "-"}</TableCell>
              <TableCell>
                <Pill color={lead.status === "new" ? "taupe" : "blush"}>
                  {lead.status === "new" ? "New" : "Repeat"}
                </Pill>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(lead)} className="text-[12px] text-[#B8ABA0] hover:text-[#4A4038] transition-colors">Edit</button>
                  {role === "manager" && (
                    <button onClick={() => handleDelete(lead.id)} className="text-[12px] text-[#B8ABA0] hover:text-[#C97B4E] transition-colors">Delete</button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filteredLeads.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-[#4A4038] py-8">No leads yet</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
