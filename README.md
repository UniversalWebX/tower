# Tower Platform

A complete social platform built from scratch with Next.js, featuring posts, feeds, chats, user profiles, and comprehensive moderation tools.

## Features

### 🏗️ Core System
- **Simple JSON Storage**: Clean, file-based data storage system
- **User Authentication**: Secure login/signup with password hashing
- **Session Management**: Cookie-based sessions with 7-day expiration
- **Comprehensive Validation**: Input validation for all user data

### 📱 Social Features
- **Post Creation**: Create posts with title, content, media, tags, and age targeting
- **Smart Feed**: Ranking algorithm based on tags, age fit, freshness, and boosts
- **User Profiles**: Editable profiles with bio and interests
- **Chat System**: Direct messages and group chats with real-time messaging
- **Social Features**: Follow/unfollow users, view profiles, social interactions

### 🛡️ Moderation System
- **User Management**: Suspend users (1 hour to 30 days), delete accounts, shadow ban
- **Post Management**: Boost posts for visibility, delete inappropriate content
- **Admin Panel**: Complete moderator dashboard with user and post management
- **Data Wipe**: Emergency data clearing by SuperAdmin

### 📁 File System
- **Media Upload**: Support for images and videos (50MB limit)
- **File Validation**: Type and size validation for security
- **Public Serving**: Files served from `/public/uploads`

### 🎨 User Interface
- **Modern Design**: Clean, responsive interface with dark theme
- **Smooth Animations**: Framer Motion animations throughout
- **Mobile Friendly**: Responsive design for all screen sizes
- **Intuitive Navigation**: Simple, clear navigation structure

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to `http://localhost:3000`

## Default Moderator Accounts

The following usernames have moderator access:
- `darianbayan`
- `admin`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/login` - Get current user

### Posts & Feed
- `POST /api/posts` - Create new post
- `GET /api/posts` - Get posts (with optional author filter)
- `DELETE /api/posts` - Delete post
- `GET /api/feed` - Get personalized feed with ranking

### Chats & Messages
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create new chat
- `GET /api/messages` - Get chat messages
- `POST /api/messages` - Send message

### User Profiles
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/[username]` - Get user profile by username
- `POST /api/users/[username]` - User actions (follow, unfollow, DM)

### File Upload
- `POST /api/upload` - Upload file (image/video)

### Admin/Moderation
- `GET /api/admin/users-list` - List all users
- `GET /api/admin/posts-list` - List all posts
- `POST /api/admin/suspend-user` - Suspend user
- `POST /api/admin/delete-user` - Delete user account
- `POST /api/admin/shadow-ban` - Shadow ban/unban user
- `POST /api/admin/boost-post` - Boost/unboost post
- `POST /api/admin/wipe-all-data` - Clear all data (SuperAdmin only)

## Data Storage

The platform uses a simple JSON file storage system located at:
- `data/tower.json` - All user, post, chat, and session data

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- Input validation and sanitization
- File type and size validation
- Moderator access control
- Age-based content filtering

## Development

Built with:
- Next.js 15.1.6
- React 19.0.0
- Framer Motion for animations
- bcryptjs for password hashing
- Simple JSON file storage

## License

MIT License
