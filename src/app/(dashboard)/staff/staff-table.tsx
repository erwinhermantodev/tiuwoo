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

type StaffMember = {
  id: string;
  name: string;
  role: string;
  commissionRate: number;
  userId: string | null;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Props = {
  staff: StaffMember[];
  users: User[];
};

export function StaffTable({ staff, users }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("doctor");
  const [commissionRate, setCommissionRate] = useState("10");
  const [userId, setUserId] = useState("");

  function resetForm() {
    setName("");
    setRole("doctor");
    setCommissionRate("10");
    setUserId("");
    setEditing(null);
  }

  function openEdit(s: StaffMember) {
    setEditing(s);
    setName(s.name);
    setRole(s.role);
    setCommissionRate(s.commissionRate.toString());
    setUserId(s.userId || "");
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = editing ? `/api/staff/${editing.id}` : "/api/staff";
    const method = editing ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        role,
        commissionRate: parseFloat(commissionRate),
        userId: userId || null,
      }),
    });
    resetForm();
    setOpen(false);
    router.refresh();
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger render={<Button>Add Staff</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Staff" : "New Staff"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v) => v && setRole(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="beautician">Beautician</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Commission Rate (%)</Label>
                <Input type="number" step="0.01" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Linked User (optional)</Label>
                <Select value={userId} onValueChange={(v) => setUserId(v ?? "")}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <TableHead>Role</TableHead>
            <TableHead>Commission Rate</TableHead>
            <TableHead>Linked User</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">{s.name}</TableCell>
              <TableCell><Badge variant="outline">{s.role}</Badge></TableCell>
              <TableCell>{s.commissionRate}%</TableCell>
              <TableCell>{users.find(u => u.id === s.userId)?.name || "-"}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => openEdit(s)}>Edit</Button>
              </TableCell>
            </TableRow>
          ))}
          {staff.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">No staff yet</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
