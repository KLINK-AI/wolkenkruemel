import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PricingPlans = [
  {
    id: 'monthly',
    name: 'Premium Monatlich',
    price: '€2.99',
    period: '/Monat',
    description: 'Vollzugriff auf alle Premium-Features',
    features: [
      'Unbegrenzte Aktivitäten',
      'Community Posts & Kommentare',
      'Favoriten speichern',
      'Fortschrittsverfolgung',
      'Priority Support'
    ],
    popular: false
  },
  {
    id: 'yearly',
    name: 'Premium Jährlich',
    price: '€29.99',
    period: '/Jahr',
    description: 'Vollzugriff auf alle Premium-Features - Spare 20%',
    features: [
      'Unbegrenzte Aktivitäten',
      'Community Posts & Kommentare', 
      'Favoriten speichern',
      'Fortschrittsverfolgung',
      'Priority Support',
      '2 Monate kostenlos!'
    ],
    popular: true,
    savings: 'Spare €6 pro Jahr'
  }
];

function CheckoutForm({ selectedPlan }: { selectedPlan: typeof PricingPlans[0] }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      // Create subscription with selected plan
      const priceId = selectedPlan.id === 'monthly' 
        ? process.env.STRIPE_PRICE_ID_MONTHLY 
        : process.env.STRIPE_PRICE_ID_YEARLY;

      const response = await apiRequest('POST', '/api/create-subscription', {
        priceId: priceId
      });

      const { clientSecret } = response;

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/profile`,
        },
      });

      if (error) {
        toast({
          title: "Zahlung fehlgeschlagen",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Premium aktiviert!",
          description: "Willkommen bei Wolkenkrümel Premium!",
        });
        setLocation('/profile');
      }
    } catch (error: any) {
      toast({
        title: "Fehler beim Upgrade",
        description: error.message || "Ein Fehler ist aufgetreten",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          {selectedPlan.name}
        </CardTitle>
        <div className="text-3xl font-bold text-primary">
          {selectedPlan.price}
          <span className="text-lg font-normal text-muted-foreground">
            {selectedPlan.period}
          </span>
        </div>
        {selectedPlan.savings && (
          <Badge variant="secondary" className="w-fit">
            {selectedPlan.savings}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">
              Enthalten:
            </h4>
            <ul className="space-y-2">
              {selectedPlan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">
              Zahlungsinformationen:
            </h4>
            <div className="border rounded-md p-3">
              <CardElement />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!stripe || loading}
            size="lg"
          >
            {loading ? "Wird verarbeitet..." : `${selectedPlan.name} aktivieren`}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Jederzeit kündbar. Sichere Zahlung über Stripe.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export default function SubscribePage() {
  const [selectedPlan, setSelectedPlan] = useState(PricingPlans[1]); // Default to yearly
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation('/login');
    return null;
  }

  if (user.tier === 'premium') {
    setLocation('/profile');
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Upgrade zu Premium
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Erlebe Wolkenkrümel ohne Einschränkungen. 
            Unbegrenzte Aktivitäten, Community-Features und mehr.
          </p>
        </div>

        {/* Plan Selection */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {PricingPlans.map((plan) => (
            <Card 
              key={plan.id}
              className={`cursor-pointer transition-all ${
                selectedPlan.id === plan.id 
                  ? 'ring-2 ring-primary shadow-lg' 
                  : 'hover:shadow-md'
              } ${plan.popular ? 'border-primary' : ''}`}
              onClick={() => setSelectedPlan(plan)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  {plan.popular && (
                    <Badge variant="default" className="gap-1">
                      <Star className="w-3 h-3" />
                      Beliebt
                    </Badge>
                  )}
                </div>
                <div className="text-3xl font-bold text-primary">
                  {plan.price}
                  <span className="text-lg font-normal text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                {plan.savings && (
                  <Badge variant="secondary" className="w-fit">
                    {plan.savings}
                  </Badge>
                )}
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Checkout Form */}
        <Elements stripe={stripePromise}>
          <CheckoutForm selectedPlan={selectedPlan} />
        </Elements>
      </div>
    </div>
  );
}