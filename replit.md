# Lafiyar Iyali - Maternal and Child Health Management System

## Overview

Lafiyar Iyali is a comprehensive maternal and child health management system built with Laravel 12 and React (Inertia.js). The application serves healthcare facilities (PHCs - Primary Health Centers) in managing patient records, tracking antenatal care (ANC), monitoring child nutrition, administering vaccines, and generating health reports. It features role-based access with separate interfaces for PHC staff and administrators.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: Laravel 12 with PHP 8.2+
- **Authentication**: Laravel Sanctum for API token authentication, Laravel Breeze for authentication scaffolding
- **Database ORM**: Eloquent ORM with database-agnostic migrations
- **Routing**: Ziggy for sharing Laravel routes with the JavaScript frontend

### Frontend Architecture
- **Framework**: React 18 with Inertia.js 2.0 for server-side routing without API complexity
- **Styling**: Tailwind CSS 3 with @tailwindcss/forms plugin
- **UI Components**: 
  - Headless UI for accessible components
  - Material UI (MUI) for additional UI elements
  - Lucide React and Heroicons for iconography
- **Data Visualization**: Chart.js with react-chartjs-2, Recharts for statistical dashboards
- **Animations**: Framer Motion for UI animations
- **Build Tool**: Vite 7 with hot module replacement configured for Replit

### Application Structure
- **Role-based Layouts**: 
  - `AdminLayout` - Administrative dashboard for system-wide management
  - `PhcStaffLayout` - PHC staff interface for patient care
  - `AuthenticatedLayout` - Standard authenticated user layout
  - `GuestLayout` - Public-facing pages
- **Key Modules**:
  - Patient management (registration, records, editing)
  - ANC (Antenatal Care) tracking with progress visualization
  - Nutrition monitoring and statistics
  - Vaccine accountability and reporting
  - Location/facility management (LGAs, Wards, PHCs)
  - Statistical dashboards with charts and KPIs

### Data Management
- Excel import/export capability via maatwebsite/excel
- Hierarchical location structure: LGA → Ward → PHC → Patients
- Monthly reporting system with filtering by location and time period

## External Dependencies

### PHP Dependencies (Composer)
- **Laravel Framework** 12.x - Core application framework
- **Laravel Sanctum** 4.x - API authentication
- **Laravel Tinker** - REPL for Laravel
- **Laravel UI** 4.6 - Additional UI utilities
- **Inertia.js Laravel** 2.0 - Server-side adapter for Inertia
- **Ziggy** 2.0 - Laravel route sharing with JavaScript
- **Maatwebsite Excel** 1.1 - Excel import/export functionality
- **Guzzle HTTP** - HTTP client for external API calls

### JavaScript Dependencies (npm)
- **@inertiajs/react** 2.0 - React adapter for Inertia.js
- **@mui/material** & **@mui/icons-material** 7.x - Material Design components
- **@emotion/react** & **@emotion/styled** - CSS-in-JS for MUI
- **chart.js** 4.5 & **react-chartjs-2** 5.3 - Chart visualizations
- **recharts** 3.3 - Additional charting library
- **framer-motion** 12.x - Animation library
- **lucide-react** & **@heroicons/react** - Icon libraries
- **axios** - HTTP client for AJAX requests

### Development Tools
- **Vite** 7.x with Laravel and React plugins
- **Tailwind CSS** with PostCSS and Autoprefixer
- **PHPUnit** 11.x for backend testing
- **Laravel Pint** for PHP code formatting
- **Laravel Sail** for Docker development environment