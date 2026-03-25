"use client";

import { useEffect, useState, useCallback } from "react";
import { userService, type User, AdmRole } from "@/services/user-service";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, ShieldCheck, User as UserIcon, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

    const handleUpdateRole = async (user: User, newRole: AdmRole) => {
        try {
            await userService.updateRole(user.id, newRole);
            toast.success(`User ${user.username || user.email} updated to ${newRole}`);
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update user role.");
        }
    };

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

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        (user.username && user.username.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <ListingLayout
            title="User"
            count={filteredUsers.length}
            onSearchChange={setSearch}
            onCreateClick={() => toast.info("User creation is handled via signup.")}
        >
            <Table>
                <TableHeader className="bg-card">
                    <TableRow className="hover:bg-transparent border-b border-border/50">
                        <TableHead className="w-[80px] font-bold text-[11px] uppercase tracking-wider text-muted-foreground">ID</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Username</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Email</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Confirmed</TableHead>
                        <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Role</TableHead>
                        <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-10">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    <span className="text-muted-foreground">Loading...</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (filteredUsers?.length || 0) > 0 ? (
                        filteredUsers.map((user) => (
                            <TableRow key={user.id} className="group hover:bg-muted/50 border-b border-border/50">
                                <TableCell className="text-muted-foreground font-medium text-[13px]">#{user.id}</TableCell>
                                <TableCell className="font-semibold text-foreground text-[13px]">
                                    {user?.username || "Unknown"}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-[13px]">{user?.email || "N/A"}</TableCell>
                                <TableCell>
                                    {user?.confirmed ? (
                                        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 shadow-none text-[10px] font-bold uppercase py-0 px-2">
                                            Confirmed
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20 shadow-none text-[10px] font-bold uppercase py-0 px-2">
                                            Pending
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase py-0 px-2">
                                        {user?.role || "user"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <ShieldCheck className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="border-border">
                                                <DropdownMenuItem
                                                    onClick={() => handleUpdateRole(user, AdmRole.SUPER_ADMIN)}
                                                    className="cursor-pointer font-medium text-sm"
                                                >
                                                    <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
                                                    Promote to Super Admin
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleUpdateRole(user, AdmRole.USER)}
                                                    className="cursor-pointer font-medium text-sm"
                                                >
                                                    <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    Demote to User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleDelete(user.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-10 text-muted-foreground font-medium">
                                No users found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </ListingLayout>
    );
}
