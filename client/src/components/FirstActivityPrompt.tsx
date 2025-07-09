import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Star, Users, Trophy } from "lucide-react";
import { Link } from "wouter";

export default function FirstActivityPrompt() {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle className="text-2xl text-blue-800 dark:text-blue-200">
          Willkommen bei Wolkenkrümel!
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-blue-700 dark:text-blue-300 text-lg">
          Erstelle deine erste Trainingsaktivität und werde Teil unserer Community!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-6">
          <div className="flex items-center gap-2 justify-center">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-700 dark:text-blue-300">Hilf anderen</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <Trophy className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-700 dark:text-blue-300">Teile Erfolge</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <Star className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-700 dark:text-blue-300">Werde Experte</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
            ✨ Erste Aktivität = Vollzugriff zur Community
          </Badge>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Nach deiner ersten Aktivität kannst du Posts schreiben, kommentieren und noch mehr!
          </p>
        </div>
        
        <Link href="/premium">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-4" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Premium Feature
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}