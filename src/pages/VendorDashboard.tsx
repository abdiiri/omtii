import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useImageUpload } from "@/hooks/useImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Bell,
  Settings,
  MessageSquare,
  Package,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  LogOut,
  Pencil,
  Trash2,
  Star,
  ImagePlus,
  X,
  Send,
} from "lucide-react";
import omtiiLogo from "@/assets/omtii-logo.png";

interface Service {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  status: string | null;
  created_at: string;
  images: string[] | null;
}

interface ServiceRequest {
  id: string;
  service_id: string;
  client_id: string;
  vendor_id: string;
  message: string | null;
  status: string;
  created_at: string;
  service?: {
    title: string;
  };
  client?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

interface Message {
  id: string;
  service_request_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, profile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadMultipleImages, uploading } = useImageUpload({ bucket: "service-images" });

  const stats = [
    {
      title: "Total Services",
      value: services.length.toString(),
      change: "+0",
      trend: "up",
      icon: Package,
    },
    {
      title: "Approved",
      value: services.filter((s) => s.status === "approved").length.toString(),
      change: "+0",
      trend: "up",
      icon: CheckCircle2,
    },
    {
      title: "Pending",
      value: services.filter((s) => s.status === "pending").length.toString(),
      change: "0",
      trend: "up",
      icon: Clock,
    },
    {
      title: "Avg. Rating",
      value: "N/A",
      change: "+0",
      trend: "up",
      icon: Star,
    },
    {
      title: "Requests",
      value: serviceRequests.length.toString(),
      change: "+0",
      trend: "up",
      icon: MessageSquare,
    },
  ];

  const fetchServices = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    if (!user) return;

