<div align="center">
  <h1>=� CAMPUS RECOVERY SYSTEM</h1>
  <p><strong>Streamlining lost item recovery for university communities</strong></p>

  <p>
    <a href="#-features">Features</a> "
    <a href="#-tech-stack">Tech Stack</a> "
    <a href="#-getting-started">Getting Started</a> "
    <a href="#-usage">Usage</a> "
    <a href="#-contributing">Contributing</a>
  </p>

  <br>
</div>

---

## <� Overview

Kyu is a modern web platform designed to revolutionize how universities handle lost and found items. Built for administrative staff, it digitizes the entire process from item registration to owner notification, eliminating manual paperwork and improving recovery rates.

## ( Features

### =
 **Smart Item Management**
- **Digital Registration**: Staff can quickly register found items with photos, descriptions, and location details
- **Lost Item Reporting**: Students and staff can report lost items directly through the platform
- **Advanced Search**: Powerful filtering by category, date, location, and image availability

### > **Automated Matching System**
- **Intelligent Matching**: AI-powered algorithm matches found items with lost reports based on descriptions and categories
- **Real-time Notifications**: Automatic alerts when potential matches are found
- **Status Tracking**: Comprehensive tracking from "posted" � "matched" � "claimed"

### =� **Admin Dashboard**
- **Analytics Overview**: Visual metrics showing recovery rates, processing times, and item categories
- **Operational Insights**: Charts and reports for university administrators
- **User Management**: Staff account management and access controls

### <� **Modern UI/UX**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Intuitive Interface**: Clean, staff-focused design optimized for efficiency
- **Dark/Light Themes**: Customizable appearance with modern styling

## =� Tech Stack

### Frontend
- **React 19** - Modern React with hooks and concurrent features
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase** - Backend-as-a-Service for data and authentication

### Backend & Database
- **Firebase Firestore** - NoSQL cloud database
- **Firebase Storage** - File upload and hosting
- **Firebase Hosting** - Production deployment

### Development Tools
- **ESLint** - Code linting and formatting
- **Vite** - Development server and build optimization
- **PostCSS** - CSS processing and optimization

## =� Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/kyu-lost-and-found.git
   cd kyu-lost-and-found
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Firestore and Storage
   - Copy your Firebase config to `src/firebase.js`

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Start exploring the platform!

### Build for Production
```bash
npm run build
npm run preview
```

## =� Usage

### For University Staff
1. **Post Found Items**: Use the "Post Found Item" form to register items with photos and details
2. **Search & Match**: Browse the "Help Retrieve" section to find potential matches
3. **Manage Claims**: Update item status as they're claimed and returned to owners
4. **View Analytics**: Access the Admin Panel for operational insights

### For Students & Faculty
1. **Report Lost Items**: Submit lost item reports with detailed descriptions
2. **Track Claims**: Monitor the status of your lost item reports
3. **Receive Notifications**: Get alerts when potential matches are found

## <� Project Structure

```
kyu-lost-and-found/

