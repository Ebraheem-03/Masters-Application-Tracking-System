import { useState, useEffect } from "react";
import { FileText, Upload, CheckCircle, Clock, AlertCircle, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useApplicationsStore } from "@/store/applications";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  status: 'Draft' | 'Ready' | 'Uploaded';
  relatedApplications: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsPage() {
  const { applications, fetchApplications } = useApplicationsStore();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentItem | null>(null);
  const [filterType, setFilterType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    fetchApplications();
    // Initialize with some sample documents based on applications
    initializeDocuments();
  }, [fetchApplications]);

  const initializeDocuments = () => {
    const sampleDocs: DocumentItem[] = [
      {
        id: "1",
        name: "Statement of Purpose",
        type: "SOP",
        status: "Ready",
        relatedApplications: applications.map(app => app._id).slice(0, 2),
        notes: "Personal statement for graduate school applications",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "CV/Resume",
        type: "CV",
        status: "Uploaded",
        relatedApplications: applications.map(app => app._id),
        notes: "Updated resume with latest experience",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "3",
        name: "Official Transcripts",
        type: "Transcript",
        status: "Draft",
        relatedApplications: applications.map(app => app._id).slice(0, 1),
        notes: "Need to request from university",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setDocuments(sampleDocs);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Uploaded':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Ready':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'Draft':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Uploaded':
        return 'bg-green-100 text-green-800';
      case 'Ready':
        return 'bg-blue-100 text-blue-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationNames = (appIds: string[]) => {
    return appIds
      .map(id => applications.find(app => app._id === id)?.universityName)
      .filter(Boolean)
      .join(', ');
  };

  const filteredDocuments = documents.filter(doc => {
    if (filterType && doc.type !== filterType) return false;
    if (filterStatus && doc.status !== filterStatus) return false;
    return true;
  });

  const addDocument = (document: Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDoc: DocumentItem = {
      ...document,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDocuments([...documents, newDoc]);
    setShowAddDialog(false);
    toast({
      title: "Success",
      description: "Document added successfully!",
    });
  };

  const updateDocument = (id: string, updates: Partial<DocumentItem>) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, ...updates, updatedAt: new Date().toISOString() } : doc
    ));
    setEditingDocument(null);
    toast({
      title: "Success",
      description: "Document updated successfully!",
    });
  };

  const deleteDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
    toast({
      title: "Success",
      description: "Document deleted successfully!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Manage required documents for your applications
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Document</DialogTitle>
            </DialogHeader>
            <AddDocumentForm onAdd={addDocument} applications={applications} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={filterType || "all"} onValueChange={(value) => setFilterType(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="SOP">Statement of Purpose</SelectItem>
                  <SelectItem value="CV">CV/Resume</SelectItem>
                  <SelectItem value="Transcript">Transcripts</SelectItem>
                  <SelectItem value="LOR">Letters of Recommendation</SelectItem>
                  <SelectItem value="IELTS">IELTS</SelectItem>
                  <SelectItem value="TOEFL">TOEFL</SelectItem>
                  <SelectItem value="GRE">GRE</SelectItem>
                  <SelectItem value="Portfolio">Portfolio</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus || "all"} onValueChange={(value) => setFilterStatus(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Ready">Ready</SelectItem>
                  <SelectItem value="Uploaded">Uploaded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="by-application">By Application</TabsTrigger>
          <TabsTrigger value="by-status">By Status</TabsTrigger>
        </TabsList>

        {/* All Documents View */}
        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doc.status)}
                      <div>
                        <CardTitle className="text-base">{doc.name}</CardTitle>
                        <CardDescription className="text-xs">{doc.type}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingDocument(doc)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteDocument(doc.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(doc.updatedAt), 'MMM d')}
                    </span>
                  </div>
                  
                  {doc.relatedApplications.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Used in:</strong> {getApplicationNames(doc.relatedApplications)}
                    </div>
                  )}
                  
                  {doc.notes && (
                    <p className="text-xs text-muted-foreground">{doc.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* By Application View */}
        <TabsContent value="by-application" className="space-y-4">
          {applications.map((app) => (
            <Card key={app._id}>
              <CardHeader>
                <CardTitle className="text-lg">{app.universityName}</CardTitle>
                <CardDescription>{app.degree}</CardDescription>
              </CardHeader>
              <CardContent>
                {app.documentsRequired && app.documentsRequired.length > 0 ? (
                  <div className="space-y-3">
                    {app.documentsRequired.map((docName, index) => {
                      const doc = documents.find(d => d.name === docName);
                      return (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(doc?.status || 'Draft')}
                            <div>
                              <p className="font-medium">{docName}</p>
                              <p className="text-sm text-muted-foreground">
                                {doc ? `Status: ${doc.status}` : 'Not tracked yet'}
                              </p>
                            </div>
                          </div>
                          {doc && (
                            <Badge className={getStatusColor(doc.status)}>
                              {doc.status}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No documents required for this application
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* By Status View */}
        <TabsContent value="by-status" className="space-y-4">
          {['Draft', 'Ready', 'Uploaded'].map((status) => (
            <Card key={status}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  {status} Documents
                </CardTitle>
                <CardDescription>
                  {documents.filter(d => d.status === status).length} documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents
                    .filter(d => d.status === status)
                    .map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">{doc.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {getApplicationNames(doc.relatedApplications)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(doc.updatedAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Edit Document Dialog */}
      {editingDocument && (
        <Dialog open={!!editingDocument} onOpenChange={() => setEditingDocument(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Document</DialogTitle>
            </DialogHeader>
            <EditDocumentForm 
              document={editingDocument} 
              onUpdate={updateDocument}
              applications={applications}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Add Document Form Component
function AddDocumentForm({ 
  onAdd, 
  applications 
}: { 
  onAdd: (doc: Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  applications: any[];
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState<DocumentItem['status']>("Draft");
  const [notes, setNotes] = useState("");
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !type) return;

    onAdd({
      name,
      type,
      status,
      notes,
      relatedApplications: selectedApplications,
    });

    // Reset form
    setName("");
    setType("");
    setStatus("Draft");
    setNotes("");
    setSelectedApplications([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Document Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Statement of Purpose"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Document Type *</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SOP">Statement of Purpose</SelectItem>
            <SelectItem value="CV">CV/Resume</SelectItem>
            <SelectItem value="Transcript">Transcripts</SelectItem>
            <SelectItem value="LOR">Letters of Recommendation</SelectItem>
            <SelectItem value="IELTS">IELTS</SelectItem>
            <SelectItem value="TOEFL">TOEFL</SelectItem>
            <SelectItem value="GRE">GRE</SelectItem>
            <SelectItem value="Portfolio">Portfolio</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(value: DocumentItem['status']) => setStatus(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Ready">Ready</SelectItem>
            <SelectItem value="Uploaded">Uploaded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Related Applications</Label>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {applications.map((app) => (
            <label key={app._id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedApplications.includes(app._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedApplications([...selectedApplications, app._id]);
                  } else {
                    setSelectedApplications(selectedApplications.filter(id => id !== app._id));
                  }
                }}
              />
              <span className="text-sm">{app.universityName} - {app.degree}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes about this document..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">Add Document</Button>
      </div>
    </form>
  );
}

// Edit Document Form Component
function EditDocumentForm({ 
  document, 
  onUpdate, 
  applications 
}: { 
  document: DocumentItem;
  onUpdate: (id: string, updates: Partial<DocumentItem>) => void;
  applications: any[];
}) {
  const [name, setName] = useState(document.name);
  const [type, setType] = useState(document.type);
  const [status, setStatus] = useState<DocumentItem['status']>(document.status);
  const [notes, setNotes] = useState(document.notes || "");
  const [selectedApplications, setSelectedApplications] = useState<string[]>(document.relatedApplications);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !type) return;

    onUpdate(document.id, {
      name,
      type,
      status,
      notes,
      relatedApplications: selectedApplications,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-name">Document Name *</Label>
        <Input
          id="edit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Statement of Purpose"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-type">Document Type *</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SOP">Statement of Purpose</SelectItem>
            <SelectItem value="CV">CV/Resume</SelectItem>
            <SelectItem value="Transcript">Transcripts</SelectItem>
            <SelectItem value="LOR">Letters of Recommendation</SelectItem>
            <SelectItem value="IELTS">IELTS</SelectItem>
            <SelectItem value="TOEFL">TOEFL</SelectItem>
            <SelectItem value="GRE">GRE</SelectItem>
            <SelectItem value="Portfolio">Portfolio</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-status">Status</Label>
        <Select value={status} onValueChange={(value: DocumentItem['status']) => setStatus(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Ready">Ready</SelectItem>
            <SelectItem value="Uploaded">Uploaded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Related Applications</Label>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {applications.map((app) => (
            <label key={app._id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedApplications.includes(app._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedApplications([...selectedApplications, app._id]);
                  } else {
                    setSelectedApplications(selectedApplications.filter(id => id !== app._id));
                  }
                }}
              />
              <span className="text-sm">{app.universityName} - {app.degree}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-notes">Notes</Label>
        <Textarea
          id="edit-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes about this document..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">Update Document</Button>
      </div>
    </form>
  );
}
