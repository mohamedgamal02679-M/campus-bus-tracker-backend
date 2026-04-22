# Campus Bus Tracker Backend

REST API backend for the Campus Bus Tracker project.

## Overview
This backend powers the Campus Bus Tracker system for riders and admins.
It provides APIs for authentication, announcements, routes, stops, schedules, favorites, planning, and operation logs.

## Main Features
- User authentication and authorization using JWT
- Rider and admin role separation
- Announcement management
- Route and stop management
- Schedule and next departure handling
- Favorite stops support
- Route planning support
- Operation log support
- External API integration with Azure Maps and SendGrid

## Tech Stack
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- Express Validator
- Axios
- SendGrid
- Azure Maps

## Project Structure
src/
- config/
- middlewares/
- modules/
  - auth/
  - announcements/
  - routes/
  - stops/
  - schedules/
  - favorites/
  - planning/
  - operation-logs/
- integrations/
  - azureMaps/
  - sendGrid/
- utils/
- app.js
- server.js

Other files:
- HTTP-TESTS/
- README.md
- package.json
- .env.example
- .gitignore

## Getting Started

### Install dependencies
npm install

### Run in development mode
npm run dev

### Run in production mode
npm start

## Environment Variables
Create a `.env` file based on `.env.example`.

Main variables:
- PORT
- MONGO_URI
- JWT_SECRET
- JWT_EXPIRES_IN
- AZURE_MAPS_KEY
- SENDGRID_API_KEY
- SENDGRID_FROM_EMAIL

## API Health Check
- GET /
- GET /api/health

## Testing
Endpoint test files are available inside:
- HTTP-TESTS/

## Deployment Plan
- Backend: Microsoft Azure App Service
- Frontend: Vercel

## Notes
This repository contains the backend only.
The frontend will be maintained in a separate GitHub repository as required.

## Author
Campus Bus Tracker Project Team