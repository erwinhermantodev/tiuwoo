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
import { format } from "date-fns";

type Complaint = {
  id: string;
  customerId: string;
  chronologyNotes: string | null;
  photoBeforeUrl: string | null;
  photoAfterUrl: string | null;
  resolution: string | null;
  createdAt: string;
  customer: { id: string; name: string; whatsapp: string };
};

type Customer = { id: string; name: string; whatsapp: string };

type Props = {
  complaints: Complaint[];
  customers: Customer[];
  role: string;
};

export function ComplaintsTable({ complaints, customers, role }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Complaint | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [chronologyNotes, setChronologyNotes] = useState("");
  const [photoBeforeUrl, setPhotoBeforeUrl] = useState("");
  const [photoAfterUrl, setPhotoAfterUrl] = useState("");
  const [resolution, setResolution] = useState("");
  const [uploading, setUploading] = useState(false);
  const canEdit = role === "manager" || role === "cs";

  function resetForm() {
    setCustomerId("");
    setChronologyNotes("");
    setPhotoBeforeUrl("");
    setPhotoAfterUrl("");
    setResolution("");
    setEditing(null);
  }

  function openEdit(c: Complaint) {
    setEditing(c);
    setCustomerId(c.customerId);
    setChronologyNotes(c.chronologyNotes || "");
    setPhotoBeforeUrl(c.photoBeforeUrl || "");
    setPhotoAfterUrl(c.photoAfterUrl || "");
    setResolution(c.resolution || "");
    setOpen(true);
  }

  async function uploadPhoto(file: File, field: "photoBeforeUrl" | "photoAfterUrl") {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const { url } = await res.json();
    if (field === "photoBeforeUrl") setPhotoBeforeUrl(url);
    else setPhotoAfterUrl(url);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = editing ? `/api/complaints/${editing.id}` : "/api/complaints";
    const method = editing ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        chronologyNotes,
        photoBeforeUrl: photoBeforeUrl || null,
        photoAfterUrl: photoAfterUrl || null,
        resolution: resolution || null,
      }),
    });
    resetForm();
    setOpen(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this complaint?")) return;
    await fetch(`/api/complaints/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger>
            <Button disabled={!canEdit}>Add Complaint</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Complaint" : "New Complaint"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select value={customerId} onValueChange={(v) => v && setCustomerId(v)} required>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Chronology Notes</Label>
                <textarea
                  className="w-full border rounded p-2 min-h-[80px]"
                  value={chronologyNotes}
                  onChange={(e) => setChronologyNotes(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Photo Before</Label>
                {photoBeforeUrl && (
                  <img src={photoBeforeUrl} alt="Before" className="w-32 h-32 object-cover rounded mb-2" />
                )}
                <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0], "photoBeforeUrl")} disabled={uploading} />
              </div>
              <div className="space-y-2">
                <Label>Photo After</Label>
                {photoAfterUrl && (
                  <img src={photoAfterUrl} alt="After" className="w-32 h-32 object-cover rounded mb-2" />
                )}
                <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0], "photoAfterUrl")} disabled={uploading} />
              </div>
              <div className="space-y-2">
                <Label>Resolution</Label>
                <textarea
                  className="w-full border rounded p-2 min-h-[60px]"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={uploading}>{editing ? "Update" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Chronology</TableHead>
            <TableHead>Photos</TableHead>
            <TableHead>Resolution</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complaints.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.customer.name}</TableCell>
              <TableCell className="max-w-xs truncate">{c.chronologyNotes || "-"}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {c.photoBeforeUrl && <a href={c.photoBeforeUrl} target="_blank" className="text-xs text-blue-500">Before</a>}
                  {c.photoAfterUrl && <a href={c.photoAfterUrl} target="_blank" className="text-xs text-blue-500">After</a>}
                  {!c.photoBeforeUrl && !c.photoAfterUrl && "-"}
                </div>
              </TableCell>
              <TableCell className="max-w-xs truncate">{c.resolution || "-"}</TableCell>
              <TableCell>{format(new Date(c.createdAt), "dd MMM yyyy")}</TableCell>
              <TableCell className="space-x-2">
                {canEdit && <Button variant="outline" size="sm" onClick={() => openEdit(c)}>Edit</Button>}
                {role === "manager" && (
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)}>Delete</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {complaints.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">No complaints</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
