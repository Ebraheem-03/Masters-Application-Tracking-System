import { useState, useEffect } from "react";
import { Plus, LayoutGrid, Table2, Calendar, Filter, SortAsc, SortDesc, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useApplicationsStore } from "@/store/applications";
import { AddApplicationForm } from "@/components/AddApplicationForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, isSameDay, isAfter, isBefore, addDays } from "date-fns";

export default function Applications() {
  const { 
    applications, 
    isLoading, 
    error, 
    filters, 
    setFilters, 
    fetchApplications,
    updateApplication,
    deleteApplication
  } = useApplicationsStore();
  const [activeTab, setActiveTab] = useState("board");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingApplication, setEditingApplication] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Ensure applications is an array and filter out null/undefined values
  const safeApplications = Array.isArray(applications) ? applications.filter(app => app !== null && app !== undefined) : [];

  const statusColumns = [
    { id: 'Draft', title: 'Draft', status: 'Draft' as const },
    { id: 'In Progress', title: 'In Progress', status: 'In Progress' as const },
    { id: 'Submitted', title: 'Submitted', status: 'Submitted' as const },
    { id: 'Accepted', title: 'Accepted', status: 'Accepted' as const },
    { id: 'Rejected', title: 'Rejected', status: 'Rejected' as const },
  ];

  const getApplicationsByStatus = (status: string) => {
    return safeApplications.filter(app => app && app.status === status);
  };

  // Get applications for a specific date
  const getApplicationsForDate = (date: Date) => {
    return safeApplications.filter(app => 
      app && app.deadline && isSameDay(new Date(app.deadline), date)
    );
  };

  // Get upcoming deadlines (next 30 days)
  const getUpcomingDeadlines = () => {
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);
    
    return safeApplications
      .filter(app => {
        if (!app || !app.deadline) return false;
        const deadline = new Date(app.deadline);
        return isAfter(deadline, today) && isBefore(deadline, thirtyDaysFromNow);
      })
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  };

  // Get overdue applications
  const getOverdueApplications = () => {
    const today = new Date();
    
    return safeApplications
      .filter(app => app && app.deadline && app.status &&
                     isBefore(new Date(app.deadline), today) && 
                     (app.status === 'Draft' || app.status === 'In Progress'))
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    fetchApplications();
  };

  const handleEditApplication = (application: any) => {
    setEditingApplication(application);
  };

  const handleEditSuccess = () => {
    setEditingApplication(null);
    fetchApplications();
  };

  const handleDeleteApplication = async (id: string) => {
    try {
      await deleteApplication(id);
      fetchApplications();
    } catch (error) {
      console.error('Failed to delete application:', error);
    }
  };

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchApplications}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Applications
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your graduate program applications
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

        {/* Edit Application Dialog */}
        <Dialog open={!!editingApplication} onOpenChange={(open) => !open && setEditingApplication(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Application</DialogTitle>
              <DialogDescription>
                Update your graduate program application details.
              </DialogDescription>
            </DialogHeader>
            {editingApplication && (
              <AddApplicationForm 
                initialData={editingApplication}
                onSuccess={handleEditSuccess} 
                onCancel={() => setEditingApplication(null)} 
                isEditing={true}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Sorting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters & Sorting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select 
                value={filters.priority || "all"} 
                onValueChange={(value) => setFilters({ priority: value === "all" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={filters.status || "all"} 
                onValueChange={(value) => setFilters({ status: value === "all" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                placeholder="Filter by country"
                value={filters.country || ""}
                onChange={(e) => setFilters({ country: e.target.value || undefined })}
              />
            </div>

            <div className="space-y-2">
              <Label>Sort By</Label>
              <div className="flex gap-2">
                <Select 
                  value={filters.sortBy} 
                  onValueChange={(value) => setFilters({ sortBy: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="tuitionFees">Tuition Fees</SelectItem>
                    <SelectItem value="livingExpenses">Living Expenses</SelectItem>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setFilters({ 
                    sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
                  })}
                >
                  {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Loading applications...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto">
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
                        <Card key={application._id} className="group hover:shadow-md transition-shadow relative">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <h4 className="font-medium text-sm pr-8">
                                  {application.universityName}
                                </h4>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                                    >
                                      <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleEditApplication(application)}
                                      className="flex items-center gap-2"
                                    >
                                      <Edit className="h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                          onSelect={(e) => e.preventDefault()}
                                          className="flex items-center gap-2 text-destructive focus:text-destructive"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          Delete
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your
                                            application for {application.universityName}.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteApplication(application._id)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {application.degree}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  application.priority === 'High' ? 'bg-destructive/10 text-destructive' :
                                  application.priority === 'Medium' ? 'bg-warning/10 text-warning' :
                                  'bg-muted text-muted-foreground'
                                }`}>
                                  {application.priority}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(application.deadline), 'MMM dd')}
                                </span>
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
          )}
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
              {isLoading ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground">Loading applications...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                            University
                          </th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                            Degree
                          </th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                            Status
                          </th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                            Priority
                          </th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                            Deadline
                          </th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                            Tuition Fees
                          </th>
                          <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {safeApplications.map((application) => (
                          <tr key={application._id} className="border-b hover:bg-muted/50">
                            <td className="p-4">
                              <div>
                                <div className="font-medium">{application.universityName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {application.city}, {application.country}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <div className="font-medium">{application.degree}</div>
                                <div className="text-sm text-muted-foreground">
                                  {application.startingSemester} • {application.numberOfSemesters} semesters
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
                                {application.priority}
                              </span>
                            </td>
                            <td className="p-4 text-sm">
                              <div>
                                <div>{format(new Date(application.deadline), 'MMM dd, yyyy')}</div>
                                <div className="text-muted-foreground">
                                  {new Date(application.deadline) < new Date() ? 'Overdue' : 'Upcoming'}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-sm">
                              <div>
                                <div>${application.tuitionFees.toLocaleString()}</div>
                                <div className="text-muted-foreground">+ ${application.livingExpenses.toLocaleString()}</div>
                              </div>
                            </td>
                            <td className="p-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleEditApplication(application)}
                                    className="flex items-center gap-2"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="flex items-center gap-2 text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete your
                                          application for {application.universityName}.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteApplication(application._id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Calendar */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Application Deadlines
                  </CardTitle>
                  <CardDescription>
                    Click on a date to see applications due on that day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{
                      hasDeadline: (date) => {
                        return applications.some(app => 
                          isSameDay(new Date(app.deadline), date)
                        );
                      },
                      highPriority: (date) => {
                        return applications.some(app => 
                          isSameDay(new Date(app.deadline), date) && app.priority === 'High'
                        );
                      },
                      overdue: (date) => {
                        return applications.some(app => 
                          isSameDay(new Date(app.deadline), date) && 
                          new Date(app.deadline) < new Date() &&
                          (app.status === 'Draft' || app.status === 'In Progress')
                        );
                      }
                    }}
                    modifiersStyles={{
                      hasDeadline: {
                        fontWeight: 'bold',
                        backgroundColor: 'hsl(var(--primary) / 0.1)',
                        border: '2px solid hsl(var(--primary) / 0.3)',
                        borderRadius: '4px'
                      },
                      highPriority: {
                        fontWeight: 'bold',
                        backgroundColor: 'hsl(var(--destructive) / 0.1)',
                        border: '2px solid hsl(var(--destructive) / 0.5)',
                        borderRadius: '4px',
                        color: 'hsl(var(--destructive))'
                      },
                      overdue: {
                        fontWeight: 'bold',
                        backgroundColor: 'hsl(var(--destructive) / 0.2)',
                        border: '2px solid hsl(var(--destructive))',
                        borderRadius: '4px',
                        color: 'hsl(var(--destructive))',
                        textDecoration: 'underline'
                      }
                    }}
                  />
                  
                  {/* Legend */}
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-primary/30 bg-primary/10"></div>
                      <span>Has Deadline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-destructive/50 bg-destructive/10"></div>
                      <span>High Priority</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-destructive bg-destructive/20"></div>
                      <span>Overdue</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Selected Date Details & Stats */}
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
                          <Card key={app._id} className="border-l-4 border-l-primary">
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <h4 className="font-medium text-sm">{app.universityName}</h4>
                                  <p className="text-xs text-muted-foreground">{app.degree}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{app.city}, {app.country}</span>
                                  </div>
                                  <StatusBadge status={app.status} />
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  app.priority === 'High' ? 'bg-destructive/15 text-destructive border border-destructive/20' :
                                  app.priority === 'Medium' ? 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' :
                                  'bg-muted text-muted-foreground border border-border'
                                }`}>
                                  {app.priority}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No deadlines on this date</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-primary/5 rounded border border-primary/20">
                    <span className="text-sm font-medium">Total Applications</span>
                    <span className="text-lg font-bold text-primary">{safeApplications.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-amber-50 rounded border border-amber-200 dark:bg-amber-900/10 dark:border-amber-800">
                    <span className="text-sm font-medium">Upcoming (30 days)</span>
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      {getUpcomingDeadlines().length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-destructive/5 rounded border border-destructive/20">
                    <span className="text-sm font-medium">Overdue</span>
                    <span className="text-lg font-bold text-destructive">{getOverdueApplications().length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-emerald-50 rounded border border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800">
                    <span className="text-sm font-medium">Submitted</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {safeApplications.filter(app => app.status === 'Submitted' || app.status === 'Accepted').length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Overdue Applications Alert */}
              {getOverdueApplications().length > 0 && (
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                      <Calendar className="h-4 w-4" />
                      Overdue Applications
                    </CardTitle>
                    <CardDescription>
                      {getOverdueApplications().length} deadline{getOverdueApplications().length === 1 ? '' : 's'} passed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {getOverdueApplications().slice(0, 3).map((app) => (
                        <div key={app._id} className="p-2 border border-destructive/20 rounded bg-background">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">{app.universityName}</h4>
                            <p className="text-xs text-muted-foreground">
                              Due: {format(new Date(app.deadline), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      ))}
                      {getOverdueApplications().length > 3 && (
                        <p className="text-xs text-center text-muted-foreground pt-1">
                          +{getOverdueApplications().length - 3} more overdue
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}