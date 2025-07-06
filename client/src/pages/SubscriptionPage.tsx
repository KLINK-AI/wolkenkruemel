import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/components/LanguageProvider";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import SubscriptionCheckout from "../components/subscription/SubscriptionCheckout";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  popular?: boolean;
  icon: React.ComponentType<any>;
  stripePriceId?: string;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Community',
    price: 0,
    interval: 'kostenlos',
    icon: Star,
    features: [
      'Zugang zum Community-Feed',
      'Aktivitäten ansehen',
      'Grundlegende Profilfunktionen',
      'Bis zu 5 eigene Aktivitäten'
    ]
  },
  {
    id: 'premium',
    name: 'Pro Trainer',
    price: 9.99,
    interval: 'Monat',
    popular: true,
    icon: Crown,
    stripePriceId: 'price_premium_monthly', // This would be replaced with actual price ID
    features: [
      'Alles aus Community',
      'Unbegrenzte Aktivitätserstellung',
      'Posts und Kommentare erstellen',
      'Favoriten speichern',
      'Fortschritt verfolgen',
      'Prioritäts-Support',
      'Zugang zu Premium-Aktivitäten',
      'Erweiterte Profilfunktionen'
    ]
  },
  {
    id: 'professional',
    name: 'Expert',
    price: 29.99,
    interval: 'Monat',
    icon: Zap,
    stripePriceId: 'price_professional_monthly', // This would be replaced with actual price ID
    features: [
      'Alles aus Pro Trainer',
      'Verifiziertes Trainer-Abzeichen',
      'Direkte Nachrichten',
      'Erweiterte Moderations-Tools',
      'API-Zugang für Integrationen',
      'Priorität bei Feature-Anfragen',
      'Umsatzbeteiligung'
    ]
  }
];

export default function SubscriptionPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const { data: userSubscription } = useQuery({
    queryKey: ["/api/users", currentUser?.id, "subscription"],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const response = await fetch(`/api/users/${currentUser.id}/subscription`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!currentUser?.id,
  });

  const currentTier = userSubscription?.tier || 'free';

  if (selectedPlan) {
    const plan = subscriptionPlans.find(p => p.id === selectedPlan);
    if (plan?.stripePriceId) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Upgrade zu {plan.name}
                </CardTitle>
                <p className="text-center text-muted-foreground">
                  Schließe dein Abonnement ab, um alle Premium-Features zu nutzen
                </p>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise}>
                  <SubscriptionCheckout 
                    plan={plan}
                    onSuccess={() => {
                      setSelectedPlan(null);
                      window.location.reload();
                    }}
                    onCancel={() => setSelectedPlan(null)}
                  />
                </Elements>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Wähle deinen Trainingsplan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Erweitere deine Hundeerziehung mit Premium-Features und unbegrenztem Zugang 
            zur Wolkenkrümel-Community
          </p>
        </div>

        {/* Current Subscription Status */}
        {currentUser && (
          <div className="text-center mb-8">
            <Badge variant="outline" className="text-lg px-4 py-2">
              Aktueller Plan: {subscriptionPlans.find(p => p.id === currentTier)?.name || 'Community'}
            </Badge>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {subscriptionPlans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentTier === plan.id;
            const isUpgrade = plan.id !== 'free' && currentTier === 'free';
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'ring-2 ring-primary' : ''} ${isCurrentPlan ? 'bg-muted/50' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Beliebteste Wahl
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    {plan.price === 0 ? (
                      <span>Kostenlos</span>
                    ) : (
                      <>
                        €{plan.price}
                        <span className="text-base font-normal text-muted-foreground">
                          /{plan.interval}
                        </span>
                      </>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      Aktueller Plan
                    </Button>
                  ) : plan.id === 'free' ? (
                    <Button variant="outline" className="w-full" disabled>
                      Aktueller Plan
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => setSelectedPlan(plan.id)}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {isUpgrade ? 'Upgrade starten' : 'Plan wählen'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Häufig gestellte Fragen
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kann ich jederzeit kündigen?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ja, du kannst dein Abonnement jederzeit kündigen. Du behältst Zugang 
                  zu allen Premium-Features bis zum Ende deines aktuellen Abrechnungszeitraums.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Was passiert mit meinen Daten?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Alle deine erstellten Aktivitäten und Inhalte bleiben erhalten. 
                  Nur die Premium-Features werden nach einer Kündigung deaktiviert.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gibt es eine Geld-zurück-Garantie?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Ja, wir bieten eine 30-Tage-Geld-zurück-Garantie. Falls du nicht 
                  zufrieden bist, erstatten wir den vollen Betrag zurück.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Welche Zahlungsmethoden werden akzeptiert?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Wir akzeptieren alle gängigen Kreditkarten, PayPal und SEPA-Lastschrift 
                  über unseren sicheren Zahlungsanbieter Stripe.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}