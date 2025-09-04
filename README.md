# Masters Applications Tracker

A comprehensive web application for tracking graduate school applications, built with React, TypeScript, and Node.js. Manage your applications, track deadlines, organize documents, and stay on top of your graduate school journey.

## ✨ Features

### 🎯 Application Management
- **Add/Edit Applications**: Complete form with all required fields
- **Status Tracking**: Draft → In Progress → Submitted → Accepted/Rejected
- **Priority Levels**: High, Medium, Low priority management
- **Deadline Tracking**: Never miss an application deadline
- **Financial Planning**: Track tuition fees and living expenses

### 📊 Dashboard & Views
- **Kanban Board**: Visual status-based organization
- **Table View**: Detailed application information
- **Calendar View**: Deadline visualization and upcoming reminders
- **Advanced Filtering**: Filter by priority, status, country, semester
- **Smart Sorting**: Sort by deadline, fees, priority, or creation date

### 📁 Document Management
- **Document Tracking**: Monitor required documents for each application
- **Status Updates**: Track document progress (Draft → Ready → Uploaded)
- **Application Linking**: Associate documents with specific applications
- **Organized Views**: Browse by document type, status, or application

### 🔐 User Management
- **Secure Authentication**: JWT-based login/registration
- **Profile Management**: Update personal information and preferences
- **Password Security**: Secure password changes with bcrypt hashing
- **Account Settings**: Comprehensive user preferences and privacy controls

### 🎨 User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Real-time Updates**: Instant feedback and state management

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for beautiful, accessible components
- **Zustand** for state management
- **React Hook Form** with Zod validation
- **React Router** for navigation
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **MongoDB Atlas** for database
- **Mongoose** ODM for data modeling
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **Helmet** for security headers
- **CORS** and rate limiting

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- MongoDB Atlas account
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Masters-Application-Tracking-System
```

### 2. Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Frontend Setup
```bash
# In a new terminal, from the root directory
npm install
npm run dev
```

### 4. Environment Configuration

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/masters-applications
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🗄️ Database Schema

### Application Model
```typescript
interface Application {
  _id: string;
  userId: string;
  universityName: string;
  degree: string;
  priority: 'High' | 'Medium' | 'Low';
  numberOfSemesters: number;
  applicationPortal: string;
  city: string;
  country: string;
  location: string;
  startingSemester: string;
  tuitionFees: number;
  livingExpenses: number;
  documentsRequired?: string[];
  status: 'Draft' | 'In Progress' | 'Submitted' | 'Accepted' | 'Rejected';
  deadline: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### User Model
```typescript
interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout

### Applications
- `GET /api/applications` - Get all applications (with filtering/sorting)
- `POST /api/applications` - Create new application
- `GET /api/applications/:id` - Get specific application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

## 🎯 Usage Examples

### Adding a New Application
1. Navigate to Applications page
2. Click "Add Application" button
3. Fill in all required fields:
   - University name and degree
   - Priority level and status
   - Location and semester details
   - Financial information
   - Required documents
   - Application deadline
4. Click "Create Application"

### Managing Documents
1. Go to Documents page
2. Add new documents with type and status
3. Link documents to specific applications
4. Track progress from Draft → Ready → Uploaded

### Calendar View
1. Navigate to Calendar page
2. View all deadlines in calendar format
3. Click on dates to see applications due
4. Monitor upcoming and overdue deadlines

## 🛡️ Security Features

- **JWT Authentication** with 30-day expiration
- **Password Hashing** using bcrypt with salt rounds
- **Input Validation** for all API endpoints
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **Security Headers** via Helmet middleware
- **Protected Routes** requiring authentication

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full-featured experience with all views
- **Tablet**: Optimized layout for medium screens
- **Mobile**: Touch-friendly interface with mobile-first design

## 🎨 Theme System

- **Light Theme**: Clean, professional appearance
- **Dark Theme**: Easy on the eyes for extended use
- **System Theme**: Automatically follows OS preference
- **Persistent**: Theme choice saved across sessions

## 🚀 Development

### Running in Development
```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
npm run dev
```

### Building for Production
```bash
# Frontend
npm run build

# Backend
cd backend
npm start
```

### Code Quality
```bash
npm run lint
npm run type-check
```

## 📁 Project Structure

```
├── src/                    # Frontend source code
│   ├── components/        # Reusable UI components
│   ├── pages/            # Application pages
│   ├── store/            # State management
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and API client
│   └── types/            # TypeScript type definitions
├── backend/               # Backend API server
│   ├── src/
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   └── config/       # Configuration files
│   └── package.json
├── package.json           # Frontend dependencies
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for beautiful, accessible components
- **Tailwind CSS** for utility-first CSS framework
- **MongoDB Atlas** for cloud database hosting
- **React community** for excellent documentation and tools

## 📞 Support

For support and questions:
- Open an issue in the repository
- Check the documentation in the `/backend/README.md` for API details
- Review the code examples in this README

---

**Happy Application Tracking! 🎓✨**
