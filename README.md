
### Frontend
- **React 19** with Vite
- **React Router** for navigation
- **Tailwind CSS** + **Bootstrap** for styling
- **React Bootstrap** for UI components
- **QR Scanner** for desk scanning functionality

### Backend
- **ASP.NET Core 9.0** Web API
- **Entity Framework Core** with PostgreSQL
- **ASP.NET Core Identity** for authentication
- **OpenAPI/Swagger** for API documentation
- **Docker** for containerization

## 🌐 Deployment Links

### Frontend
- **Production (Main)**: https://s3-fe-main.michalvalko.eu/
- **Integration**: https://s3-fe-int.michalvalko.eu/
- **Development**: https://s3-fe-dev.michalvalko.eu/

### Backend API
- **Production (Main)**: https://s3-be-main.michalvalko.eu/api
- **Integration**: https://s3-be-int.michalvalko.eu/api
- **Development**: https://s3-be-dev.michalvalko.eu/api

### API Documentation (Swagger)
- **Production (Main)**: https://s3-be-main.michalvalko.eu/swagger
- **Integration**: https://s3-be-int.michalvalko.eu/swagger
- **Development**: https://s3-be-dev.michalvalko.eu/swagger

## 🚀 Getting Started

### Prerequisites
- **.NET 9.0 SDK** (for backend development)
- **Node.js 18+** and **npm** (for frontend development)
- **Docker** and **Docker Compose** (for containerized deployment)
- **PostgreSQL** (or use Docker Compose)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd src/Backend
   ```

2. Configure connection string in `appsettings.Development.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=deskreservation;Username=postgres;Password=yourpassword"
     }
   }
   ```

3. Run database migrations:
   ```bash
   dotnet ef database update
   ```

4. Run the backend:
   ```bash
   dotnet run
   ```
   
   The API will be available at:
   - HTTP: `http://localhost:5290`
   - HTTPS: `https://localhost:7283`
   - Swagger: `http://localhost:5290/swagger`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd src/group1.sem3.frontend
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

### Docker Setup

1. From the project root, start all services:
   ```bash
   docker compose up -d
   ```

2. The services will be available at:
   - Backend: `http://localhost:5002`
   - Frontend: `http://localhost:3000` (if configured)
   - PostgreSQL: `localhost:5432`

3. To stop all services:
   ```bash
   docker compose down
   ```

