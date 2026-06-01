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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

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
  const filteredUsers = users.filter(
    (user) =>
      user.role === "user" &&
      (user.email.toLowerCase().includes(search.toLowerCase()) ||
        (user.username && user.username.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <ListingLayout
      title="Website Users"
      description="View and manage standard registered user accounts on the website."
      count={filteredUsers.length}
      onSearchChange={setSearch}
      searchPlaceholder="Search by username or email..."
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
            <TableStateRow colSpan={6} isLoading emptyLabel="" />
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <TableRow
                key={user.id}
                className="group hover:bg-muted/50 border-b border-border/50"
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
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell className="text-right">
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
            <TableStateRow colSpan={6} emptyLabel="No registered users found." />
          )}
        </TableBody>
      </Table>
    </ListingLayout>
  );
}
