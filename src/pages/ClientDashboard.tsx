import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  ArrowLeft,
  Bell,
  Settings,
  MessageSquare,
  LogOut,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Package,
} from "lucide-react";
import omtiiLogo from "@/assets/omtii-logo.png";

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
  vendor?: {
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

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, profile } = useAuth();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchRequests = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("service_requests")
        .select(`
          *,
          service:services(title),
          vendor:profiles!service_requests_vendor_id_fkey(full_name, email, avatar_url)
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setServiceRequests((data as any) || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchRequests();

    if (!user) return;

    // Subscribe to realtime updates for service requests
    const requestsChannel = supabase
      .channel('client-requests')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_requests', filter: `client_id=eq.${user.id}` },
        () => fetchRequests()
      )
      .subscribe();

    // Subscribe to realtime messages
    const messagesChannel = supabase
      .channel('client-messages')
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
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user, selectedRequest]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        receiver_id: selectedRequest.vendor_id,
        content: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="warning" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  const stats = [
    {
      title: "Total Requests",
      value: serviceRequests.length.toString(),
      icon: Package,
    },
    {
      title: "Pending",
      value: serviceRequests.filter((r) => r.status === "pending").length.toString(),
      icon: Clock,
    },
    {
      title: "Accepted",
      value: serviceRequests.filter((r) => r.status === "accepted").length.toString(),
      icon: CheckCircle2,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Client Dashboard - OMTII</title>
        <meta name="description" content="View your service requests and communicate with vendors." />
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
                <Badge variant="secondary">Client</Badge>
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
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    profile?.full_name?.charAt(0) || "C"
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-1">
              Welcome, {profile?.full_name || "Client"}!
            </h1>
            <p className="text-muted-foreground">Track your service requests and communicate with vendors.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title} className="glass-card">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Service Requests */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                My Service Requests
              </CardTitle>
              <Badge variant="secondary">{serviceRequests.length} requests</Badge>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : serviceRequests.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No service requests yet.</p>
                  <p className="text-sm text-muted-foreground mb-4">Browse services and send your first request.</p>
                  <Button onClick={() => navigate("/explore")}>Explore Services</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {serviceRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      {/* Vendor Avatar */}
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-semibold overflow-hidden flex-shrink-0">
                        {request.vendor?.avatar_url ? (
                          <img src={request.vendor.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          request.vendor?.full_name?.charAt(0) || "V"
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-medium">{request.vendor?.full_name || "Vendor"}</p>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Service: <span className="font-medium text-foreground">{request.service?.title || "Unknown Service"}</span>
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
                Chat with {selectedRequest?.vendor?.full_name || "Vendor"}
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

export default ClientDashboard;
