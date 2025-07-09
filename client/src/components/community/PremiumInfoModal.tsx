import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Crown, X } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface PremiumInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumInfoModal({ isOpen, onClose }: PremiumInfoModalProps) {
  const { t } = useLanguage();

  const premiumFeatures = [
    "Fortschritte speichern",
    "Posts schreiben und kommentieren", 
    "Unendlich viele Aktivitäten anlegen",
    "Aktivitäten teilen",
    "Favoriten bei Aktivitäten speichern",
    "Unbegrenzte Community-Interaktionen"
  ];

  const freeFeatures = [
    "Alle Aktivitäten ansehen",
    "Community Posts lesen",
    "Bis zu 5 eigene Aktivitäten erstellen",
    "Aktivitäten-Details einsehen"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="w-6 h-6 text-amber-600" />
            Premium freischalten
          </DialogTitle>
          <DialogDescription>
            Entdecke alle Funktionen der Wolkenkrümel Platform
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4">
          {/* Free Version */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-muted-foreground">
              Kostenlose Version
            </h3>
            <ul className="space-y-2">
              {freeFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Einschränkungen:</strong>
              </p>
              <ul className="space-y-1 mt-2">
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

          {/* Premium Version */}
          <div className="space-y-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Premium Version
            </h3>
            <ul className="space-y-2">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-amber-600" />
                  {feature}
                </li>
              ))}
            </ul>
            
            <div className="border-t border-amber-200 dark:border-amber-700 pt-4">
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
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Später
          </Button>
          <Button 
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => {
              // Demo upgrade for test phase
              fetch('/api/demo-upgrade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: realUser?.id })
              }).then(() => {
                onClose();
                window.location.reload();
              }).catch(error => {
                console.error('Demo upgrade failed:', error);
              });
            }}
          >
            <Crown className="w-4 h-4 mr-2" />
            Premium freischalten (Testphase)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}