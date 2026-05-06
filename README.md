# Cloud Vault Backend

Enterprise-grade backend for the Cloud Vault platform, built with NestJS, Prisma, and PostgreSQL. This service handles file management, secure authentication, and integration with cloud storage providers like Google Drive.

## 🚀 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: JWT with Passport.js
- **Cloud Integration**: Google Drive API
- **Language**: TypeScript

## 📂 Project Structure

The project follows a modular and scalable directory structure:

```text
src/
├── common/             # Global decorators, filters, guards, interceptors
├── config/             # Environment configuration and validation
├── database/           # Prisma service and database-related modules
├── modules/            # Feature-based modules
│   ├── auth/           # Authentication logic
│   ├── users/          # User management
│   └── files/          # File management and cloud sync
├── shared/             # Shared services across modules
└── main.ts             # Application entry point
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL instance

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. Run the application:
   ```bash
   # development
   npm run start:dev

   # production mode
   npm run build
   npm run start:prod
   ```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based access.
- **Password Hashing**: Bcrypt for secure storage.
- **Validation**: Strict request validation using `class-validator`.
- **Environment Isolation**: Secure management of credentials via `.env`.

## 📄 License

This project is licensed under the MIT License.
