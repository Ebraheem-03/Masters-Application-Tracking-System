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
import { useMemo, useState } from "react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AddApplicationForm } from "@/components/AddApplicationForm";

export default function Dashboard() {
  const { applications, fetchApplications } = useApplicationsStore();
  const [showAddForm, setShowAddForm] = useState(false);

  const stats = useMemo(() => {
    const total = applications.length;
    const offers = applications.filter(app => app.status === 'Accepted').length;
    const submitted = applications.filter(app => app.status === 'Submitted').length;
    const rejections = applications.filter(app => app.status === 'Rejected').length;

    // Calculate upcoming deadlines (next 7 days)
    const now = new Date();
    const nextWeek = addDays(now, 7);
    const upcomingDeadlines = applications
      .filter(app => {
        const deadlineDate = new Date(app.deadline);
        return isAfter(deadlineDate, now) && isBefore(deadlineDate, nextWeek);
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    return { total, offers, submitted, rejections, upcomingDeadlines };
  }, [applications]);

  const recentActivity = useMemo(() => {
    return applications
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [applications]);

  const handleAddSuccess = () => {
    setShowAddForm(false);
    fetchApplications();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your graduate application journey
          </p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Application</DialogTitle>
              <DialogDescription>
                Create a new graduate program application with all the required details.
              </DialogDescription>
            </DialogHeader>
            <AddApplicationForm onSuccess={handleAddSuccess} onCancel={() => setShowAddForm(false)} />
          </DialogContent>
        </Dialog>
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
          title="Submitted"
          value={stats.submitted}
          icon={TrendingUp}
          description="Applications submitted"
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
              stats.upcomingDeadlines.map((application) => (
                <div key={application._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">
                      {application.universityName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {application.degree}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {format(new Date(application.deadline), 'MMM dd')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {application.priority} priority
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
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No recent activity
              </p>
            ) : (
              recentActivity.map((application) => (
                <div key={application._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">
                      {application.universityName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {application.degree} • {application.city}, {application.country}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={application.status} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}