# MiniCRM

MiniCRM is a simple Customer Relationship Management (CRM) system that allows users to manage campaigns, log communications, and ingest customer data. The application uses Google OAuth for authentication.

## Features

- **User Authentication:** Users can sign in using Google OAuth.
- **Campaign Management:** Create and view marketing campaigns.
- **Communication Logging:** Log communication statuses and send delivery receipts.
- **Customer Data Ingestion:** Ingest customer data for use in campaigns.
- **Protected Routes:** Secure routes that require authentication.

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- RabbitMQ

### Clone the Repository

```sh
git clone https://github.com/yourusername/minicrm.git
cd minicrm
```
### Backend Setup

#### 1. Navigate to the backend directory:
```
cd backend
```
#### 2. Install dependencies:
```
npm install
```

### Frontend Setup

#### 1. Navigate to the backend directory:
```
cd ../frontend
```
#### 2. Install dependencies:
```
npm install
```

#### 3. Create a .env file in the frontend directory with the following content:
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=http://localhost:5000
```
