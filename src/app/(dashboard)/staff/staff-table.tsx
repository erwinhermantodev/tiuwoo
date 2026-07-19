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
import { Pill } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Plus } from "lucide-react";

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

const joinedDates: Record<string, string> = {};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarColor(role: string): "blush" | "sage" | "clay" | "taupe" {
  if (role === "doctor") return "blush";
  if (role === "beautician") return "sage";
  if (!role) return "clay";
  return "taupe";
}

function getPillColor(role: string): "blush" | "sage" {
  if (role === "doctor") return "blush";
  return "sage";
}

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
          <DialogTrigger render={
            <Button size="pill" className="bg-[#8E4A50] text-[#FBF3F1] hover:bg-[#8E4A50]/80 border-none rounded-[999px]">
              <Plus className="size-4" />
              Add staff
            </Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit staff" : "New staff"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[12.5px] font-semibold text-[#4A4038]">Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-[6px] border-[#B8ABA0] text-[14px] focus:border-[#8E4A50] focus:ring-3 focus:ring-[#F6E3E1]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[12.5px] font-semibold text-[#4A4038]">Role</Label>
                <Select value={role} onValueChange={(v) => v && setRole(v)}>
                  <SelectTrigger className="rounded-[6px] border-[#B8ABA0]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="beautician">Beautician</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[12.5px] font-semibold text-[#4A4038]">Commission rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  required
                  className="rounded-[6px] border-[#B8ABA0] text-[14px] focus:border-[#8E4A50] focus:ring-3 focus:ring-[#F6E3E1]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[12.5px] font-semibold text-[#4A4038]">Linked user (optional)</Label>
                <Select value={userId} onValueChange={(v) => setUserId(v ?? "")}>
                  <SelectTrigger className="rounded-[6px] border-[#B8ABA0]">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-1">
                <Button
                  type="submit"
                  size="pill"
                  className="w-full justify-center bg-[#8E4A50] text-[#FBF3F1] hover:bg-[#8E4A50]/80 border-none rounded-[999px]"
                >
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
            <TableHead>Role</TableHead>
            <TableHead>Commission Rate</TableHead>
            <TableHead>Linked User</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Avatar
                    initials={getInitials(s.name)}
                    color={getAvatarColor(s.role)}
                    size="sm"
                  />
                  <div>
                    <div className="font-semibold text-[13.5px]">{s.name}</div>
                    <div className="text-[12px] text-[#B8ABA0]">Joined {/* static date for now */}2026</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Pill color={getPillColor(s.role)}>
                  {s.role === "doctor" ? "Doctor" : "Beautician"}
                </Pill>
              </TableCell>
              <TableCell className="font-[family-name:var(--font-mono)]">{s.commissionRate}%</TableCell>
              <TableCell>{users.find(u => u.id === s.userId)?.name || "—"}</TableCell>
              <TableCell>
                <button
                  onClick={() => openEdit(s)}
                  className="text-[12px] text-[#B8ABA0] hover:text-[#4A4038] transition-colors"
                >
                  Edit
                </button>
              </TableCell>
            </TableRow>
          ))}
          {staff.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="font-[family-name:var(--font-display)] italic text-[19px] text-[#2B2420] mb-1.5">
                    No staff added yet
                  </p>
                  <p className="text-[13px] text-[#4A4038] mb-[18px]">
                    Add your doctors and beauticians to start assigning bookings.
                  </p>
                  <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
                    <DialogTrigger render={
                      <Button size="pill" className="bg-[#8E4A50] text-[#FBF3F1] hover:bg-[#8E4A50]/80 border-none rounded-[999px] text-[12px]">
                        <Plus className="size-3.5" />
                        Add staff
                      </Button>
                    } />
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>New staff</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[12.5px] font-semibold text-[#4A4038]">Name</Label>
                          <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="rounded-[6px] border-[#B8ABA0] text-[14px] focus:border-[#8E4A50] focus:ring-3 focus:ring-[#F6E3E1]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[12.5px] font-semibold text-[#4A4038]">Role</Label>
                          <Select value={role} onValueChange={(v) => v && setRole(v)}>
                            <SelectTrigger className="rounded-[6px] border-[#B8ABA0]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="doctor">Doctor</SelectItem>
                              <SelectItem value="beautician">Beautician</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[12.5px] font-semibold text-[#4A4038]">Commission rate (%)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={commissionRate}
                            onChange={(e) => setCommissionRate(e.target.value)}
                            required
                            className="rounded-[6px] border-[#B8ABA0] text-[14px] focus:border-[#8E4A50] focus:ring-3 focus:ring-[#F6E3E1]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[12.5px] font-semibold text-[#4A4038]">Linked user (optional)</Label>
                          <Select value={userId} onValueChange={(v) => setUserId(v ?? "")}>
                            <SelectTrigger className="rounded-[6px] border-[#B8ABA0]">
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map((u) => (
                                <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="pt-1">
                          <Button
                            type="submit"
                            size="pill"
                            className="w-full justify-center bg-[#8E4A50] text-[#FBF3F1] hover:bg-[#8E4A50]/80 border-none rounded-[999px]"
                          >
                            Create
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
