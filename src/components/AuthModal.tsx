import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
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

          {/* Google OAuth — placeholder, needs connector setup */}
          {/* <Button variant="outline" className="w-full" disabled>
            Continuar con Google
          </Button> */}

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
