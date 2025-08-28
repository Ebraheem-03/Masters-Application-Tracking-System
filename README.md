# GradTrack - Masters Applications Tracker

A beautiful, minimalistic web application for tracking graduate school applications with a focus on user experience and organization.

## 🎯 Features

- **Application Management**: Track universities, programs, deadlines, and requirements
- **Multiple Views**: Kanban board, table view, and calendar for different workflows
- **Status Tracking**: Visual progress tracking from planning to acceptance
- **Dashboard**: KPI overview with upcoming deadlines and recent activity
- **Dark/Light Themes**: Persistent theme switching with beautiful design system
- **Responsive Design**: Mobile-first design optimized for all devices
- **Mock Data**: Includes sample applications to demonstrate functionality

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd grad-track-zen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   ```bash
   cp .env.example .env
   # Edit .env with your API endpoint if you have a backend
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand for simple state management
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion (ready for implementation)
- **Drag & Drop**: @dnd-kit (ready for Kanban board)

## 📱 Pages & Features

### Public Pages
- **Landing Page**: Marketing page with features and call-to-action
- **Authentication**: Sign in/up forms with validation

### Private Dashboard
- **Dashboard**: KPIs, upcoming deadlines, recent activity
- **Applications**: 
  - Board view (Kanban-style status tracking)
  - Table view (comprehensive data table)
  - Calendar view (deadline visualization)
- **Documents**: Document management (coming soon)
- **Calendar**: Global calendar view (coming soon)
- **Settings**: User preferences (coming soon)

## 🎨 Design System

The app features a sophisticated design system with:
- **Colors**: Professional blue/indigo primary with success/warning states
- **Typography**: Clean, readable font hierarchy
- **Spacing**: Generous whitespace for calm, focused experience  
- **Components**: Fully customized shadcn/ui components
- **Themes**: Seamless dark/light mode switching

## 📊 Mock Data

The app includes realistic sample data:
- 3 sample applications (Stanford, ETH Zurich, University of Toronto)
- Different status states (Planning, Applied, Eligible)
- Realistic deadlines, requirements, and program details
- Demonstrates all major features without requiring backend

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   └── ui/             # shadcn/ui components + custom variants
├── hooks/              # Custom React hooks
├── lib/                # Utilities and API client
├── pages/              # Page components
├── store/              # Zustand stores
├── types/              # TypeScript type definitions
└── main.tsx           # App entry point
```

## 🔗 API Integration

The app is designed to work with a REST API. Set `VITE_API_BASE_URL` in your environment variables to connect to your backend.

**API Endpoints Expected:**
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration  
- `GET /applications` - Fetch user's applications
- `POST /applications` - Create new application
- `PATCH /applications/:id` - Update application
- `DELETE /applications/:id` - Delete application

## 🌟 Future Enhancements

- [ ] Document upload and management
- [ ] Calendar integration with Google/Outlook
- [ ] Email reminders for deadlines
- [ ] Application analytics and insights
- [ ] Collaborative features (sharing with advisors)
- [ ] Export to PDF/CSV
- [ ] Mobile app (React Native/Capacitor)

## 📝 License

This project is built with [Lovable](https://lovable.dev) and is ready for customization and deployment.

---

**Note**: This is a frontend-only application with mock authentication. In production, implement proper backend authentication and data persistence.
