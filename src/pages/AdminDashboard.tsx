import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRoleManager } from "@/components/admin/UserRoleManager";
import { ServiceManager } from "@/components/admin/ServiceManager";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Shield,
  Settings,
  Bell,
  Search,
  Clock,
  ArrowLeft,
  LogOut,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import omtiiLogo from "@/assets/omtii-logo.png";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type AppRole = "admin" | "vendor" | "buyer" | "super_admin";

interface UserWithRoles {
  id: string;
  full_name: string | null;
  email: string | null;
  account_type: string | null;
  created_at: string;
  roles: AppRole[];
  phone?: string | null;
  bio?: string | null;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, isSuperAdmin, isAdmin, profile } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<UserWithRoles | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    phone: "",
    bio: "",
  });

  const stats = [
    { title: "Total Users", value: users.length.toString(), change: "+0", icon: Users },
    { title: "Active Vendors", value: users.filter(u => u.roles.includes("vendor")).length.toString(), change: "+0", icon: Package },
    { title: "Monthly Revenue", value: "$0", change: "+0%", icon: DollarSign },
    { title: "Pending Verifications", value: "0", change: "0", icon: Clock },
  ];

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      const usersWithRoles: UserWithRoles[] = (profiles || []).map((p: any) => ({
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        account_type: p.account_type,
        created_at: p.created_at,
        phone: p.phone,
        bio: p.bio,
        roles: rolesData
          ?.filter((r) => r.user_id === p.id)
          .map((r) => r.role as AppRole) || [],
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: AppRole) => {
    const config: Record<string, { variant: any }> = {
      super_admin: { variant: "destructive" },
      admin: { variant: "default" },
      vendor: { variant: "accent" },
      buyer: { variant: "secondary" },
    };
    return (
      <Badge key={role} variant={config[role]?.variant || "secondary"} className="gap-1">
        {role === "super_admin" && <Shield className="h-3 w-3" />}
        {role}
      </Badge>
    );
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const handleEditUser = (u: UserWithRoles) => {
    setEditingUser(u);
    setEditFormData({
      full_name: u.full_name || "",
      phone: u.phone || "",
      bio: u.bio || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editFormData.full_name,
          phone: editFormData.phone,
          bio: editFormData.bio,
        })
        .eq("id", editingUser.id);

      if (error) throw error;

      toast.success("User updated successfully!");
      setIsEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to update user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - OMTII</title>
        <meta name="description" content="Manage users, vendors, orders, and platform settings from the admin dashboard." />
      </Helmet>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-lg">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Link to="/" className="flex items-center gap-2">
                  <img src={omtiiLogo} alt="OMTII" className="h-9 w-auto" />
                </Link>
                <Badge variant="default" className="gap-1">
                  <Shield className="h-3 w-3" />
                  {isSuperAdmin ? "Super Admin" : "Admin"}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
                  <Settings className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-5 w-5" />
                </Button>
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-destructive to-destructive/80 flex items-center justify-center text-destructive-foreground font-semibold text-sm">
                  {profile?.full_name?.charAt(0) || "A"}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-1">
              Welcome, {profile?.full_name || "Admin"}!
            </h1>
            <p className="text-muted-foreground">
              {isSuperAdmin 
                ? "You have full access to manage all users, services, and platform settings."
                : "Manage users and platform settings from here."}
            </p>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card
                key={stat.title}
                className="glass-card-hover opacity-0 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="font-display text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium text-success">{stat.change}</span>
                    <span className="text-sm text-muted-foreground">this month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs for different management sections */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="services" className="gap-2">
                <Package className="h-4 w-4" />
                Services
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-2">
                <FolderOpen className="h-4 w-4" />
                Categories
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        All Users ({filteredUsers.length})
                      </CardTitle>
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search users..."
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : filteredUsers.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No users found</p>
                      ) : (
                        <div className="space-y-3">
                          {filteredUsers.map((u) => (
                            <div
                              key={u.id}
                              className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                            >
                              <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() =>
                                  setExpandedUserId(expandedUserId === u.id ? null : u.id)
                                }
                              >
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                    <span className="font-semibold text-sm">
                                      {u.full_name?.charAt(0) || u.email?.charAt(0) || "?"}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-medium">{u.full_name || "No name"}</p>
                                      {u.roles.map(getRoleBadge)}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{u.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-sm text-muted-foreground hidden sm:block">
                                    {formatDate(u.created_at)}
                                  </span>
                                {(isSuperAdmin || isAdmin) && (
                                    <div className="flex items-center gap-2">
                                      {(isSuperAdmin || (isAdmin && !u.roles.includes("super_admin"))) && (
                                        <>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditUser(u);
                                            }}
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          {isSuperAdmin && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteUser(u.id);
                                              }}
                                            >
                                              <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                          )}
                                        </>
                                      )}
                                      {expandedUserId === u.id ? (
                                        <ChevronUp className="h-4 w-4" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {(isSuperAdmin || (isAdmin && !u.roles.includes("super_admin"))) && expandedUserId === u.id && (
                                <div className="mt-4 pt-4 border-t border-border">
                                  <p className="text-sm font-medium mb-2">Manage Roles:</p>
                                  <UserRoleManager
                                    userId={u.id}
                                    currentRoles={u.roles}
                                    onRolesUpdated={fetchUsers}
                                    canManageSuperAdmin={isSuperAdmin}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  {isSuperAdmin && (
                    <Card className="glass-card border-destructive/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                          <Shield className="h-5 w-5" />
                          Super Admin
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <p>You have full access to:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>View and manage all users</li>
                          <li>Assign and remove any role</li>
                          <li>Edit or delete any service</li>
                          <li>Edit or delete any category</li>
                          <li>Access all platform analytics</li>
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    All Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ServiceManager />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    All Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryManager />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Edit User
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <Label htmlFor="edit_full_name">Full Name</Label>
                <Input
                  id="edit_full_name"
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_phone">Phone</Label>
                <Input
                  id="edit_phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit_bio">Bio</Label>
                <Textarea
                  id="edit_bio"
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full">
                Update User
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AdminDashboard;
