import { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  SlidersHorizontal,
  Star,
  Heart,
  Clock,
  ArrowLeft,
  X,
  Package,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ServiceWithProfile {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  status: string | null;
  created_at: string;
  user_id: string;
  images: string[] | null;
  profile?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
  category?: {
    name: string;
  };
}

const Explore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState("recommended");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [services, setServices] = useState<ServiceWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceWithProfile | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const activeCategory = searchParams.get("category") || "All";

  // Fetch approved services from database
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("services")
          .select(`
            *,
            profile:profiles(full_name, email, avatar_url)
          `)
          .eq("status", "approved")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const categories = ["All", "Development", "Design", "Marketing", "Video", "Writing", "Audio"];

  // Filter and sort services
  const filteredServices = useMemo(() => {
    let result = [...services];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.profile?.full_name?.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query)
      );
    }

    // Filter by price range
    if (priceMin) {
      result = result.filter((s) => (s.price || 0) >= parseInt(priceMin));
    }
    if (priceMax) {
      result = result.filter((s) => (s.price || 0) <= parseInt(priceMax));
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result = result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "price-low":
        result = result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        result = result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      default:
        break;
    }

    return result;
  }, [services, searchQuery, priceMin, priceMax, sortBy]);

  const handleCategoryChange = (category: string) => {
    if (category === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      searchParams.set("q", searchQuery);
    } else {
      searchParams.delete("q");
    }
    setSearchParams(searchParams);
  };

  const handleFavorite = (e: React.MouseEvent, serviceId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
    toast.success(
      favorites.includes(serviceId) ? "Removed from favorites" : "Added to favorites"
    );
  };

  const clearFilters = () => {
    setPriceMin("");
    setPriceMax("");
    setSearchQuery("");
    searchParams.delete("q");
    searchParams.delete("category");
    setSearchParams(searchParams);
  };

  const handleRequestService = (service: ServiceWithProfile) => {
    if (!user) {
      toast.error("Please login to request a service");
      navigate("/login");
      return;
    }
    setSelectedService(service);
    setRequestMessage("");
    setRequestDialogOpen(true);
  };

  const submitRequest = async () => {
    if (!user || !selectedService) return;
    
    setSubmittingRequest(true);
    try {
      const { error } = await supabase.from("service_requests").insert({
        service_id: selectedService.id,
        client_id: user.id,
        vendor_id: selectedService.user_id,
        message: requestMessage || null,
        status: "pending",
      });

      if (error) throw error;
      toast.success("Request sent successfully! The vendor will be notified.");
      setRequestDialogOpen(false);
      setSelectedService(null);
      setRequestMessage("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send request");
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>
          {activeCategory !== "All"
            ? `${activeCategory} Services - OMTII`
            : "Explore Services - OMTII"}
        </title>
        <meta
          name="description"
          content="Browse professional services from verified vendors. Find the perfect match for your project needs."
        />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-background">
          {/* Header */}
          <div className="border-b border-border bg-card/50">
            <div className="container mx-auto px-4 py-8">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </button>
              <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
                {activeCategory !== "All" ? `${activeCategory} Services` : "Explore Services"}
              </h1>
              <p className="text-muted-foreground">
                Discover talented professionals ready to bring your ideas to life
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <form onSubmit={handleSearch} className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search services..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>

                {/* Category Pills - Desktop */}
                <div className="hidden lg:flex items-center gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={activeCategory === cat ? "default" : "secondary"}
                      size="sm"
                      onClick={() => handleCategoryChange(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>

                {/* Filter & Sort */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">Recommended</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Mobile Category Pills */}
              <div className="flex lg:hidden overflow-x-auto gap-2 mt-4 pb-2 -mx-4 px-4">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={activeCategory === cat ? "default" : "secondary"}
                    size="sm"
                    className="flex-shrink-0"
                    onClick={() => handleCategoryChange(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              {/* Mobile Filters Panel */}
              {showFilters && (
                <div className="lg:hidden mt-4 p-4 bg-card rounded-xl border border-border animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Filters</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Price Range</h4>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          className="flex-1"
                          value={priceMin}
                          onChange={(e) => setPriceMin(e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          className="flex-1"
                          value={priceMax}
                          onChange={(e) => setPriceMax(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 py-8">
            <div className="flex gap-8">
              {/* Sidebar Filters - Desktop */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-40 space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Price Range</h3>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        className="flex-1"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        className="flex-1"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </div>
              </aside>

              {/* Services Grid */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-muted-foreground">
                    {filteredServices.length} services found
                  </p>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredServices.length === 0 ? (
                  <div className="text-center py-16">
                    <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No services found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters or search query
                    </p>
                    <Button onClick={clearFilters}>Clear Filters</Button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredServices.map((service) => (
                      <div
                        key={service.id}
                        className="group glass-card-hover rounded-2xl overflow-hidden cursor-pointer"
                      >
                        {/* Service Image */}
                        <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                          {service.images && service.images.length > 0 ? (
                            <img 
                              src={service.images[0]} 
                              alt={service.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <Package className="h-12 w-12 text-muted-foreground" />
                          )}
                          <button
                            onClick={(e) => handleFavorite(e, service.id)}
                            className={`absolute top-3 right-3 h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                              favorites.includes(service.id)
                                ? "bg-destructive text-destructive-foreground"
                                : "bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-destructive"
                            }`}
                          >
                            <Heart
                              className={`h-5 w-5 ${favorites.includes(service.id) ? "fill-current" : ""}`}
                            />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          {/* Vendor Info */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-semibold overflow-hidden">
                              {service.profile?.avatar_url ? (
                                <img src={service.profile.avatar_url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                service.profile?.full_name?.charAt(0) || "?"
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-sm">
                                {service.profile?.full_name || "Unknown Vendor"}
                              </p>
                            </div>
                          </div>

                          {/* Title */}
                          <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {service.title}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {service.description || "No description provided"}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-warning text-warning" />
                              <span className="font-medium text-sm">New</span>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Starting at</p>
                              <p className="font-display font-bold text-lg">
                                ${service.price || 0}
                              </p>
                            </div>
                          </div>
                          
                          {/* Request Button */}
                          <Button 
                            className="w-full mt-3 gap-2" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRequestService(service);
                            }}
                          >
                            <Send className="h-4 w-4" />
                            Request Service
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />

        {/* Request Service Dialog */}
        <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Service</DialogTitle>
              <DialogDescription>
                Send a request to {selectedService?.profile?.full_name || "the vendor"} for "{selectedService?.title}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Message (optional)</label>
                <Textarea
                  placeholder="Describe what you need..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setRequestDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 gap-2"
                  onClick={submitRequest}
                  disabled={submittingRequest}
                >
                  <Send className="h-4 w-4" />
                  {submittingRequest ? "Sending..." : "Send Request"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Explore;