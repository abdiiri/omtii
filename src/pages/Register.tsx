import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, User, Chrome, Check, ArrowLeft, Loader2 } from "lucide-react";
import omtiiLogo from "@/assets/omtii-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    accountType: "buyer" as "buyer" | "vendor",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password requirements
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      toast.error("Password must contain at least one uppercase letter");
      return;
    }
    if (!/\d/.test(formData.password)) {
      toast.error("Password must contain at least one number");
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.name.trim(),
            account_type: formData.accountType,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        toast.success("Account created successfully! Welcome to OMTII.");
        navigate("/");
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(formData.password) },
    { label: "One number", met: /\d/.test(formData.password) },
  ];

  return (
    <>
      <Helmet>
        <title>Create Account - OMTII</title>
        <meta name="description" content="Join OMTII and start connecting with top freelancers or offer your services to millions of clients worldwide." />
      </Helmet>
      <div className="min-h-screen flex">
        {/* Left Side - Image */}
        <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12">
          <div className="max-w-lg text-primary-foreground text-center">
            <h2 className="font-display text-4xl font-bold mb-4">
              Start your journey today
            </h2>
            <p className="text-primary-foreground/70 text-lg mb-8">
              Whether you're looking to hire or get hired, OMTII is your gateway to success
            </p>
            <div className="space-y-4 text-left">
              {[
                "Access to 500K+ professional services",
                "Secure payments with buyer protection",
                "24/7 customer support",
                "No hidden fees or commissions",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 bg-primary-foreground/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="h-6 w-6 rounded-full bg-success/20 flex items-center justify-center">
                    <Check className="h-4 w-4 text-success" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 mb-8">
              <img src={omtiiLogo} alt="OMTII" className="h-10 w-auto" />
            </Link>

            <h1 className="font-display text-3xl font-bold mb-2">Create your account</h1>
            <p className="text-muted-foreground mb-8">
              Join millions of freelancers and businesses
            </p>

            {/* Account Type Toggle */}
            <div className="flex gap-2 mb-6 p-1 bg-secondary rounded-xl">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, accountType: "buyer" })}
                className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  formData.accountType === "buyer"
                    ? "bg-card shadow-md text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                I'm a Buyer
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, accountType: "vendor" })}
                className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  formData.accountType === "vendor"
                    ? "bg-card shadow-md text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                I'm a Vendor
              </button>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button variant="outline" className="h-11" disabled>
                <Chrome className="h-5 w-5 mr-2" />
                Google
              </Button>
              <Button variant="outline" className="h-11" disabled>
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </Button>
            </div>

            <div className="relative mb-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                OR CONTINUE WITH
              </span>
            </div>

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Password Requirements */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {passwordRequirements.map((req) => (
                    <div
                      key={req.label}
                      className={`text-xs flex items-center gap-1 ${
                        req.met ? "text-success" : "text-muted-foreground"
                      }`}
                    >
                      <Check className={`h-3 w-3 ${req.met ? "opacity-100" : "opacity-0"}`} />
                      {req.label}
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="hero" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By signing up, you agree to our{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;