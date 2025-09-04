# Masters Applications Tracker - Backend API

A Node.js/Express backend API for the Masters Applications Tracker web application, built with MongoDB Atlas, JWT authentication, and comprehensive CRUD operations.

## Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Applications Management**: Full CRUD operations for graduate school applications
- **Advanced Filtering & Sorting**: Filter by priority, status, country, semester; sort by deadline, fees, etc.
- **Security**: Helmet, CORS, rate limiting, input validation
- **Database**: MongoDB Atlas with Mongoose ODM
- **Error Handling**: Comprehensive error handling with proper HTTP status codes

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Authentication**: JWT + bcryptjs
- **Validation**: express-validator
- **Security**: Helmet, CORS, rate limiting

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn package manager

## Installation

1. **Clone the repository and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Copy `env.example` to `.env`
   - Update the following variables:
     ```env
     # Server Configuration
     PORT=5000
     NODE_ENV=development
     
     # MongoDB Configuration
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/masters-applications?retryWrites=true&w=majority
     
     # JWT Configuration
     JWT_SECRET=your-super-secret-jwt-key-here
     JWT_EXPIRES_IN=30d
     
     # CORS Configuration
     CORS_ORIGIN=http://localhost:5173
     
     # Rate Limiting
     RATE_LIMIT_WINDOW_MS=900000
     RATE_LIMIT_MAX_REQUESTS=100
     ```

4. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": ""
    },
    "token": "jwt_token_here"
  }
}
```

#### POST `/api/auth/login`
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": ""
    },
    "token": "jwt_token_here"
  }
}
```

#### GET `/api/auth/me`
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### POST `/api/auth/logout`
Logout user (client-side token removal).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### Applications Routes

All application routes require authentication via JWT token.

#### POST `/api/applications`
Create a new application.

**Request Body:**
```json
{
  "universityName": "Stanford University",
  "degree": "Master of Science in Computer Science",
  "priority": "High",
  "numberOfSemesters": 4,
  "applicationPortal": "https://apply.stanford.edu",
  "city": "Stanford",
  "country": "United States",
  "location": "Main Campus",
  "startingSemester": "Fall 2026",
  "tuitionFees": 58416,
  "livingExpenses": 25000,
  "documentsRequired": ["SOP", "CV", "Transcripts"],
  "status": "Draft",
  "deadline": "2026-01-15",
  "notes": "Top choice program"
}
```

#### GET `/api/applications`
Get all applications with filtering and sorting.

**Query Parameters:**
- `priority`: Filter by priority (High/Medium/Low)
- `status`: Filter by status (Draft/In Progress/Submitted/Accepted/Rejected)
- `country`: Filter by country (case-insensitive)
- `startingSemester`: Filter by starting semester (case-insensitive)
- `sortBy`: Sort field (deadline/priority/tuitionFees/livingExpenses/createdAt)
- `sortOrder`: Sort order (asc/desc)

**Example:**
```
GET /api/applications?priority=High&status=Submitted&sortBy=deadline&sortOrder=asc
```

#### GET `/api/applications/:id`
Get a specific application by ID.

#### PUT `/api/applications/:id`
Update an application.

**Request Body:** Same as POST, but all fields are optional.

#### DELETE `/api/applications/:id`
Delete an application.

## Database Models

### User Model
```javascript
{
  name: String (required, 2-50 chars),
  email: String (required, unique, valid email),
  password: String (required, min 6 chars, hashed),
  avatar: String (optional, URL),
  createdAt: Date,
  updatedAt: Date
}
```

### Application Model
```javascript
{
  userId: ObjectId (ref: User, required),
  universityName: String (required, max 100 chars),
  degree: String (required, max 50 chars),
  priority: String (enum: High/Medium/Low, default: Medium),
  numberOfSemesters: Number (required, 1-20),
  applicationPortal: String (required, valid URL),
  city: String (required, max 50 chars),
  country: String (required, max 50 chars),
  location: String (required, max 100 chars),
  startingSemester: String (required, max 20 chars),
  tuitionFees: Number (required, min 0),
  livingExpenses: Number (required, min 0),
  documentsRequired: [String] (optional),
  status: String (enum: Draft/In Progress/Submitted/Accepted/Rejected, default: Draft),
  deadline: Date (required),
  notes: String (optional, max 1000 chars),
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: 30-day expiration, secure token storage
- **Input Validation**: express-validator for all inputs
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable origin restrictions
- **Helmet**: Security headers and protection
- **SQL Injection Protection**: Mongoose ODM prevents injection

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

**HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `404`: Not Found
- `500`: Internal Server Error

## Development

### Project Structure
```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   └── errorHandler.js      # Error handling
│   ├── models/
│   │   ├── User.js              # User model
│   │   └── Application.js       # Application model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   └── applications.js      # Application routes
│   └── server.js                # Main server file
├── package.json
├── env.example
└── README.md
```

### Running Tests
```bash
npm test
```

### Code Quality
```bash
npm run lint
```

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
CORS_ORIGIN=your_frontend_domain
```

### PM2 Deployment
```bash
npm install -g pm2
pm2 start src/server.js --name "masters-app-api"
pm2 save
pm2 startup
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository.
