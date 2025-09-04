import { getDB } from '../config/database.js';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'applications';

// Application schema validation (for reference)
const applicationSchema = {
  userId: {
    type: String,
    required: [true, 'User ID is required']
  },
  universityName: {
    type: String,
    required: [true, 'University name is required'],
    trim: true,
    maxlength: [100, 'University name cannot be more than 100 characters']
  },
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    trim: true,
    maxlength: [50, 'Degree cannot be more than 50 characters']
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  numberOfSemesters: {
    type: Number,
    required: [true, 'Number of semesters is required'],
    min: [1, 'Number of semesters must be at least 1'],
    max: [20, 'Number of semesters cannot exceed 20']
  },
  applicationPortal: {
    type: String,
    required: [true, 'Application portal URL is required'],
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City cannot be more than 50 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    maxlength: [50, 'Country cannot be more than 50 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  startingSemester: {
    type: String,
    required: [true, 'Starting semester is required'],
    trim: true,
    maxlength: [20, 'Starting semester cannot be more than 20 characters']
  },
  tuitionFees: {
    type: Number,
    required: [true, 'Tuition fees are required'],
    min: [0, 'Tuition fees cannot be negative']
  },
  livingExpenses: {
    type: Number,
    required: [true, 'Living expenses are required'],
    min: [0, 'Living expenses cannot be negative']
  },
  documentsRequired: [{
    type: String,
    trim: true,
    maxlength: [100, 'Document name cannot be more than 100 characters']
  }],
  status: {
    type: String,
    enum: ['Draft', 'In Progress', 'Submitted', 'Accepted', 'Rejected'],
    default: 'Draft'
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
};

class Application {
  constructor(applicationData) {
    this.userId = applicationData.userId;
    this.universityName = applicationData.universityName;
    this.degree = applicationData.degree;
    this.priority = applicationData.priority || 'Medium';
    this.numberOfSemesters = applicationData.numberOfSemesters;
    this.applicationPortal = applicationData.applicationPortal;
    this.city = applicationData.city;
    this.country = applicationData.country;
    this.location = applicationData.location;
    this.startingSemester = applicationData.startingSemester;
    this.tuitionFees = applicationData.tuitionFees;
    this.livingExpenses = applicationData.livingExpenses;
    this.documentsRequired = applicationData.documentsRequired || [];
    this.status = applicationData.status || 'Draft';
    this.deadline = new Date(applicationData.deadline);
    this.notes = applicationData.notes || '';
    this.createdAt = applicationData.createdAt || new Date();
    this.updatedAt = applicationData.updatedAt || new Date();
    
    // Handle ObjectId conversion
    if (applicationData._id) {
      this._id = applicationData._id;
    }
  }

  // Update updatedAt timestamp
  updateTimestamp() {
    this.updatedAt = new Date();
  }

  // Static method to create a new application
  static async create(applicationData) {
    const application = new Application(applicationData);
    
    const db = getDB();
    const result = await db.collection(COLLECTION_NAME).insertOne(application);
    
    application._id = result.insertedId;
    return application;
  }

  // Static method to find applications by user ID with filters
  static async findByUserId(userId, filters = {}) {
    const db = getDB();
    
    // Build filter object
    const filter = { userId };
    
    if (filters.priority) filter.priority = filters.priority;
    if (filters.status) filter.status = filters.status;
    if (filters.country) filter.country = { $regex: filters.country, $options: 'i' };
    if (filters.startingSemester) filter.startingSemester = { $regex: filters.startingSemester, $options: 'i' };

    // Build sort object
    const sort = {};
    if (filters.sortBy) {
      sort[filters.sortBy] = filters.sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1; // Default sort by creation date descending
    }

    const applications = await db.collection(COLLECTION_NAME)
      .find(filter)
      .sort(sort)
      .toArray();
    
    return applications.map(app => new Application(app));
  }

  // Static method to find application by ID and user ID
  static async findByIdAndUserId(id, userId) {
    const db = getDB();
    const application = await db.collection(COLLECTION_NAME).findOne({
      _id: new ObjectId(id),
      userId: userId
    });
    
    if (application) {
      return new Application(application);
    }
    return null;
  }

  // Static method to update application
  static async findByIdAndUpdate(id, updates) {
    const db = getDB();
    
    // Add updatedAt timestamp
    updates.updatedAt = new Date();
    
    const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    
    if (result.value) {
      return new Application(result.value);
    }
    return null;
  }

  // Static method to delete application
  static async findByIdAndDelete(id) {
    const db = getDB();
    const result = await db.collection(COLLECTION_NAME).findOneAndDelete({ _id: new ObjectId(id) });
    
    if (result.value) {
      return new Application(result.value);
    }
    return null;
  }
}

export default Application;
