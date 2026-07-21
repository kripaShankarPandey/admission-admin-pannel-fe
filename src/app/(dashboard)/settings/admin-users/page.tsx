"use client";

import { useEffect, useState, useCallback } from "react";
import { apiErrorMessage } from "@/lib/api-error";
import {
  userService,
  type User,
  type UpdateUserPayload,
  AdmRole,
} from "@/services/user-service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  ShieldCheck,
  User as UserIcon,
  Edit2,
  Lock,
  Mail,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { ListingLayout } from "@/components/content-manager/listing-layout";
import { Badge } from "@/components/ui/badge";
import { TableStateRow } from "@/components/content-manager/table-state-row";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const AVAILABLE_PERMISSIONS = [
  { id: "blogs", label: "Blogs & Categories", description: "Manage articles and categories" },
  { id: "colleges", label: "Colleges", description: "Add, edit, or delete college details" },
  { id: "cities", label: "Cities", description: "Manage educational city tags" },
  { id: "courses", label: "Courses & Streams", description: "Manage academic disciplines and courses" },
  { id: "counselors", label: "Counselors", description: "Manage counselor listings" },
  { id: "reach-us", label: "Reach Us Locations", description: "Manage transport directions" },
  { id: "home-page", label: "Home Page Copy / SEO", description: "Edit SEO block & banner slides" },
  { id: "latest-news", label: "Latest News Marquee", description: "Publish latest breaking news" },
  { id: "exam-dates", label: "Exam Dates", description: "Manage the important exam dates section" },
  { id: "scholarships", label: "Scholarships", description: "Manage the scholarships section" },
  { id: "faqs", label: "FAQs", description: "Manage the home page FAQ section" },
  { id: "contact-leads", label: "Contact Leads", description: "Review contact form requests" },
  { id: "counselor-leads", label: "Counselor Leads", description: "Review counselor connect requests" },
  { id: "reviews", label: "Reviews", description: "Moderate college reviews" },
  { id: "newsletter-leads", label: "Newsletter Leads", description: "View subscriber emails" },
  { id: "settings", label: "Global Settings", description: "Edit company details & logo" },
  { id: "website-users", label: "Website Users", description: "View and delete registered website users" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Form States
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdmRole>(AdmRole.USER);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

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

  const resetForm = () => {
    setEmail("");
    setUsername("");
    setPassword("");
    setRole(AdmRole.USER);
    setPermissions([]);
    setSelectedUserId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setDialogMode("create");
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEmail(user.email);
    setUsername(user.username || "");
    setPassword(""); // Keep password empty for edits
    setRole(user.role);
    setPermissions(user.permissions || []);
    setSelectedUserId(user.id);
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  const handlePermissionToggle = (permId: string) => {
    if (permissions.includes(permId)) {
      setPermissions(permissions.filter((p) => p !== permId));
    } else {
      setPermissions([...permissions, permId]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !username) {
      toast.error("Please enter email and username.");
      return;
    }
    if (dialogMode === "create" && !password) {
      toast.error("Please enter a password for new users.");
      return;
    }
    if (dialogMode === "create" && password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsSaving(true);
    try {
      if (dialogMode === "create") {
        await userService.create({
          email,
          username,
          password,
          role,
          permissions: role === AdmRole.EDITOR ? permissions : [],
        });
        toast.success(`User "${username}" created successfully.`);
      } else {
        const payload: UpdateUserPayload = {
          email,
          username,
          role,
          permissions: role === AdmRole.EDITOR ? permissions : [],
        };
        if (password) {
          payload.password = password;
        }
        await userService.update(selectedUserId!, payload);
        toast.success(`User "${username}" updated successfully.`);
      }
      setIsDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error(
        apiErrorMessage(error, "An error occurred while saving user settings.")
      );
    } finally {
      setIsSaving(false);
    }
  };

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

  // Filter only admin/staff accounts (Super Admins and Editors)
  const filteredUsers = users.filter(
    (user) =>
      (user.role === AdmRole.SUPER_ADMIN || user.role === AdmRole.EDITOR) &&
      (user.email.toLowerCase().includes(search.toLowerCase()) ||
        (user.username && user.username.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <>
      <ListingLayout
        title="Admin User Settings"
        description="Configure dashboard roles, assign module permissions, and promote or demote administrator accounts."
        count={filteredUsers.length}
        onSearchChange={setSearch}
        searchPlaceholder="Search admin accounts..."
        onCreateClick={handleOpenCreate}
        createLabel="Add Admin"
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
                Role
              </TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Allowed Sections
              </TableHead>
              <TableHead className="text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableStateRow colSpan={7} isLoading emptyLabel="" />
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
                  <TableCell>
                    {user?.role === AdmRole.SUPER_ADMIN ? (
                      <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 shadow-none text-[10px] font-bold uppercase py-0 px-2">
                        Super Admin
                      </Badge>
                    ) : user?.role === AdmRole.EDITOR ? (
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-none text-[10px] font-bold uppercase py-0 px-2">
                        Editor
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-slate-500/10 text-slate-400 border-slate-500/20 shadow-none text-[10px] font-bold uppercase py-0 px-2"
                      >
                        User
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    {user?.role === AdmRole.SUPER_ADMIN ? (
                      <span className="text-xs text-muted-foreground font-medium">
                        All sections enabled
                      </span>
                    ) : user?.role === AdmRole.EDITOR ? (
                      user.permissions && user.permissions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.permissions.map((p) => (
                            <Badge
                              key={p}
                              variant="secondary"
                              className="text-[9px] font-semibold py-0 px-1 border border-border/50"
                            >
                              {p}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-destructive font-medium italic">
                          No sections configured
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        No dashboard access
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleOpenEdit(user)}
                        title="Edit User settings"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none group-hover:opacity-100 aria-expanded:bg-muted aria-expanded:text-foreground">
                          <ShieldCheck className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-border">
                          <DropdownMenuItem
                            onClick={() => handleUpdateRole(user, AdmRole.SUPER_ADMIN)}
                            className="cursor-pointer font-medium text-sm"
                          >
                            <ShieldCheck className="mr-2 h-4 w-4 text-violet-500" />
                            Promote to Super Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateRole(user, AdmRole.EDITOR)}
                            className="cursor-pointer font-medium text-sm"
                          >
                            <UserIcon className="mr-2 h-4 w-4 text-blue-500" />
                            Change to Editor
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
              <TableStateRow colSpan={7} emptyLabel="No admin users found." />
            )}
          </TableBody>
        </Table>
      </ListingLayout>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl w-full border-border/80 bg-card p-0 overflow-hidden shadow-2xl rounded-2xl">
          <form onSubmit={handleSave} className="flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border/40 bg-muted/20 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary shadow-xs">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                    {dialogMode === "create" ? "Add New Administrator" : "Edit Administrator Settings"}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground/80 mt-0.5">
                    {dialogMode === "create"
                      ? "Create an internal team account and define their module permission levels."
                      : "Modify contact info, role classifications, and module permissions for this account."}
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* Modal Body - 2 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border/40">
              {/* Left Column: Account Details (2/5 size) */}
              <div className="lg:col-span-2 p-6 space-y-5 bg-muted/5">
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Account Credentials</h3>
                  <p className="text-[10px] text-muted-foreground leading-normal">Enter details for system logins and set their base dashboard role.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <UserIcon className="h-3.5 w-3.5 text-muted-foreground" /> Full Name / Username
                    </Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="h-10 bg-background border-border/60 focus-visible:ring-primary/20 text-xs font-semibold placeholder:text-muted-foreground/45"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. john@admissiontoday.com"
                      className="h-10 bg-background border-border/60 focus-visible:ring-primary/20 text-xs font-semibold placeholder:text-muted-foreground/45"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={dialogMode === "create" ? "••••••••" : "Leave blank to keep current"}
                      className="h-10 bg-background border-border/60 focus-visible:ring-primary/20 text-xs font-semibold placeholder:text-muted-foreground/45"
                      required={dialogMode === "create"}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="role" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" /> Account Role
                    </Label>
                    <Select value={role} onValueChange={(val) => setRole(val as AdmRole)}>
                      <SelectTrigger className="h-10 bg-background border-border/60 text-xs font-semibold">
                        <SelectValue placeholder="Select a role..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={AdmRole.SUPER_ADMIN} className="text-xs font-medium cursor-pointer">Super Admin (Full Access)</SelectItem>
                        <SelectItem value={AdmRole.EDITOR} className="text-xs font-medium cursor-pointer">Editor (Restricted Access)</SelectItem>
                        <SelectItem value={AdmRole.USER} className="text-xs font-medium cursor-pointer">User (No Dashboard)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Right Column: Roles & Section Permissions (3/5 size) */}
              <div className="lg:col-span-3 p-6 space-y-4">
                {role === AdmRole.SUPER_ADMIN ? (
                  /* Super Admin Screen Info */
                  <div className="flex flex-col items-center justify-center text-center h-full min-h-[280px] rounded-xl border border-dashed border-violet-500/25 bg-violet-500/5 p-8 animate-in fade-in-50 duration-200">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10 text-violet-500 shadow-xs mb-4">
                      <ShieldCheck className="h-7 w-7" />
                    </div>
                    <h4 className="text-sm font-extrabold text-violet-950 uppercase tracking-wider">Super Admin Privileges</h4>
                    <p className="text-xs text-violet-800/80 leading-relaxed max-w-sm mt-2">
                      This role grants root-level privileges. Super Admins bypass all guards, have unrestricted view/edit permissions, and are authorized to manage other admin credentials.
                    </p>
                  </div>
                ) : role === AdmRole.USER ? (
                  /* Regular User Screen Info */
                  <div className="flex flex-col items-center justify-center text-center h-full min-h-[280px] rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 animate-in fade-in-50 duration-200">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-500 shadow-xs mb-4">
                      <UserIcon className="h-7 w-7" />
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Website Client Only</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mt-2">
                      This represents a standard portal client or student. They have zero authorization to log in to this backend dashboard.
                    </p>
                  </div>
                ) : (
                  /* Editor Permissions Configuration */
                  <div className="space-y-4 h-full min-h-[280px] animate-in fade-in-50 duration-200 flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Editor Section Access</h4>
                        <p className="text-[10px] text-muted-foreground leading-normal">
                          Toggle checkboxes below to restrict which segments of the dashboard this Editor is authorized to manage.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setPermissions(
                            permissions.length === AVAILABLE_PERMISSIONS.length
                              ? []
                              : AVAILABLE_PERMISSIONS.map((p) => p.id),
                          )
                        }
                        className="shrink-0 text-[10px] font-bold text-primary hover:underline whitespace-nowrap"
                      >
                        {permissions.length === AVAILABLE_PERMISSIONS.length ? "Clear all" : "Select all"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto max-h-[260px] pr-1 pb-2 flex-1 scrollbar-none">
                      {AVAILABLE_PERMISSIONS.map((perm) => {
                        const isChecked = permissions.includes(perm.id);
                        return (
                          <div
                            key={perm.id}
                            onClick={() => handlePermissionToggle(perm.id)}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${
                              isChecked
                                ? "border-primary bg-primary/5 text-primary shadow-2xs"
                                : "border-border/60 hover:bg-muted bg-background text-slate-800"
                            }`}
                          >
                            <div
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-all ${
                                isChecked
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted-foreground/35 bg-background"
                              }`}
                            >
                              {isChecked && <Check className="h-3 w-3 stroke-[3px]" />}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-bold leading-none ${isChecked ? "text-primary" : "text-slate-950"}`}>
                                {perm.label}
                              </p>
                              <p className="text-[10px] text-muted-foreground/80 mt-1.5 leading-snug">
                                {perm.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <DialogFooter className="bg-muted/15 border-t border-border/40 px-6 py-4 flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
                className="h-9 px-4 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="h-9 px-5 text-xs font-semibold gap-1.5 shadow-sm"
              >
                {isSaving ? "Saving..." : "Save User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
