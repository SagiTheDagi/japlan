# Japan Planning Website

A web application for planning your Japan trip with a drag-and-drop calendar interface. Users can input their preferences and then build their itinerary by dragging activities and restaurants onto a calendar grid.

## Features

- **Preferences Form**: Input hobbies, food preferences, budget, trip duration, and travel style
- **Drag-and-Drop Calendar**: Visual calendar grid where you can drag activities and restaurants onto specific days and time slots
- **Activity & Restaurant Blocks**: Pre-populated with Japan-related activities and restaurants
- **Save & Load Plans**: Backend API to save and retrieve your trip plans
- **Responsive Design**: Modern UI built with Tailwind CSS

## Tech Stack

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- HTML5 Drag and Drop API

### Backend
- Go (Golang)
- Gin web framework
- GORM (Go ORM)
- SQLite database

## Setup Instructions

### Prerequisites
- Node.js (v20.19.0 or higher recommended)
- Go (v1.21 or higher)
- npm or yarn

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Go dependencies:
```bash
go mod download
```

3. Run the server:
```bash
go run cmd/server/main.go
```

The backend API will be available at `http://localhost:8080`

### Environment Variables (Optional)

Create a `.env` file in the frontend directory to customize the API URL:
```
VITE_API_URL=http://localhost:8080/api
```

## Project Structure

```
japlan/
├── frontend/
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── types/          # TypeScript type definitions
│   │   ├── data/           # Sample data
│   │   └── services/       # API service layer
│   └── package.json
├── backend/
│   ├── cmd/server/         # Main application entry point
│   ├── internal/
│   │   ├── handlers/       # HTTP request handlers
│   │   ├── models/         # Data models
│   │   ├── database/       # Database setup and queries
│   │   └── routes/         # API route definitions
│   └── go.mod
└── README.md
```

## Usage

1. Start by filling out the preferences form on the home page
2. Click "Start Planning Your Trip" to navigate to the sandbox
3. Drag activities and restaurants from the left sidebar onto the calendar grid
4. Drop items onto specific days and time slots
5. Click "Save Plan" to persist your itinerary to the database
6. Your plan will be automatically loaded when you return

## API Endpoints

- `POST /api/plans` - Create a new plan
- `GET /api/plans/:id` - Get a plan by ID
- `PUT /api/plans/:id` - Update an existing plan
- `DELETE /api/plans/:id` - Delete a plan
- `GET /api/plans/user/:userId` - Get all plans for a user

## Development Notes

- The database file (`japlan.db`) will be created automatically in the backend directory
- Plans are stored with user preferences and calendar days as JSON
- The frontend uses localStorage as a fallback for preferences if the backend is unavailable

## Future Enhancements

- User authentication
- Multiple plan management
- Plan sharing
- Export to PDF/calendar formats
- Integration with external APIs for real-time data
- Map view with location-based planning

