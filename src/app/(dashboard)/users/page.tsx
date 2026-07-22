"use client";

import { useEffect, useState, useCallback } from "react";
import { userService, type User } from "@/services/user-service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { Badge } from "@/components/ui/badge";
import { TableStateRow } from "@/components/content-manager/table-state-row";
import { Modal } from "@/components/ui/modal";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await userService.delete(id);
      toast.success("User deleted successfully.");
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete user.");
    }
  };

  // Only show registered website users (role: 'user')
  const filteredUsers = users.filter((user) => {
    if (user.role !== "user") return false;
    const q = search.toLowerCase();
    return (
      user.email.toLowerCase().includes(q) ||
      (user.username?.toLowerCase().includes(q) ?? false) ||
      (user.name?.toLowerCase().includes(q) ?? false) ||
      (user.phone?.toLowerCase().includes(q) ?? false) ||
      (user.city?.toLowerCase().includes(q) ?? false) ||
      (user.state?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <>
      {selectedUser && (
        <Modal
          title="User Details"
          onClose={() => setSelectedUser(null)}
          size="sm"
        >
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                ID
              </label>
              <p className="text-sm text-foreground">{selectedUser.id}</p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Name
              </label>
              <p className="text-sm text-foreground">
                {selectedUser.name || "—"}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Username
              </label>
              <p className="text-sm text-foreground">
                {selectedUser.username || "—"}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Email
              </label>
              <a
                href={`mailto:${selectedUser.email}`}
                className="text-sm text-primary hover:underline"
              >
                {selectedUser.email}
              </a>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Phone
              </label>
              {selectedUser.phone ? (
                <a
                  href={`tel:${selectedUser.phone}`}
                  className="text-sm text-primary hover:underline"
                >
                  {selectedUser.phone}
                </a>
              ) : (
                <p className="text-sm text-foreground">—</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  City
                </label>
                <p className="text-sm text-foreground">
                  {selectedUser.city || "—"}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  State
                </label>
                <p className="text-sm text-foreground">
                  {selectedUser.state || "—"}
                </p>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Status
              </label>
              <div>
                {selectedUser.confirmed ? (
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px] font-bold uppercase">
                    Confirmed
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-[10px] font-bold uppercase"
                  >
                    Pending
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Registered
              </label>
              <p className="text-sm text-foreground">
                {selectedUser.createdAt
                  ? new Date(selectedUser.createdAt).toLocaleString()
                  : "—"}
              </p>
            </div>
            <div className="pt-4 border-t border-border flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  handleDelete(selectedUser.id);
                  setSelectedUser(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
      <ListingLayout
        title="Website Users"
        description="View and manage standard registered user accounts on the website."
        count={filteredUsers.length}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, phone, city or state..."
      >
        <Table>
          <TableHeader className="bg-card">
            <TableRow className="hover:bg-transparent border-b border-border/50">
              <TableHead className="w-[80px] font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                ID
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Username
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Email
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Phone
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                City
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                State
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Confirmed
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Registered Date
              </TableHead>
              <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableStateRow colSpan={9} isLoading emptyLabel="" />
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="group hover:bg-muted/50 border-b border-border/50 cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <TableCell className="text-muted-foreground font-medium text-[13px]">
                    #{user.id}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground text-[13px]">
                    {user?.username || "Unknown"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[13px]">
                    {user?.email || "N/A"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[13px]">
                    {user?.phone || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[13px]">
                    {user?.city || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[13px]">
                    {user?.state || "—"}
                  </TableCell>
                  <TableCell>
                    {user?.confirmed ? (
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 shadow-none text-[10px] font-bold uppercase py-0 px-2">
                        Confirmed
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20 shadow-none text-[10px] font-bold uppercase py-0 px-2"
                      >
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[13px]">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableStateRow
                colSpan={9}
                emptyLabel="No registered users found."
              />
            )}
          </TableBody>
        </Table>
      </ListingLayout>
    </>
  );
}
