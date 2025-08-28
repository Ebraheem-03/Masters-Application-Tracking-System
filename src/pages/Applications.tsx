import { useState } from "react";
import { Plus, LayoutGrid, Table2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useApplicationsStore } from "@/store/applications";
import { format } from "date-fns";

export default function Applications() {
  const { applications } = useApplicationsStore();
  const [activeTab, setActiveTab] = useState("board");

  const statusColumns = [
    { id: 'PLANNING', title: 'Planning', status: 'PLANNING' as const },
    { id: 'ELIGIBLE', title: 'Eligible', status: 'ELIGIBLE' as const },
    { id: 'APPLIED', title: 'Applied', status: 'APPLIED' as const },
    { id: 'SUBMITTED', title: 'Submitted', status: 'SUBMITTED' as const },
    { id: 'INTERVIEW', title: 'Interview', status: 'INTERVIEW' as const },
    { id: 'OFFER', title: 'Offer', status: 'OFFER' as const },
    { id: 'WAITLISTED', title: 'Waitlisted', status: 'WAITLISTED' as const },
    { id: 'REJECTED', title: 'Rejected', status: 'REJECTED' as const },
  ];

  const getApplicationsByStatus = (status: string) => {
    return applications.filter(app => app.status === status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">
            Manage your graduate program applications
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Application
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="board" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Board
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Table2 className="h-4 w-4" />
            Table
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        {/* Board View */}
        <TabsContent value="board" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
            {statusColumns.map((column) => {
              const columnApplications = getApplicationsByStatus(column.status);
              return (
                <Card key={column.id} className="min-w-[280px]">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {column.title}
                      </CardTitle>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {columnApplications.length}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {columnApplications.map((application) => (
                      <Card key={application._id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">
                              {application.university.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {application.program.title}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                application.priority === 'High' ? 'bg-destructive/10 text-destructive' :
                                application.priority === 'Medium' ? 'bg-warning/10 text-warning' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {application.priority || 'Low'}
                              </span>
                              {application.deadlines.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(application.deadlines[0].date), 'MMM dd')}
                                </span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {columnApplications.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No applications
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Table View */}
        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Applications</CardTitle>
              <CardDescription>
                Complete list of your graduate program applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                          University
                        </th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                          Program
                        </th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                          Priority
                        </th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                          Next Deadline
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((application) => (
                        <tr key={application._id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{application.university.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {application.university.country}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{application.program.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {application.program.degree} • {application.program.term} {application.program.year}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <StatusBadge status={application.status} />
                          </td>
                          <td className="p-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              application.priority === 'High' ? 'bg-destructive/10 text-destructive' :
                              application.priority === 'Medium' ? 'bg-warning/10 text-warning' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {application.priority || 'Low'}
                            </span>
                          </td>
                          <td className="p-4 text-sm">
                            {application.deadlines.length > 0 ? (
                              <div>
                                <div>{format(new Date(application.deadlines[0].date), 'MMM dd, yyyy')}</div>
                                <div className="text-muted-foreground">{application.deadlines[0].label}</div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No deadlines</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Calendar</CardTitle>
              <CardDescription>
                View all deadlines and important dates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Calendar view coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}