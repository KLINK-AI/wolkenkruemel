import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Edit, Plus, Search, Clock, Users } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Activity } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function AdminActivitiesPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const response = await fetch('/api/activities');
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: async (activityId: number) => {
      await apiRequest("DELETE", `/api/activities/${activityId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Aktivität gelöscht",
        description: "Die Aktivität wurde erfolgreich gelöscht.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: error.message || "Aktivität konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    },
  });

  const filteredActivities = activities.filter(activity =>
    activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const testActivities = filteredActivities.filter(activity => 
    activity.title.toLowerCase().includes("test") || 
    activity.description.toLowerCase().includes("test")
  );

  const realActivities = filteredActivities.filter(activity => 
    !activity.title.toLowerCase().includes("test") && 
    !activity.description.toLowerCase().includes("test")
  );

  const handleDeleteActivity = (activityId: number) => {
    deleteActivityMutation.mutate(activityId);
  };

  const handleDeleteAllTest = () => {
    testActivities.forEach(activity => {
      deleteActivityMutation.mutate(activity.id);
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Bitte loggen Sie sich ein</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link href="/activities">
              <Button variant="ghost" className="mb-4">
                Zurück zu Aktivitäten
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Aktivitäten Verwaltung</h1>
            <p className="text-muted-foreground">
              Bearbeiten, löschen und verwalten Sie alle Aktivitäten
            </p>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Aktivitäten suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/activities/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Neue Aktivität
                </Button>
              </Link>
              {testActivities.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Alle Test-Aktivitäten löschen ({testActivities.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Test-Aktivitäten löschen</AlertDialogTitle>
                      <AlertDialogDescription>
                        Sind Sie sicher, dass Sie alle {testActivities.length} Test-Aktivitäten löschen möchten? 
                        Diese Aktion kann nicht rückgängig gemacht werden.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAllTest}>
                        Alle löschen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Aktivitäten werden geladen...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {testActivities.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-orange-600">
                    Test-Aktivitäten ({testActivities.length})
                  </h2>
                  <div className="grid gap-4">
                    {testActivities.map((activity) => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        onDelete={handleDeleteActivity}
                        isTest={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-xl font-semibold mb-4 text-green-600">
                  Echte Aktivitäten ({realActivities.length})
                </h2>
                <div className="grid gap-4">
                  {realActivities.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      onDelete={handleDeleteActivity}
                      isTest={false}
                    />
                  ))}
                </div>
              </div>

              {filteredActivities.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground dark:text-gray-400">Keine Aktivitäten gefunden</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ActivityCardProps {
  activity: Activity;
  onDelete: (id: number) => void;
  isTest: boolean;
}

function ActivityCard({ activity, onDelete, isTest }: ActivityCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Anfänger';
      case 'intermediate': return 'Fortgeschritten';
      case 'advanced': return 'Experte';
      default: return difficulty;
    }
  };

  return (
    <Card className={`${isTest ? 'border-orange-200 dark:border-orange-800' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">{activity.title}</h3>
              {isTest && <Badge variant="secondary" className="text-orange-600">Test</Badge>}
            </div>
            <p className="text-muted-foreground mb-3 line-clamp-2">{activity.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {activity.duration} Min
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {activity.completions} beherrschen das
              </div>
              <Badge className={getDifficultyColor(activity.difficulty)}>
                {getDifficultyLabel(activity.difficulty)}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Link href={`/activities/${activity.id}`}>
              <Button variant="outline" size="sm">
                Ansehen
              </Button>
            </Link>
            <Link href={`/activities/${activity.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-1" />
                Bearbeiten
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Löschen
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Aktivität löschen</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sind Sie sicher, dass Sie "{activity.title}" löschen möchten? 
                    Diese Aktion kann nicht rückgängig gemacht werden.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(activity.id)}>
                    Löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}