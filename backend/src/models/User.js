import bcrypt from 'bcryptjs';
import { getDB } from '../config/database.js';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'users';

// User schema validation (for reference)
const userSchema = {
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  avatar: {
    type: String,
    default: ''
  },
  passwordResetOTP: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
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

class User {
  constructor(userData) {
    this.name = userData.name;
    this.email = userData.email;
    this.password = userData.password;
    this.avatar = userData.avatar || '';
    this.passwordResetOTP = userData.passwordResetOTP || null;
    this.passwordResetExpires = userData.passwordResetExpires || null;
    this.createdAt = userData.createdAt || new Date();
    this.updatedAt = userData.updatedAt || new Date();
    
    // Handle ObjectId conversion
    if (userData._id) {
      this._id = userData._id;
    }
  }

  // Hash password before saving
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  // Method to compare password
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // Method to get user without password
  toJSON() {
    const user = { ...this };
    delete user.password;
    return user;
  }

  // Static method to create a new user
  static async create(userData) {
    const user = new User(userData);
    await user.hashPassword();
    
    const db = getDB();
    const result = await db.collection(COLLECTION_NAME).insertOne(user);
    
    user._id = result.insertedId;
    return user;
  }

  // Static method to find user by email
  static async findByEmail(email) {
    const db = getDB();
    const user = await db.collection(COLLECTION_NAME).findOne({ email: email.toLowerCase() });
    
    if (user) {
      return new User(user);
    }
    return null;
  }

  // Static method to find user by ID
  static async findById(id) {
    const db = getDB();
    const user = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
    
    if (user) {
      return new User(user);
    }
    return null;
  }

  // Static method to find user by ID without password
  static async findByIdWithoutPassword(id) {
    const db = getDB();
    const user = await db.collection(COLLECTION_NAME).findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );
    
    if (user) {
      return new User(user);
    }
    return null;
  }

  // Static method to find user by email with password (for login)
  static async findByEmailWithPassword(email) {
    const db = getDB();
    const user = await db.collection(COLLECTION_NAME).findOne({ email: email.toLowerCase() });
    
    if (user) {
      return new User(user);
    }
    return null;
  }

  // Static method to find user by ID with password
  static async findByIdWithPassword(id) {
    const db = getDB();
    const user = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
    
    if (user) {
      return new User(user);
    }
    return null;
  }

  // Static method to update password
  static async updatePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const db = getDB();
    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      }
    );
  }

  // Static method to generate password reset OTP
  static async generatePasswordResetOTP(id) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const db = getDB();
    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          passwordResetOTP: otp,
          passwordResetExpires: expiresAt,
          updatedAt: new Date()
        }
      }
    );

    return otp;
  }

  // Static method to verify password reset OTP
  static async verifyPasswordResetOTP(id, otp) {
    const db = getDB();
    const user = await db.collection(COLLECTION_NAME).findOne({
      _id: new ObjectId(id),
      passwordResetOTP: otp,
      passwordResetExpires: { $gt: new Date() }
    });

    return !!user;
  }

  // Static method to clear password reset OTP
  static async clearPasswordResetOTP(id) {
    const db = getDB();
    await db.collection(COLLECTION_NAME).updateOne(
      { _id: new ObjectId(id) },
      { 
        $unset: { 
          passwordResetOTP: 1,
          passwordResetExpires: 1
        },
        $set: {
          updatedAt: new Date()
        }
      }
    );
  }
}

export default User;
