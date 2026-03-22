import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Mail } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error("Error con Google. Intentá de nuevo.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Revisá tu email para confirmar tu cuenta.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Tu huella vocal está guardada.");
        onSuccess?.();
        onOpenChange(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border/40 backdrop-blur-2xl max-h-[80dvh] overflow-y-auto">
        <div className="space-y-6 py-4">
          {/* Headline */}
          <div className="text-center space-y-2">
            <h2 className="font-display text-xl text-foreground">
              Tu Vocal DNA te espera.
            </h2>
            <p className="text-sm text-muted-foreground">
              Creá tu perfil de artista.
            </p>
          </div>

          {/* Google OAuth — prominent */}
          <Button
            variant="outline"
            className="w-full py-5 text-sm font-medium bg-white text-black hover:bg-gray-100 border-border/20"
            onClick={handleGoogle}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">o con email</span>
            </div>
          </div>

          {/* Email/Password */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auth-email" className="text-muted-foreground text-xs">Email</Label>
              <Input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="bg-muted/50 border-border/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-password" className="text-muted-foreground text-xs">Contraseña</Label>
              <Input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-muted/50 border-border/40"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display"
            >
              <Mail className="h-4 w-4 mr-2" />
              {mode === "signup" ? "Crear perfil" : "Iniciar sesión"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            {mode === "signup" ? (
              <>¿Ya tenés cuenta?{" "}
                <button onClick={() => setMode("login")} className="text-primary hover:underline">Iniciá sesión</button>
              </>
            ) : (
              <>¿No tenés cuenta?{" "}
                <button onClick={() => setMode("signup")} className="text-primary hover:underline">Creá una</button>
              </>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
