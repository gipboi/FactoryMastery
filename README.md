# FactoryMastery

A comprehensive factory management system with separate frontend and backend components.

## Project Structure

The project consists of two main components:
- Frontend (`fm-frontend/`): React-based web application
- Backend (`fm-backend/`): Node.js server application

## Prerequisites

* Node.js version 20.14.0 or higher is required for both frontend and backend.

## Installation

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd fm-frontend
   ```
2. Install Yarn globally (if not already installed):
   ```bash
   npm install --global yarn
   ```
3. Install project dependencies:
   ```bash
   yarn
   ```
4. Start the frontend server:
   ```bash
   yarn start
   ```
   The frontend will be accessible at `http://localhost:3000`

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd fm-backend
   ```
2. Install Yarn globally (if not already installed):
   ```bash
   npm install --global yarn
   ```
3. Install project dependencies:
   ```bash
   yarn
   ```
4. Start the backend server:
   ```bash
   yarn start
   ```
   The backend will be accessible at `http://localhost:3001`

## Environment Variables

Both frontend and backend components use environment variables for configuration. These are defined in their respective `.env` files.

### Frontend Documentation
The frontend documentation can be found in the `fm-frontend` directory:
- Component Documentation: [Guidelines and Testing Account](fm-frontend/README.md)

### Backend Documentation
The backend documentation can be found in the `fm-backend` directory:
- Component Documentation: [Guidelines and Testing Account](fm-backend/README.md)
- Entity-Relationship Diagram (ERD): [ERD.puml](fm-backend/docs/ERD.puml)
- Class Diagram: [ClassDiagram.puml](fm-backend/docs/ClassDiagram.puml)