    setRequestsLoading(true);
    try {
      const { data, error } = await supabase
        .from("service_requests")
        .select(`
          *,
          service:services(title),
          client:profiles!service_requests_client_id_fkey(full_name, email, avatar_url)
        `)
        .eq("vendor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setServiceRequests((data as any) || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchMessages = async (requestId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("service_request_id", requestId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark unread messages as read
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("service_request_id", requestId)
        .eq("receiver_id", user.id)
        .eq("is_read", false);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const openMessageDialog = async (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsMessageDialogOpen(true);
    await fetchMessages(request.id);
  };

  const sendMessage = async () => {
    if (!user || !selectedRequest || !newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase.from("messages").insert({
        service_request_id: selectedRequest.id,
        sender_id: user.id,
        receiver_id: selectedRequest.client_id,
        content: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage("");
      await fetchMessages(selectedRequest.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchRequests();

    if (!user) return;

    // Subscribe to realtime updates for vendor's services
    const servicesChannel = supabase
      .channel('vendor-services')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'services', filter: `user_id=eq.${user.id}` },
        () => fetchServices()
      )
      .subscribe();

    // Subscribe to realtime updates for service requests
    const requestsChannel = supabase
      .channel('vendor-requests')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_requests', filter: `vendor_id=eq.${user.id}` },
        () => fetchRequests()
      )
      .subscribe();

    // Subscribe to realtime messages
    const messagesChannel = supabase
      .channel('vendor-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.receiver_id === user.id || newMsg.sender_id === user.id) {
            if (selectedRequest && newMsg.service_request_id === selectedRequest.id) {
              setMessages(prev => [...prev, newMsg]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(servicesChannel);
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user, selectedRequest]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files);
    setImageFiles(prev => [...prev, ...newFiles]);
    
    // Create previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Upload new images if any
      let uploadedUrls: string[] = [];
      if (imageFiles.length > 0) {
        uploadedUrls = await uploadMultipleImages(imageFiles, user.id);
      }
      
      // Combine existing and new images
      const allImages = [...existingImages, ...uploadedUrls];

      if (editingService) {
        // Update existing service
        const { error } = await supabase
          .from("services")
          .update({
            title,
            description,
            price: price ? parseFloat(price) : null,
            images: allImages.length > 0 ? allImages : null,
          })
          .eq("id", editingService.id)
          .eq("user_id", user.id);

        if (error) throw error;
        toast.success("Service updated successfully!");
      } else {
        // Create new service - status is "pending" for admin approval
        const { error } = await supabase.from("services").insert({
          user_id: user.id,
          title,
          description,
          price: price ? parseFloat(price) : null,
          status: "pending",
          images: allImages.length > 0 ? allImages : null,
        });

        if (error) throw error;
        toast.success("Service submitted for approval!");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchServices();
    } catch (error: any) {
      toast.error(error.message || "Failed to save service");
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceId)
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Service deleted successfully!");
      fetchServices();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete service");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setEditingService(null);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setTitle(service.title);
    setDescription(service.description || "");
    setPrice(service.price?.toString() || "");
    setExistingImages(service.images || []);
    setImageFiles([]);
    setImagePreviews([]);
    setIsDialogOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="warning" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Pending Approval
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      case "published":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Published
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Draft
          </Badge>
        );
    }
  };

  return (
    <>
      <Helmet>
        <title>Vendor Dashboard - OMTII</title>
        <meta name="description" content="Manage your services, orders, and earnings from your vendor dashboard." />
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
                <Badge variant="verified">Vendor</Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MessageSquare className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
                  <Settings className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-5 w-5" />
                </Button>
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm overflow-hidden">
                  {(profile as any)?.avatar_url ? (
                    <img src={(profile as any).avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    profile?.full_name?.charAt(0) || "V"
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Welcome */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold mb-1">
                Welcome back, {profile?.full_name || "Vendor"}!
              </h1>
              <p className="text-muted-foreground">Manage your services and grow your business.</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button variant="hero" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingService ? "Edit Service" : "Create New Service"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Website Development"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your service..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  {/* Image Upload */}
                  <div>
                    <Label>Service Images</Label>
                    <div className="mt-2 space-y-3">
                      {/* Drag & Drop Zone */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(true);
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(false);
                          const files = e.dataTransfer.files;
                          if (files && files.length > 0) {
                            const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
                            if (newFiles.length > 0) {
                              setImageFiles(prev => [...prev, ...newFiles]);
                              newFiles.forEach(file => {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  setImagePreviews(prev => [...prev, ev.target?.result as string]);
                                };
                                reader.readAsDataURL(file);
                              });
                            }
                          }
                        }}
                        className={`
                          relative cursor-pointer rounded-lg border-2 border-dashed p-6 
                          transition-all duration-200 ease-in-out
                          flex flex-col items-center justify-center gap-2 min-h-[120px]
                          ${isDragging 
                            ? 'border-primary bg-primary/10' 
                            : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50'}
                        `}
                      >
                        <ImagePlus className={`h-8 w-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className="text-sm text-muted-foreground text-center">
                          <span className="font-medium text-foreground">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                      />

                      {/* Existing Images */}
                      {existingImages.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Current images:</p>
                          <div className="flex flex-wrap gap-2">
                            {existingImages.map((url, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={url}
                                  alt={`Service ${index + 1}`}
                                  className="h-16 w-16 object-cover rounded-lg border border-border"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeExistingImage(index)}
                                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* New Image Previews */}
                      {imagePreviews.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">New images to upload:</p>
                          <div className="flex flex-wrap gap-2">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="h-16 w-16 object-cover rounded-lg border border-primary/50"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {editingService 
                      ? "Update your service details." 
                      : "Your service will be submitted for admin approval before going live."}
                  </p>
                  <Button type="submit" className="w-full" disabled={uploading}>
                    {uploading ? "Uploading..." : editingService ? "Update Service" : "Submit for Approval"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Grid */}
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
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 text-success" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-destructive" />
                    )}
                    <span className={`text-sm font-medium ${stat.trend === "up" ? "text-success" : "text-destructive"}`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-muted-foreground">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* My Services */}
            <div className="lg:col-span-2">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    My Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : services.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No services yet. Create your first one!</p>
                      <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Service
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {services.map((service) => (
                        <div
                          key={service.id}
                          className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                        >
                          {/* Service Image */}
                          <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {service.images && service.images.length > 0 ? (
                              <img 
                                src={service.images[0]} 
                                alt={service.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium truncate">{service.title}</p>
                              {getStatusBadge(service.status)}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {service.description || "No description"}
                            </p>
                            {service.images && service.images.length > 1 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                +{service.images.length - 1} more images
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {service.price && (
                              <span className="font-display font-bold">${service.price}</span>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(service)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(service.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Performance */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="secondary"
                    className="w-full justify-start gap-2"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Create New Service
                  </Button>
                  <Button variant="secondary" className="w-full justify-start gap-2">
                    <MessageSquare className="h-4 w-4" />
                    View Messages
                  </Button>
                  <Button variant="secondary" className="w-full justify-start gap-2">
                    <BarChart3 className="h-4 w-4" />
                    View Analytics
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full justify-start gap-2"
                    onClick={() => navigate("/profile")}
                  >
                    <Settings className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              {/* Performance */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Profile Views</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "0%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Service Clicks</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: "0%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Conversion Rate</span>
                        <span className="font-medium">0%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-success rounded-full" style={{ width: "0%" }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Service Requests Section */}
          <Card className="glass-card mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Service Requests
              </CardTitle>
              <Badge variant="secondary">{serviceRequests.length} requests</Badge>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : serviceRequests.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No service requests yet.</p>
                  <p className="text-sm text-muted-foreground">When clients request your services, they'll appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {serviceRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      {/* Client Avatar */}
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-semibold overflow-hidden flex-shrink-0">
                        {request.client?.avatar_url ? (
                          <img src={request.client.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          request.client?.full_name?.charAt(0) || "?"
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-medium">{request.client?.full_name || "Unknown Client"}</p>
                          <Badge variant={request.status === "pending" ? "warning" : request.status === "accepted" ? "success" : "secondary"}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Requested: <span className="font-medium text-foreground">{request.service?.title || "Unknown Service"}</span>
                        </p>
                        {request.message && (
                          <p className="text-sm text-muted-foreground line-clamp-2 bg-background/50 p-2 rounded mt-2">
                            "{request.message}"
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openMessageDialog(request)}
                          className="gap-1"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Message
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Dialog */}
        <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat with {selectedRequest?.client?.full_name || "Client"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Service: {selectedRequest?.service?.title}
              </p>
            </DialogHeader>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 py-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                        msg.sender_id === user?.id
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-secondary rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Send Message */}
            <div className="flex gap-2 pt-4 border-t">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              />
              <Button onClick={sendMessage} disabled={sendingMessage || !newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default VendorDashboard;