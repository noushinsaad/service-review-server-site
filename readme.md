# Service Portal API

## Overview
This is a backend service built using Node.js and Express.js, with MongoDB as the database. The service handles user authentication, service management, and review functionality. The API is secured with JSON Web Tokens (JWT) and supports CRUD operations for users, services, and reviews.

## Features
- User Authentication (JWT-based)
- User Management (Create, Read)
- Service Management (Create, Read, Update, Delete)
- Review Management (Create, Read, Update, Delete)
- Search Services
- Count Users, Services, and Reviews

## Technologies Used
- Node.js
- Express.js
- MongoDB
- JWT for authentication
- dotenv for environment variable management
- cors for Cross-Origin Resource Sharing
- cookie-parser for handling cookies

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB instance (local or cloud)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/noushinsaad/service-review-server-site.git

2. Install dependencies:
   ```bash
   npm install

### Configuration
1. Create a .env file in the root directory and add the following environment variables:
    ```env
    PORT=5000
    DB_USER=your_db_user
    DB_PASS=your_db_password
    ACCESS_TOKEN=your_jwt_secret
    NODE_ENV=development

### Running the Application
1. Start the server:
    ```bash
    nodemon index.js

2. The server will be running on http://localhost:5000.
