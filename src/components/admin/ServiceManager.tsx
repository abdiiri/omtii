import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  XCircle,
  AlertCircle,
  Check,
  X,
} from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  status: string | null;
  user_id: string;
  created_at: string;
  images: string[] | null;
  profile?: {
    full_name: string | null;
    email: string | null;
  };
}

export function ServiceManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
  });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("services")
        .select(`
          *,
          profile:profiles(full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('admin-services')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'services' },
        () => fetchServices()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description || "",
      price: service.price?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      const { error } = await supabase
        .from("services")
        .update({
          title: formData.title,
          description: formData.description,
          price: formData.price ? parseFloat(formData.price) : null,
        })
        .eq("id", editingService.id);

      if (error) throw error;

      toast.success("Service updated successfully!");
      setIsDialogOpen(false);
      setEditingService(null);
      fetchServices();
    } catch (error: any) {
      toast.error(error.message || "Failed to update service");
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceId);

      if (error) throw error;

      toast.success("Service deleted successfully!");
      fetchServices();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete service");
    }
  };

  const handleApprove = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from("services")
        .update({ status: "approved" })
        .eq("id", serviceId);

      if (error) throw error;
      toast.success("Service approved!");
      fetchServices();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve service");
    }
  };

  const handleReject = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from("services")
        .update({ status: "rejected" })
        .eq("id", serviceId);

      if (error) throw error;
      toast.success("Service rejected!");
      fetchServices();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject service");
    }
  };

  const filterByStatus = (status: string) => {
    return services.filter(
      (s) =>
        s.status === status &&
        (s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const pendingServices = filterByStatus("pending");
  const approvedServices = filterByStatus("approved");
  const rejectedServices = filterByStatus("rejected");
  const draftServices = services.filter(
    (s) =>
      (s.status === "draft" || s.status === "published") &&
      (s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            Pending
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

  const renderServiceCard = (service: Service, showApprovalActions: boolean = false) => (
    <div
      key={service.id}
      className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
    >
      <div className="flex items-start gap-4">
        {/* Service Image */}
        <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden flex-shrink-0">
          {service.images && service.images.length > 0 ? (
            <img 
              src={service.images[0]} 
              alt={service.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-xs text-muted-foreground">No img</div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-medium truncate">{service.title}</p>
            {getStatusBadge(service.status)}
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            {service.description || "No description"}
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>Owner: {service.profile?.full_name || "Unknown"}</span>
            <span>•</span>
            <span>{service.profile?.email || "No email"}</span>
            <span>•</span>
            <span>ID: {service.user_id.slice(0, 8)}...</span>
            {service.images && service.images.length > 0 && (
              <>
                <span>•</span>
                <span>{service.images.length} image(s)</span>
              </>
            )}
          </div>
          {service.price && (
            <p className="text-sm font-semibold text-primary mt-1">${service.price}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {showApprovalActions && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => handleApprove(service.id)}
                className="gap-1"
              >
                <Check className="h-3 w-3" />
                Approve
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleReject(service.id)}
                className="gap-1"
              >
                <X className="h-3 w-3" />
                Reject
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(service)}
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
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search services by title, owner name or email..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Pending ({pendingServices.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Approved ({approvedServices.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({rejectedServices.length})
          </TabsTrigger>
          <TabsTrigger value="drafts" className="gap-2">
            <Clock className="h-4 w-4" />
            Drafts ({draftServices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingServices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pending services</p>
          ) : (
            <div className="space-y-3">
              {pendingServices.map((service) => renderServiceCard(service, true))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {approvedServices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No approved services</p>
          ) : (
            <div className="space-y-3">
              {approvedServices.map((service) => renderServiceCard(service, false))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {rejectedServices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No rejected services</p>
          ) : (
            <div className="space-y-3">
              {rejectedServices.map((service) => renderServiceCard(service, true))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="drafts">
          {draftServices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No draft services</p>
          ) : (
            <div className="space-y-3">
              {draftServices.map((service) => renderServiceCard(service, false))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                min="0"
                step="0.01"
              />
            </div>
            <Button type="submit" className="w-full">
              Update Service
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}