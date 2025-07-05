import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Plus } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function AccessGate() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const handleCreateActivity = () => {
    setLocation("/create-activity");
  };

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral">{t('premium.unlock')}</h3>
              <p className="text-sm text-gray-600">{t('premium.unlockDescription')}</p>
            </div>
          </div>
          <Button 
            onClick={handleCreateActivity}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('activity.create')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
