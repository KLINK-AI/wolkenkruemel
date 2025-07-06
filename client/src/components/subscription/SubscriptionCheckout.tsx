import { useState, useEffect } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Loader2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface SubscriptionCheckoutProps {
  plan: {
    id: string;
    name: string;
    price: number;
    stripePriceId?: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export default function SubscriptionCheckout({ plan, onSuccess, onCancel }: SubscriptionCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Initialize payment intent when component mounts
  useEffect(() => {
    const initializePayment = async () => {
      if (!currentUser?.id || !plan.stripePriceId) return;

      try {
        setIsLoading(true);
        const response = await apiRequest("POST", "/api/create-subscription", {
          userId: currentUser.id,
          priceId: plan.stripePriceId
        });
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error: any) {
        toast({
          title: "Fehler",
          description: "Zahlungsvorgang konnte nicht initialisiert werden",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [currentUser?.id, plan.stripePriceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    // Demo mode - simulate successful payment
    if (clientSecret?.startsWith('demo_client_secret_')) {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Invalidate cache to force refresh
      await queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/users', currentUser?.id, 'subscription'] });
      
      toast({
        title: "Demo-Zahlung erfolgreich",
        description: `Willkommen bei ${plan.name}! (Demo-Modus)`,
      });
      onSuccess();
      return;
    }

    if (!stripe || !elements || !clientSecret) {
      setIsLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/subscription?success=true`,
      },
    });

    if (error) {
      toast({
        title: "Zahlung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      toast({
        title: "Zahlung erfolgreich",
        description: `Willkommen bei ${plan.name}!`,
      });
      onSuccess();
    }
  };

  if (isLoading && !clientSecret) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Zahlungsvorgang wird vorbereitet...</span>
      </div>
    );
  }

  // Demo mode checkout
  if (clientSecret?.startsWith('demo_client_secret_')) {
    return (
      <div className="space-y-6">
        {/* Plan Summary */}
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2">{plan.name}</h3>
          <p className="text-2xl font-bold">
            €{plan.price}/{plan.price === 29.90 ? 'Jahr' : 'Monat'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Jederzeit kündbar
          </p>
        </div>

        {/* Demo Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="font-medium text-yellow-800">Demo-Modus</span>
            </div>
            <p className="text-sm text-yellow-700">
              Dies ist eine Demo-Version. Keine echte Zahlung erforderlich. 
              Klicken Sie auf "Abonnement abschließen" um Premium-Features zu aktivieren.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Aktivierung...
                </>
              ) : (
                `Abonnement abschließen (Demo)`
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          Zahlungsvorgang konnte nicht initialisiert werden.
        </p>
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zur Planauswahl
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Summary */}
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-semibold mb-2">{plan.name}</h3>
        <p className="text-2xl font-bold">
          €{plan.price}/Monat
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Jederzeit kündbar
        </p>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-4 rounded-lg border">
          <PaymentElement
            options={{
              layout: "tabs",
              paymentMethodOrder: ["card", "paypal"]
            }}
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
          
          <Button
            type="submit"
            disabled={!stripe || isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verarbeitung...
              </>
            ) : (
              `Abonnement abschließen`
            )}
          </Button>
        </div>
      </form>

      {/* Security Notice */}
      <div className="text-xs text-muted-foreground text-center">
        <p>
          🔒 Sichere Zahlung über Stripe. Deine Zahlungsdaten werden verschlüsselt übertragen 
          und nicht auf unseren Servern gespeichert.
        </p>
      </div>
    </div>
  );
}