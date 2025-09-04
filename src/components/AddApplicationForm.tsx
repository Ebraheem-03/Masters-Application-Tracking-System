import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApplicationsStore } from "@/store/applications";
import { useToast } from "@/hooks/use-toast";
import { X, Plus } from "lucide-react";

const applicationSchema = z.object({
  universityName: z.string().min(1, "University name is required"),
  degree: z.string().min(1, "Degree is required"),
  priority: z.enum(["High", "Medium", "Low"]),
  numberOfSemesters: z.number().min(1).max(20),
  applicationPortal: z.string()
    .min(1, "Application portal URL is required")
    .refine((url) => {
      try {
        // Allow URLs without protocol - add https if missing
        const urlToValidate = url.startsWith('http://') || url.startsWith('https://') 
          ? url 
          : `https://${url}`;
        new URL(urlToValidate);
        return true;
      } catch {
        return false;
      }
    }, "Please enter a valid URL (e.g., https://apply.university.edu or apply.university.edu)"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  location: z.string().min(1, "Location is required"),
  startingSemester: z.string().min(1, "Starting semester is required"),
  tuitionFees: z.number().min(0, "Tuition fees must be positive"),
  livingExpenses: z.number().min(0, "Living expenses must be positive"),
  deadline: z.string().min(1, "Deadline is required"),
  status: z.enum(["Draft", "In Progress", "Submitted", "Accepted", "Rejected"]),
  notes: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface AddApplicationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

export function AddApplicationForm({ onSuccess, onCancel, initialData, isEditing = false }: AddApplicationFormProps) {
  const [documentsRequired, setDocumentsRequired] = useState<string[]>(
    initialData?.documentsRequired || [""]
  );
  const { addApplication, updateApplication, isLoading } = useApplicationsStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: initialData ? {
      universityName: initialData.universityName,
      degree: initialData.degree,
      priority: initialData.priority,
      numberOfSemesters: initialData.numberOfSemesters,
      applicationPortal: initialData.applicationPortal,
      city: initialData.city,
      country: initialData.country,
      location: initialData.location,
      startingSemester: initialData.startingSemester,
      tuitionFees: initialData.tuitionFees,
      livingExpenses: initialData.livingExpenses,
      deadline: initialData.deadline?.split('T')[0], // Convert ISO to date input format
      status: initialData.status,
      notes: initialData.notes || '',
    } : {
      priority: "Medium",
      status: "Draft",
      numberOfSemesters: 2,
      tuitionFees: 0,
      livingExpenses: 0,
    },
  });

  const watchedStatus = watch("status");

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      // Filter out empty document names
      const filteredDocuments = documentsRequired.filter(doc => doc.trim() !== "");
      
      // Convert date to ISO string format
      const deadlineISO = new Date(data.deadline).toISOString();
      
      // Normalize URL - add https if missing
      const normalizedUrl = data.applicationPortal.startsWith('http://') || data.applicationPortal.startsWith('https://') 
        ? data.applicationPortal 
        : `https://${data.applicationPortal}`;
      
      const applicationData = {
        universityName: data.universityName,
        degree: data.degree,
        priority: data.priority,
        numberOfSemesters: data.numberOfSemesters,
        applicationPortal: normalizedUrl,
        city: data.city,
        country: data.country,
        location: data.location,
        startingSemester: data.startingSemester,
        tuitionFees: data.tuitionFees,
        livingExpenses: data.livingExpenses,
        deadline: deadlineISO,
        status: data.status,
        notes: data.notes,
        documentsRequired: filteredDocuments.length > 0 ? filteredDocuments : undefined,
      };

      if (isEditing && initialData?._id) {
        await updateApplication(initialData._id, applicationData);
        toast({
          title: "Success",
          description: "Application updated successfully!",
        });
      } else {
        await addApplication(applicationData);
        toast({
          title: "Success",
          description: "Application created successfully!",
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'create'} application`,
        variant: "destructive",
      });
    }
  };

  const addDocumentField = () => {
    setDocumentsRequired([...documentsRequired, ""]);
  };

  const removeDocumentField = (index: number) => {
    if (documentsRequired.length > 1) {
      setDocumentsRequired(documentsRequired.filter((_, i) => i !== index));
    }
  };

  const updateDocument = (index: number, value: string) => {
    const newDocuments = [...documentsRequired];
    newDocuments[index] = value;
    setDocumentsRequired(newDocuments);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Application' : 'Add New Application'}</CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update the details for your graduate program application'
            : 'Fill in the details for your new graduate program application'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="universityName">University Name *</Label>
              <Input
                id="universityName"
                {...register("universityName")}
                placeholder="e.g., Stanford University"
              />
              {errors.universityName && (
                <p className="text-sm text-destructive">{errors.universityName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="degree">Degree *</Label>
              <Input
                id="degree"
                {...register("degree")}
                placeholder="e.g., Master of Science in Computer Science"
              />
              {errors.degree && (
                <p className="text-sm text-destructive">{errors.degree.message}</p>
              )}
            </div>
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select 
                defaultValue={initialData?.priority || "Medium"}
                onValueChange={(value) => setValue("priority", value as "High" | "Medium" | "Low")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select 
                defaultValue={initialData?.status || "Draft"}
                onValueChange={(value) => setValue("status", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfSemesters">Number of Semesters *</Label>
              <Input
                id="numberOfSemesters"
                type="number"
                {...register("numberOfSemesters", { valueAsNumber: true })}
                min="1"
                max="20"
              />
              {errors.numberOfSemesters && (
                <p className="text-sm text-destructive">{errors.numberOfSemesters.message}</p>
              )}
            </div>
          </div>

          {/* Application Portal */}
          <div className="space-y-2">
            <Label htmlFor="applicationPortal">Application Portal URL *</Label>
            <div className="relative">
              <Input
                id="applicationPortal"
                {...register("applicationPortal")}
                placeholder="e.g., apply.university.edu or https://apply.university.edu"
                type="url"
                className={errors.applicationPortal 
                  ? "border-destructive focus:border-destructive focus:ring-destructive/20" 
                  : "focus:border-primary focus:ring-primary/20"
                }
              />
              {!errors.applicationPortal && watch("applicationPortal") && (
                <div className="absolute right-3 top-3 text-success">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {errors.applicationPortal && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.applicationPortal.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              You can enter a URL with or without https:// (we'll add it automatically if needed)
            </p>
          </div>

          {/* Location Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...register("city")}
                placeholder="e.g., Stanford"
              />
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                {...register("country")}
                placeholder="e.g., United States"
              />
              {errors.country && (
                <p className="text-sm text-destructive">{errors.country.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location Details *</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="e.g., Main Campus, Downtown"
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>
          </div>

          {/* Academic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startingSemester">Starting Semester *</Label>
              <Input
                id="startingSemester"
                {...register("startingSemester")}
                placeholder="e.g., Fall 2026"
              />
              {errors.startingSemester && (
                <p className="text-sm text-destructive">{errors.startingSemester.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Application Deadline *</Label>
              <div className="relative">
                <Input
                  id="deadline"
                  type="date"
                  {...register("deadline")}
                  className={errors.deadline 
                    ? "border-destructive focus:border-destructive focus:ring-destructive/20" 
                    : "focus:border-primary focus:ring-primary/20"
                  }
                />
                {watch("deadline") && (() => {
                  const deadlineDate = new Date(watch("deadline"));
                  const today = new Date();
                  const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  
                  if (daysUntil < 0) {
                    return (
                      <p className="text-xs text-destructive mt-1">
                        ⚠️ This deadline has passed
                      </p>
                    );
                  } else if (daysUntil <= 30) {
                    return (
                      <p className="text-xs text-warning mt-1">
                        ⏰ {daysUntil} days remaining
                      </p>
                    );
                  } else {
                    return (
                      <p className="text-xs text-muted-foreground mt-1">
                        📅 {daysUntil} days remaining
                      </p>
                    );
                  }
                })()}
              </div>
              {errors.deadline && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.deadline.message}
                </p>
              )}
            </div>
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tuitionFees">Tuition Fees (Annual) *</Label>
              <Input
                id="tuitionFees"
                type="number"
                {...register("tuitionFees", { valueAsNumber: true })}
                placeholder="0"
                min="0"
                step="0.01"
              />
              {errors.tuitionFees && (
                <p className="text-sm text-destructive">{errors.tuitionFees.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="livingExpenses">Living Expenses (Annual) *</Label>
              <Input
                id="livingExpenses"
                type="number"
                {...register("livingExpenses", { valueAsNumber: true })}
                placeholder="0"
                min="0"
                step="0.01"
              />
              {errors.livingExpenses && (
                <p className="text-sm text-destructive">{errors.livingExpenses.message}</p>
              )}
            </div>
          </div>

          {/* Documents Required */}
          <div className="space-y-3">
            <Label>Documents Required (Optional)</Label>
            {documentsRequired.map((doc, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={doc}
                  onChange={(e) => updateDocument(index, e.target.value)}
                  placeholder="e.g., Statement of Purpose, CV, Transcripts"
                />
                {documentsRequired.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeDocumentField(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addDocumentField}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Additional notes about this application..."
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Application"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
