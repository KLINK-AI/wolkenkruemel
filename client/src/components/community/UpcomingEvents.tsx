import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchApi } from "@/lib/api";

export default function UpcomingEvents() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => fetchApi("/api/events"),
  });

  // Mock data as fallback
  const mockEvents = [
    {
      id: 1,
      title: "Virtual Training Workshop",
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      attendees: 24,
      isVirtual: true,
    },
    {
      id: 2,
      title: "Dog Park Meetup",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // In 5 days
      attendees: 12,
      isVirtual: false,
    },
  ];

  const displayEvents = events || mockEvents;

  const formatEventDate = (date: string | Date) => {
    const eventDate = new Date(date);
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    if (eventDate.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow, " + eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else {
      return eventDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="border-l-4 border-primary pl-4">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {displayEvents.map((event: any, index: number) => (
              <div 
                key={event.id} 
                className={`border-l-4 pl-4 ${
                  index === 0 ? 'border-primary' : 'border-secondary'
                }`}
              >
                <h4 className="text-sm font-medium text-neutral">{event.title}</h4>
                <p className="text-xs text-gray-600">{formatEventDate(event.date)}</p>
                <p className="text-xs text-gray-500">{event.attendees} attending</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
