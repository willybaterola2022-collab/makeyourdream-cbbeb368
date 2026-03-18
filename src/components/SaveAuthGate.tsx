import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogIn, Cloud } from "lucide-react";

interface SaveAuthGateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueLocal?: () => void;
}

export function SaveAuthGate({ open, onOpenChange, onContinueLocal }: SaveAuthGateProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            Guardar en la nube
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Crea una cuenta gratuita para guardar tus grabaciones, ver tu progreso y acceder desde cualquier dispositivo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <Button
            className="w-full gold-gradient text-primary-foreground"
            onClick={() => {
              onOpenChange(false);
              navigate("/login");
            }}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Crear cuenta / Iniciar sesión
          </Button>
          {onContinueLocal && (
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => {
                onOpenChange(false);
                onContinueLocal();
              }}
            >
              Continuar sin guardar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
