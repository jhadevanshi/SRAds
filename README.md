# SRAds Admin Panel

A comprehensive admin panel for managing digital advertising displays on vehicles. Built with Node.js, Express, PostgreSQL, and React.

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Frontend**: React + Vite
- **Authentication**: JWT
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Icons**: Lucide React

## Features

- **Authentication**: Secure JWT-based login system
- **Dashboard**: Real-time statistics and analytics
- **Advertiser Management**: CRUD operations for advertisers/clients
- **Device Management**: Track and manage advertising devices
- **Media Library**: Upload and manage ad media (images/videos)
- **Advertisement Management**: Create and manage ads
- **Campaign Management**: Create campaigns, assign ads and devices
- **Installer Management**: Manage device installers
- **Activity Logs**: Track all admin actions
- **Live Monitoring**: Device status and location tracking

## Database Schema

The application uses the following main tables:
- `users` - Admin users
- `advertisers` - Client/Advertiser information
- `devices` - Advertising display devices
- `media` - Uploaded media files
- `ads` - Advertisement details
- `campaigns` - Advertising campaigns
- `campaign_ads` - Campaign-Ad relationships
- `campaign_devices` - Campaign-Device relationships
- `installers` - Device installers
- `admin_logs` - Activity audit logs
- `device_location_history` - GPS location tracking
- `device_status_history` - Device status tracking
- `playback_logs` - Ad playback records

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
cd e:\SRAds
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following in `.env`:
```
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=srads_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d

UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

### 4. Database Setup

Create a PostgreSQL database named `srads_db`:

```sql
CREATE DATABASE srads_db;
```

Run the schema file to create all tables:

```bash
psql -U postgres -d srads_db -f database/schema.sql
```

Or run it from psql:
```sql
\i database/schema.sql
```

### 5. Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Start Backend

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

### Start Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## Default Credentials

After running the schema, a default admin user is created:

- **Email**: admin@srads.com
- **Password**: admin123

⚠️ **Important**: Change this password immediately after first login!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new admin
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Advertisers
- `GET /api/advertisers` - Get all advertisers
- `GET /api/advertisers/:id` - Get single advertiser
- `POST /api/advertisers` - Create advertiser
- `PUT /api/advertisers/:id` - Update advertiser
- `DELETE /api/advertisers/:id` - Delete advertiser

### Devices
- `GET /api/devices` - Get all devices
- `GET /api/devices/:id` - Get single device
- `POST /api/devices` - Create device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device
- `POST /api/devices/:id/status` - Update device status (heartbeat)

### Media
- `GET /api/media` - Get all media
- `GET /api/media/:id` - Get single media
- `POST /api/media` - Upload media (multipart/form-data)
- `DELETE /api/media/:id` - Delete media

### Ads
- `GET /api/ads` - Get all ads
- `GET /api/ads/:id` - Get single ad
- `POST /api/ads` - Create ad
- `PUT /api/ads/:id` - Update ad
- `DELETE /api/ads/:id` - Delete ad

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get single campaign with details
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `POST /api/campaigns/:id/ads` - Add ad to campaign
- `DELETE /api/campaigns/:id/ads/:ad_id` - Remove ad from campaign
- `POST /api/campaigns/:id/devices` - Add device to campaign
- `DELETE /api/campaigns/:id/devices/:device_id` - Remove device from campaign

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/ads-this-week` - Get ads uploaded this week
- `GET /api/dashboard/online-devices-trend` - Get online devices trend
- `GET /api/dashboard/campaign-performance` - Get campaign performance
- `GET /api/dashboard/device-uptime` - Get device uptime analytics
- `GET /api/dashboard/recent-activity` - Get recent activity

### Installers
- `GET /api/installers` - Get all installers
- `GET /api/installers/:id` - Get single installer
- `POST /api/installers` - Create installer
- `PUT /api/installers/:id` - Update installer
- `DELETE /api/installers/:id` - Delete installer

### Logs
- `GET /api/logs` - Get admin logs
- `GET /api/logs/playback` - Get playback logs
- `GET /api/logs/location/:device_id` - Get device location history
- `GET /api/logs/status/:device_id` - Get device status history

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/unread/count` - Get unread count
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## Project Structure

```
SRAds/
├── backend/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── errorHandler.js      # Error handling
│   │   └── upload.js            # File upload middleware
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── advertisers.js       # Advertiser routes
│   │   ├── devices.js           # Device routes
│   │   ├── media.js             # Media routes
│   │   ├── ads.js               # Ad routes
│   │   ├── campaigns.js         # Campaign routes
│   │   ├── dashboard.js         # Dashboard routes
│   │   ├── installers.js        # Installer routes
│   │   ├── logs.js              # Log routes
│   │   └── notifications.js     # Notification routes
│   ├── database/
│   │   └── schema.sql           # Database schema
│   ├── uploads/                 # Uploaded media files
│   ├── server.js                # Express server
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx       # Main layout
│   │   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   │   └── Header.jsx       # Header component
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── Dashboard.jsx    # Dashboard
│   │   │   ├── Advertisers.jsx  # Advertiser management
│   │   │   ├── Devices.jsx      # Device management
│   │   │   ├── Media.jsx        # Media library
│   │   │   ├── Ads.jsx          # Ad management
│   │   │   ├── Campaigns.jsx    # Campaign management
│   │   │   ├── Installers.jsx   # Installer management
│   │   │   └── Logs.jsx         # Activity logs
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Development Notes

### File Uploads
- Media files are stored in `backend/uploads/` directory
- Maximum file size: 10MB (configurable via .env)
- Supported formats: Images (jpeg, jpg, png, gif), Videos (mp4, webm, mov)

### Authentication
- JWT tokens expire in 7 days (configurable)
- Tokens are stored in localStorage
- Protected routes require valid JWT token

### Database
- All timestamps use UTC
- Foreign key constraints are enforced
- Indexes are created for frequently queried columns

## Future Enhancements

- [ ] Forgot password functionality
- [ ] Two-factor authentication
- [ ] Real-time WebSocket updates
- [ ] Google Maps integration for device tracking
- [ ] Cloud storage (Cloudinary/S3) for media
- [ ] Advanced analytics and reporting
- [ ] Email notifications
- [ ] Role-based access control refinement
- [ ] Device remote control (restart, disable)
- [ ] Campaign scheduling automation

## Security Considerations

- Change default JWT secret in production
- Use environment variables for sensitive data
- Implement rate limiting for API endpoints
- Add CSRF protection
- Enable HTTPS in production
- Regular database backups
- Input validation on all endpoints

## License

ISC

## Support

For issues and questions, please contact the development team.
