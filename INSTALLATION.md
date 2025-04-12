# Men's Business Collaboration App - Installation Guide

This guide provides instructions for downloading, installing, and running the Men's Business Collaboration mobile application locally on your development environment.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js (v16.0.0 or higher)
- npm (v7.0.0 or higher)
- Git

## Download the Application

### Option 1: Clone from GitHub

```bash
git clone https://github.com/your-username/men-business-app.git
cd men-business-app
```

### Option 2: Download ZIP Archive

1. Download the ZIP file from the provided link
2. Extract the contents to your desired location
3. Navigate to the extracted directory in your terminal

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd men-business-app/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following content:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/men-business-app
JWT_SECRET=your_jwt_secret_key
```

4. If you don't have MongoDB installed locally, you can use MongoDB Atlas:
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Get your connection string and replace the MONGODB_URI in the .env file

### Mobile Client Setup

1. Navigate to the mobile client directory:
```bash
cd ../mobile-client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the mobile-client directory with the following content:
```
API_URL=http://localhost:5000/api
```

## Running the Application

### Start the Backend Server

1. In the backend directory:
```bash
npm start
```

The server will start on port 5000 by default. You should see a message indicating that the server is running and connected to the database.

### Start the Mobile Client

1. In the mobile-client directory:
```bash
npm start
```

This will start the Expo development server. You'll see a QR code in your terminal.

### Running on Physical Device

1. Install the Expo Go app on your iOS or Android device
2. Scan the QR code with your device's camera (iOS) or the Expo Go app (Android)
3. The app will load on your device

### Running on Simulator/Emulator

1. For iOS (macOS only):
   - Install Xcode from the App Store
   - Start an iOS simulator by running:
   ```bash
   npx expo run:ios
   ```

2. For Android:
   - Install Android Studio
   - Set up an Android Virtual Device (AVD)
   - Start the emulator
   - Run:
   ```bash
   npx expo run:android
   ```

## Troubleshooting

### Common Issues

1. **Port conflicts**: If port 5000 is already in use, change the PORT value in the backend .env file

2. **MongoDB connection errors**: Ensure MongoDB is running if using a local installation, or check your Atlas connection string

3. **Dependency issues**: Try deleting the node_modules folder and package-lock.json file, then run npm install again

4. **Expo errors**: Make sure you have the latest version of Expo CLI installed:
   ```bash
   npm install -g expo-cli
   ```

### Getting Help

If you encounter any issues not covered in this guide, please:

1. Check the project documentation in the `/docs` directory
2. Submit an issue on the project's GitHub repository
3. Contact the development team at support@men-business-app.com

## Next Steps

After successfully running the application, you can:

1. Create an account and log in
2. Explore the mission posting and discovery features
3. Test the team collaboration functionality
4. Try out the financial tracking and networking features
5. Check out the gamification elements

## Building for Production

To create a standalone build for distribution:

### For Android:

```bash
cd mobile-client
npx expo build:android
```

### For iOS:

```bash
cd mobile-client
npx expo build:ios
```

Follow the prompts to complete the build process. The resulting files can be submitted to the App Store or Google Play, or distributed directly.
