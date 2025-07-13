import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft } from "lucide-react";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export default function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      await apiRequest("POST", "/api/forgot-password", { email });
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "E-Mail gesendet",
        description: "Falls ein Konto mit dieser E-Mail existiert, wurde eine Passwort-Reset-E-Mail gesendet.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Beim Senden der E-Mail ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "E-Mail erforderlich",
        description: "Bitte geben Sie Ihre E-Mail-Adresse ein.",
        variant: "destructive",
      });
      return;
    }
    forgotPasswordMutation.mutate(email);
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            E-Mail gesendet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground">
              Überprüfen Sie Ihre E-Mails und folgen Sie den Anweisungen, um Ihr Passwort zurückzusetzen.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Die E-Mail kann einige Minuten dauern, um anzukommen. Prüfen Sie auch Ihren Spam-Ordner.
            </p>
          </div>
          <Button 
            onClick={onBack} 
            variant="outline" 
            className="w-full flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Anmeldung
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Passwort vergessen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ihre@email.com"
              required
            />
            <p className="text-sm text-muted-foreground">
              Wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück
            </Button>
            <Button 
              type="submit" 
              disabled={forgotPasswordMutation.isPending}
              className="flex-1 flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              {forgotPasswordMutation.isPending ? "Senden..." : "Reset-Link senden"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}