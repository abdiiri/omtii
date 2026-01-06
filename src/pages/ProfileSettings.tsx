import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useImageUpload } from "@/hooks/useImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  FileText,
  Save,
  LogOut,
  Camera,
} from "lucide-react";
import omtiiLogo from "@/assets/omtii-logo.png";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshAuth, roles } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    bio: "",
    avatar_url: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading } = useImageUpload({ bucket: "avatars" });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: (profile as any).phone || "",
        bio: (profile as any).bio || "",
        avatar_url: (profile as any).avatar_url || "",
      });
    }
  }, [profile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const url = await uploadImage(file, user.id);
    if (url) {
      setFormData(prev => ({ ...prev, avatar_url: url }));
      toast.success("Avatar uploaded! Click Save to update your profile.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      await refreshAuth();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      super_admin: "destructive",
      admin: "default",
      vendor: "accent",
      buyer: "secondary",
    };
    return (
      <Badge key={role} variant={variants[role] || "secondary"}>
        {role}
      </Badge>
    );
  };

  return (
    <>
      <Helmet>
        <title>Profile Settings - OMTII</title>
        <meta name="description" content="Manage your profile information and settings." />
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
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-5 w-5" />
                </Button>
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm overflow-hidden">
                  {formData.avatar_url ? (
                    <img src={formData.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    profile?.full_name?.charAt(0) || "U"
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your personal information and account settings.
            </p>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your profile details visible to others.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-2xl overflow-hidden">
                      {formData.avatar_url ? (
                        <img src={formData.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        formData.full_name?.charAt(0) || "U"
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                      disabled={uploading}
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{formData.full_name || "Your Name"}</p>
                    <p className="text-sm text-muted-foreground">
                      {uploading ? "Uploading..." : "Click the camera to change your photo"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed here.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Your Roles</Label>
                  <div className="flex flex-wrap gap-2">
                    {roles.length > 0 ? (
                      roles.map(getRoleBadge)
                    ) : (
                      <span className="text-sm text-muted-foreground">No roles assigned</span>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  <Save className="h-4 w-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ProfileSettings;
