import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      toast.error("Enlace de recuperación inválido");
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast.success("¡Contraseña actualizada!");
      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-full stage-gradient flex items-center justify-center mx-auto mb-4 glow-stage">
            {success ? <CheckCircle2 className="h-8 w-8 text-primary-foreground" /> : <Lock className="h-8 w-8 text-primary-foreground" />}
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {success ? "¡Listo!" : "Nueva contraseña"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {success ? "Tu contraseña fue actualizada" : "Ingresa tu nueva contraseña"}
          </p>
        </div>

        {!success && (
          <Card className="p-6 bg-card border-border/40">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Nueva contraseña"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-muted border-border"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Confirmar contraseña"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="pl-10 bg-muted border-border"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full stage-gradient text-primary-foreground">
                {loading ? "Actualizando..." : "Actualizar contraseña"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
