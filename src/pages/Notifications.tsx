import { useState, useEffect } from "react";
import { Bell, Check, Clock, AlertCircle, Trash2, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApplicationsStore } from "@/store/applications";
import { format, isAfter, isBefore, addDays } from "date-fns";

interface Notification {
  id: string;
  type: 'deadline' | 'reminder' | 'status-update' | 'document' | 'interview';
  title: string;
  message: string;
  date: Date;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  applicationId?: string;
  applicationName?: string;
}

export default function NotificationsPage() {
  const { applications } = useApplicationsStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');

  useEffect(() => {
    generateNotifications();
  }, [applications]);

  const generateNotifications = () => {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const nextWeek = addDays(today, 7);
    const twoWeeks = addDays(today, 14);

    const generatedNotifications: Notification[] = [];

    applications.forEach((app) => {
      const deadline = new Date(app.deadline);
      
      // Overdue notifications
      if (isBefore(deadline, today) && app.status !== 'Submitted' && app.status !== 'Accepted' && app.status !== 'Rejected') {
        generatedNotifications.push({
          id: `overdue-${app._id}`,
          type: 'deadline',
          title: 'Application Overdue',
          message: `The deadline for ${app.universityName} (${app.degree}) has passed. Consider updating the status or extending the deadline.`,
          date: deadline,
          read: false,
          priority: 'high',
          applicationId: app._id,
          applicationName: app.universityName,
        });
      }
      
      // Tomorrow deadline notifications
      else if (isAfter(deadline, today) && isBefore(deadline, tomorrow)) {
        generatedNotifications.push({
          id: `tomorrow-${app._id}`,
          type: 'deadline',
          title: 'Deadline Tomorrow',
          message: `${app.universityName} (${app.degree}) application deadline is tomorrow!`,
          date: new Date(),
          read: false,
          priority: 'high',
          applicationId: app._id,
          applicationName: app.universityName,
        });
      }
      
      // This week deadline notifications
      else if (isAfter(deadline, tomorrow) && isBefore(deadline, nextWeek)) {
        generatedNotifications.push({
          id: `week-${app._id}`,
          type: 'deadline',
          title: 'Deadline This Week',
          message: `${app.universityName} (${app.degree}) application deadline is on ${format(deadline, 'MMMM dd')}.`,
          date: new Date(),
          read: false,
          priority: 'medium',
          applicationId: app._id,
          applicationName: app.universityName,
        });
      }
      
      // Two weeks reminder for high priority applications
      else if (app.priority === 'High' && isAfter(deadline, nextWeek) && isBefore(deadline, twoWeeks)) {
        generatedNotifications.push({
          id: `two-weeks-${app._id}`,
          type: 'reminder',
          title: 'High Priority Application Due Soon',
          message: `High priority application for ${app.universityName} (${app.degree}) is due in ${Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} days.`,
          date: new Date(),
          read: false,
          priority: 'medium',
          applicationId: app._id,
          applicationName: app.universityName,
        });
      }

      // Status-based notifications
      if (app.status === 'Draft') {
        generatedNotifications.push({
          id: `draft-${app._id}`,
          type: 'status-update',
          title: 'Application Still in Draft',
          message: `Your application for ${app.universityName} is still in draft status. Consider moving it to "In Progress".`,
          date: new Date(),
          read: true,
          priority: 'low',
          applicationId: app._id,
          applicationName: app.universityName,
        });
      }
    });

    // Add some sample system notifications
    generatedNotifications.push({
      id: 'welcome',
      type: 'status-update',
      title: 'Welcome to Masters Application Tracker',
      message: 'Your application tracking system is ready! Start by adding your first application.',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      read: true,
      priority: 'low',
    });

    setNotifications(generatedNotifications.sort((a, b) => b.date.getTime() - a.date.getTime()));
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'high':
        return notifications.filter(n => n.priority === 'high');
      default:
        return notifications;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'deadline':
        return <Clock className="h-4 w-4" />;
      case 'reminder':
        return <Bell className="h-4 w-4" />;
      case 'status-update':
        return <AlertCircle className="h-4 w-4" />;
      case 'document':
        return <Check className="h-4 w-4" />;
      case 'interview':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with deadlines, reminders, and application status changes
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            Mark all as read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {notifications.filter(n => n.priority === 'high').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Notifications</SelectItem>
              <SelectItem value="unread">Unread Only</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No notifications to display</p>
                <p className="text-sm">Check back later for updates</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all hover:shadow-md ${!notification.read ? 'border-blue-200 bg-blue-50/50' : ''}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-full ${!notification.read ? 'bg-blue-100' : 'bg-muted'}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </h3>
                        <Badge variant={getPriorityColor(notification.priority) as any}>
                          {notification.priority}
                        </Badge>
                        {!notification.read && (
                          <Badge variant="default">New</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{format(notification.date, 'MMM dd, yyyy • h:mm a')}</span>
                        {notification.applicationName && (
                          <span>• {notification.applicationName}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
