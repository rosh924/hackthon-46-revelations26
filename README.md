# Campus Food Delivery Platform

A comprehensive food ordering and tracking solution designed for university campuses. This project connects students with campus vendors, providing real-time order tracking and ML-powered pickup time predictions to minimize wait times.

## Key Features

### For Students
- **Smart Ordering**: Browse vendor menus, customize items, and place orders seamlessly.
- **Real-Time Tracking**: Track order status from preparation to ready-for-pickup updates via WebSocket.
- **ML Predictions**: Get accurate pickup time estimates powered by our Machine Learning service.
- **Order History**: View past orders and reorder favorites easily.
- **Profile Management**: Manage account details and preferences.

### For Vendors
- **Dashboard**: Centralized hub to manage incoming orders and menu items.
- **Order Management**: Accept, process, and complete orders with status updates.
- **Menu Control**: Add, edit, or remove menu items and manage availability.
- **Analytics**: Visualize sales data, peak hours, and popular items using Chart.js.

### AI/ML Integration
- **Predictive Engine**: Our dedicated ML service (FastAPI + XGBoost) analyzes vendor load, order complexity, and time-of-day variables to predict accurate food preparation times.

## Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS 4, Headless UI
- **Routing**: React Router DOM
- **Charts**: Chart.js, React-Chartjs-2
- **Icons**: Lucide React, Heroicons
- **Utilities**: Date-fns, Axios

### Backend Services
- **ML Service**: Python (FastAPI)
- **Database**: Supabase (PostgreSQL)
- **ML Model**: XGBoost Regressor

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.9 or higher)
- A Supabase account

### 1. Frontend Setup (React Application)

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```
The application will be available at `http://localhost:5173`.

> **Note**: The frontend is configured to connect to a backend at `http://localhost:5000/api` by default. You can change this by creating a `.env` file in the root directory and setting `VITE_API_URL=your_backend_url`.

### 2. ML Service Setup (Python/FastAPI)

Navigate to the `ml-service` directory to set up the prediction engine.

```bash
cd ml-service

# Install Python dependencies
pip install -r requirements.txt

# Configure Environment Variables
# Create a .env file in ml-service/ and add your Supabase credentials:
# SUPABASE_URL=your_url
# SUPABASE_SERVICE_KEY=your_key

# Run the Service
python -m app.main
```
The ML API will be available at `http://localhost:8000`.

## Project Structure

```text
hackthon-46-revelations26/
├── src/                  # React Frontend Source
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page components (Student, Vendor, Auth)
│   ├── services/         # API services (Auth, Mock Data)
│   ├── hooks/            # Custom React hooks (Auth, WebSocket)
│   └── ...
├── ml-service/           # Python Machine Learning Service
│   ├── app/              # FastAPI application code
│   └── ...
└── ...
```

## Testing & Mock Mode

The application currently includes a **Mock Mode** for demonstration purposes if the backend is unreachable. You can log in with the following mock credentials:

- **Student**: `student@campus.edu` / `MockPass@123!`
- **Vendor**: `cafe@campus.edu` / `MockPass@123!`
- **Admin**: `admin@campus.edu` / `MockPass@123!`

## License

This project is created for **Hackathon 46 Revelations 26**.
