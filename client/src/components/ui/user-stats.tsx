import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { CheckCircle, FileText, Heart, TrendingUp } from 'lucide-react';
import { LoadingSpinner } from './loading-spinner';

interface UserStats {
  activitiesCreated: number;
  activitiesCompleted: number;
  postsCreated: number;
  likesReceived: number;
  tier: string;
}

interface UserStatsProps {
  userId: number;
  compact?: boolean;
  className?: string;
}

export function UserStats({ userId, compact = false, className = "" }: UserStatsProps) {
  const { data: stats, isLoading, error } = useQuery<UserStats>({
    queryKey: [`/api/user-stats/${userId}`],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className={`flex justify-center p-4 ${className}`}>
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={`text-center text-muted-foreground p-4 ${className}`}>
        Statistiken konnten nicht geladen werden
      </div>
    );
  }

  const statItems = [
    {
      icon: CheckCircle,
      label: "Aktivitäten abgeschlossen",
      value: stats.activitiesCompleted,
      color: "text-green-600"
    },
    {
      icon: FileText,
      label: "Beiträge erstellt",
      value: stats.postsCreated,
      color: "text-blue-600"
    },
    {
      icon: Heart,
      label: "Likes erhalten",
      value: stats.likesReceived,
      color: "text-red-600"
    }
  ];

  if (compact) {
    return (
      <div className={`grid grid-cols-3 gap-4 ${className}`}>
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Deine Statistiken</h3>
        <Badge variant={stats.tier === 'premium' ? 'default' : 'secondary'}>
          {stats.tier === 'premium' ? 'Premium' : 'Kostenlos'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </CardTitle>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                {item.label === "Aktivitäten abgeschlossen" && stats.activitiesCreated > 0 && (
                  <p className="text-xs text-muted-foreground">
                    von {stats.activitiesCreated} erstellt
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}