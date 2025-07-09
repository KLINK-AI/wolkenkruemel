import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check, X, Users } from "lucide-react";
import PremiumInfoModal from "@/components/community/PremiumInfoModal";

export default function PremiumFeaturesPage() {
  const [showModal, setShowModal] = useState(false);

  const freeFeatures = [
    "Alle Aktivitäten ansehen",
    "Community Posts lesen",
    "Bis zu 5 eigene Aktivitäten erstellen",
    "Aktivitäten-Details einsehen"
  ];

  const premiumFeatures = [
    "Fortschritte speichern",
    "Posts schreiben und kommentieren", 
    "Unendlich viele Aktivitäten anlegen",
    "Aktivitäten teilen",
    "Favoriten bei Aktivitäten speichern",
    "Unbegrenzte Community-Interaktionen"
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Crown className="w-16 h-16 mx-auto mb-4 text-amber-600" />
          <h1 className="text-4xl font-bold mb-4">Premium Features</h1>
          <p className="text-xl text-muted-foreground">
            Entdecke alle Funktionen der Wolkenkrümel Platform
          </p>
        </div>

        {/* Feature Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Free Version */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Kostenlose Version
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ul className="space-y-3">
                  {freeFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Einschränkungen:</strong>
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-red-600">
                      <X className="w-4 h-4" />
                      Keine Fortschritte speicherbar
                    </li>
                    <li className="flex items-center gap-2 text-sm text-red-600">
                      <X className="w-4 h-4" />
                      Kein Posten oder Kommentieren
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Version */}
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-amber-700 dark:text-amber-300 flex items-center justify-center gap-2">
                <Crown className="w-6 h-6" />
                Premium Version
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ul className="space-y-3">
                  {premiumFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="border-t border-amber-200 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Monatlich:</span>
                      <span className="text-lg font-bold text-amber-700 dark:text-amber-300">2,99 €</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Jährlich:</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-amber-700 dark:text-amber-300">29,90 €</span>
                        <p className="text-xs text-amber-600 dark:text-amber-400">2 Monate kostenlos!</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setShowModal(true)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Premium freischalten (Testphase)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Warum Premium?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold mb-2">Vollständige Funktionen</h3>
                <p className="text-sm text-muted-foreground">
                  Nutze alle Features der Plattform ohne Einschränkungen
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold mb-2">Community-Zugang</h3>
                <p className="text-sm text-muted-foreground">
                  Teile deine Erfahrungen und lerne von anderen Hundebesitzern
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold mb-2">Fortschritte verfolgen</h3>
                <p className="text-sm text-muted-foreground">
                  Speichere deinen Trainingsfortschritt und verfolge Erfolge
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premium Modal */}
      <PremiumInfoModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}