# README 

## Overview

This project is a web-based XRP Dashboard built with React (Next.js) for the frontend and Django for the backend. It allows users to manage XRP wallets, view account details, send XRP transactions, and perform other related tasks.

## Features

- User authentication with Clerk.
- Creation and deletion of test and real XRP wallets.
- Sending XRP transactions.
- Viewing account details and transaction history.
- Responsive and user-friendly interface.

## Prerequisites

- Node.js and npm
- Python
- Django
- Clerk account for authentication
- PostgreSQL (or other databases supported by Django)

## Installation

1. Clone the repository:
   ```sh
   git clone [repository URL]
   ```
2. Navigate to the frontend directory and install dependencies:
   ```sh
   cd frontend
   npm install
   ```
3. Navigate to the backend directory and set up a Python virtual environment:
   ```sh
   cd ../backend
   python -m venv venv
   source venv/bin/activate (Linux/Mac) or venv\Scripts\activate (Windows)
   pip install -r requirements.txt
   ```
4. Configure environment variables for both frontend and backend. Refer to the provided `.env` examples.

## Running the Project

## Frontend Environment Variables

Create a .env.local file in the frontend directory with the following variables:

- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: Your Clerk publishable key.
- NEXT_PUBLIC_CLERK_SIGN_IN_URL: URL for signing in (e.g., /sign-in).
- NEXT_PUBLIC_CLERK_SIGN_UP_URL: URL for signing up (e.g., /sign-up).
- NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: Redirect URL after signing in.
- NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: Redirect URL after signing up.

## Backend Environment Variables

Create a .env file in the backend directory with the following variables:

- DJANGO_SECRET_KEY: A secret key for your Django application.
- DEBUG: Set to True for development or False for production.
- DB_NAME: Your database name.
- DB_USER: Your database username.
- DB_PASSWORD: Your database password.
- DB_HOST: Your database host.
- DB_PORT: Your database port.
- JSON_RPC_URL_TESTNET: URL for the XRPL Testnet.
- JSON_RPC_URL_MAINNET: URL for the XRPL Mainnet.
- CLERK_SECRET_KEY: Your Clerk secret key.

### Starting the Frontend

In the `frontend` directory:

```sh
npm run dev

or

yarn dev
```

### Starting the Backend

In the `backend` directory:

```sh
python manage.py runserver
```

## Usage

1. Access the frontend via `http://localhost:3000`.
2. Sign in or sign up using Clerk authentication.
3. Once logged in, navigate through the dashboard to manage wallets and transactions.

## Backend Endpoints

- POST `/xrpapp/createtestwallet/`: Create a test wallet.
- GET `/xrpapp/listtestwallets/`: List test wallets for a user.
- POST `/xrpapp/deletetestwallet/`: Delete a specific test wallet.
- POST `/xrpapp/createwallet/`: Create a real wallet.
- GET `/xrpapp/listrealwallets/`: List real wallets for a user.
- POST `/xrpapp/deleterealwallet/`: Delete a specific real wallet.
- POST `/xrpapp/getaccountinfo/`: Get account information.
- POST `/xrpapp/sendxrptransaction/`: Send an XRP transaction.
