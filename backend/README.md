# Business Operations Backend API

A comprehensive Node.js backend API for the Business Operations React application.

## 🚀 Features

- **Authentication & Authorization** - JWT-based user authentication
- **Business Management** - Complete business profile and settings
- **Customer Management** - Customer database with contact information
- **Product Management** - Product catalog with inventory tracking
- **Quote Management** - Professional quote generation and tracking
- **Invoice Management** - Invoice creation and payment tracking
- **Appointment Scheduling** - Calendar integration for appointments
- **Inventory Tracking** - Real-time stock level monitoring
- **Expense Tracking** - Business expense management
- **Reporting** - Comprehensive business analytics and reports

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Primary database
- **Sequelize** - ORM for database operations
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd business-operations/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=business_operations
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb business_operations
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE business_operations;
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

### Business
- `GET /api/business` - Get business details
- `PUT /api/business` - Update business details

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product

### Quotes
- `GET /api/quotes` - Get all quotes
- `GET /api/quotes/:id` - Get single quote
- `POST /api/quotes` - Create quote
- `PUT /api/quotes/:id` - Update quote
- `DELETE /api/quotes/:id` - Delete quote

### Invoices
- `GET /api/invoices` - Get all invoices (placeholder)

### Inventory
- `GET /api/inventory` - Get inventory items (placeholder)

### Appointments
- `GET /api/appointments` - Get appointments (placeholder)

### Reports
- `GET /api/reports` - Get business reports (placeholder)

## 🔒 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🗄️ Database Schema

The API uses the following main entities:
- **Users** - System users and authentication
- **Businesses** - Business profiles and settings
- **Customers** - Customer information
- **Products** - Product catalog
- **Quotes** - Quote documents
- **Invoices** - Invoice documents
- **Appointments** - Scheduled appointments
- **InventoryItems** - Stock tracking
- **Expenses** - Business expenses

## 🚦 Development

```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Check server health
curl http://localhost:5000/api/health
```

## 🔧 Configuration

Key environment variables:
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `DB_*` - Database connection settings
- `JWT_SECRET` - Secret key for JWT tokens
- `FRONTEND_URL` - Frontend application URL for CORS

## 📝 Notes

- The API is designed to work seamlessly with the React frontend
- All timestamps are in UTC
- UUIDs are used for all primary keys
- Soft deletes are implemented where appropriate
- Comprehensive error handling and validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

ISC License
