import { 
  FileText, 
  Calendar, 
  CheckCircle, 
  Clock,
  Plus,
  TrendingUp 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useApplicationsStore } from "@/store/applications";
import { useMemo } from "react";
import { format, isAfter, isBefore, addDays } from "date-fns";

export default function Dashboard() {
  const { applications } = useApplicationsStore();

  const stats = useMemo(() => {
    const total = applications.length;
    const offers = applications.filter(app => app.status === 'OFFER').length;
    const interviews = applications.filter(app => app.status === 'INTERVIEW').length;
    const rejections = applications.filter(app => app.status === 'REJECTED').length;

    // Calculate upcoming deadlines (next 7 days)
    const now = new Date();
    const nextWeek = addDays(now, 7);
    const upcomingDeadlines = applications
      .flatMap(app => app.deadlines.map(deadline => ({
        ...deadline,
        application: app
      })))
      .filter(deadline => {
        const deadlineDate = new Date(deadline.date);
        return isAfter(deadlineDate, now) && isBefore(deadlineDate, nextWeek);
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { total, offers, interviews, rejections, upcomingDeadlines };
  }, [applications]);

  const recentActivity = useMemo(() => {
    return applications
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [applications]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your graduate application journey
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Application
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Applications"
          value={stats.total}
          icon={FileText}
          description="Active applications"
        />
        <StatCard
          title="Offers Received"
          value={stats.offers}
          icon={CheckCircle}
          description={`Acceptance rate: ${stats.total > 0 ? Math.round((stats.offers / stats.total) * 100) : 0}%`}
        />
        <StatCard
          title="Interviews"
          value={stats.interviews}
          icon={TrendingUp}
          description="Scheduled or completed"
        />
        <StatCard
          title="Upcoming Deadlines"
          value={stats.upcomingDeadlines.length}
          icon={Clock}
          description="Next 7 days"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* What's Next */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              What's Next
            </CardTitle>
            <CardDescription>
              Upcoming deadlines and actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.upcomingDeadlines.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No upcoming deadlines in the next 7 days
              </p>
            ) : (
              stats.upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">
                      {deadline.application.university.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {deadline.label} • {deadline.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {format(new Date(deadline.date), 'MMM dd')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest application updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((application) => (
              <div key={application._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">
                    {application.university.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {application.program.title} • {application.program.degree}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={application.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}