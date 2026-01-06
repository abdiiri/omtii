import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, Trash2, Shield } from "lucide-react";

type AppRole = "admin" | "vendor" | "buyer" | "super_admin";

interface UserRoleManagerProps {
  userId: string;
  currentRoles: AppRole[];
  onRolesUpdated: () => void;
}

export function UserRoleManager({
  userId,
  currentRoles,
  onRolesUpdated,
  canManageSuperAdmin = false,
}: UserRoleManagerProps & { canManageSuperAdmin?: boolean }) {
  const [selectedRole, setSelectedRole] = useState<AppRole | "">("");
  const [loading, setLoading] = useState(false);

  // Only super_admin can assign super_admin role
  const allRoles: AppRole[] = canManageSuperAdmin 
    ? ["buyer", "vendor", "admin", "super_admin"]
    : ["buyer", "vendor", "admin"];
  const availableRoles = allRoles.filter((role) => !currentRoles.includes(role));

  const addRole = async () => {
    if (!selectedRole) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: selectedRole,
      });

      if (error) throw error;

      toast.success(`Added ${selectedRole} role`);
      setSelectedRole("");
      onRolesUpdated();
    } catch (error: any) {
      toast.error(error.message || "Failed to add role");
    } finally {
      setLoading(false);
    }
  };

  const removeRole = async (role: AppRole) => {
    // Prevent non-super-admins from removing super_admin role
    if (role === "super_admin" && !canManageSuperAdmin) {
      toast.error("Only super admins can remove the super_admin role");
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;

      toast.success(`Removed ${role} role`);
      onRolesUpdated();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove role");
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "admin":
        return "default";
      case "vendor":
        return "accent";
      case "buyer":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {currentRoles.map((role) => (
          <Badge
            key={role}
            variant={getRoleBadgeVariant(role)}
            className="gap-1 pr-1"
          >
            {role === "super_admin" && <Shield className="h-3 w-3" />}
            {role}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-1 hover:bg-destructive/20"
              onClick={() => removeRole(role)}
              disabled={loading}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>

      {availableRoles.length > 0 && (
        <div className="flex gap-2">
          <Select
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as AppRole)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Add role..." />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={addRole}
            disabled={!selectedRole || loading}
            className="gap-1"
          >
            <UserPlus className="h-4 w-4" />
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
