import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, GraduationCap } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApplicationsStore } from "@/store/applications";
import { format, isSameDay, isAfter, isBefore, addDays } from "date-fns";

export default function CalendarPage() {
  const { applications, fetchApplications } = useApplicationsStore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [calendarView, setCalendarView] = useState<"month" | "week">("month");

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Get applications for a specific date
  const getApplicationsForDate = (date: Date) => {
    return applications.filter(app => 
      isSameDay(new Date(app.deadline), date)
    );
  };

  // Get upcoming deadlines (next 30 days)
  const getUpcomingDeadlines = () => {
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);
    
    return applications
      .filter(app => {
        const deadline = new Date(app.deadline);
        return isAfter(deadline, today) && isBefore(deadline, thirtyDaysFromNow);
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  };

  // Get overdue applications
  const getOverdueApplications = () => {
    const today = new Date();
    
    return applications
      .filter(app => isBefore(new Date(app.deadline), today))
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  };

  const upcomingDeadlines = getUpcomingDeadlines();
  const overdueApplications = getOverdueApplications();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">
          View application deadlines and important dates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Application Deadlines
              </CardTitle>
              <CardDescription>
                Click on a date to see applications due on that day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  hasDeadline: (date) => {
                    return applications.some(app => 
                      isSameDay(new Date(app.deadline), date)
                    );
                  }
                }}
                modifiersStyles={{
                  hasDeadline: {
                    fontWeight: 'bold',
                    position: 'relative'
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Selected Date Details & Upcoming */}
        <div className="space-y-6">
          {/* Selected Date Details */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </CardTitle>
                <CardDescription>
                  Applications due on this date
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getApplicationsForDate(selectedDate).length > 0 ? (
                  <div className="space-y-3">
                    {getApplicationsForDate(selectedDate).map((app) => (
                      <div key={app._id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">{app.universityName}</h4>
                            <p className="text-xs text-muted-foreground">{app.degree}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {app.city}, {app.country}
                            </div>
                          </div>
                          <Badge variant={app.priority === 'High' ? 'destructive' : app.priority === 'Medium' ? 'secondary' : 'outline'}>
                            {app.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No deadlines on this date
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Upcoming Deadlines
              </CardTitle>
              <CardDescription>
                Next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length > 0 ? (
                <div className="space-y-3">
                  {upcomingDeadlines.slice(0, 5).map((app) => (
                    <div key={app._id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm">{app.universityName}</h4>
                          <p className="text-xs text-muted-foreground">{app.degree}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(app.deadline), 'MMM d')}
                          </div>
                        </div>
                        <Badge variant={app.priority === 'High' ? 'destructive' : app.priority === 'Medium' ? 'secondary' : 'outline'}>
                          {app.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {upcomingDeadlines.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +{upcomingDeadlines.length - 5} more deadlines
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming deadlines
                </p>
              )}
            </CardContent>
          </Card>

          {/* Overdue Applications */}
          {overdueApplications.length > 0 && (
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                  <Clock className="h-4 w-4" />
                  Overdue Applications
                </CardTitle>
                <CardDescription>
                  Past deadlines that need attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overdueApplications.slice(0, 3).map((app) => (
                    <div key={app._id} className="p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm">{app.universityName}</h4>
                        <p className="text-xs text-muted-foreground">{app.degree}</p>
                        <div className="flex items-center gap-1 text-xs text-destructive">
                          <Clock className="h-3 w-3" />
                          Overdue since {format(new Date(app.deadline), 'MMM d')}
                        </div>
                      </div>
                    </div>
                  ))}
                  {overdueApplications.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +{overdueApplications.length - 3} more overdue
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
