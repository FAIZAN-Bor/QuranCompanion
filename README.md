# 🕌 Quran Companion

A comprehensive Quran learning companion app with mobile frontend and backend API.

[![React Native](https://img.shields.io/badge/React%20Native-0.82.1-blue.svg)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📱 Features

- **Quran Reading & Recitation** - Complete Quran with audio playback
- **Tajweed Learning (Qaida)** - Step-by-step Arabic alphabet learning
- **Dua Collection** - Important Islamic supplications
- **Progress Analytics** - Track your learning journey
- **AI-Powered Feedback** - Get real-time Tajweed corrections
- **Mistake Review** - Learn from your recitation mistakes

## 📁 Project Structure

```
quranCompanion/
├── mobile/              # React Native mobile app
│   ├── src/
│   │   ├── auth/       # Authentication screens
│   │   ├── home/       # Main app screens
│   │   ├── DrawerScreen/ # Settings & analytics
│   │   ├── component/  # Reusable components
│   │   └── navigation/ # Navigation setup
│   ├── android/        # Android native code
│   ├── ios/            # iOS native code
│   └── package.json
│
├── backend/            # Node.js backend API
│   ├── src/
│   │   ├── routes/     # API routes
│   │   ├── controllers/# Business logic
│   │   ├── models/     # Database models
│   │   └── config/     # Configuration
│   └── package.json
│
└── package.json        # Monorepo root
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- React Native development environment ([Setup Guide](https://reactnative.dev/docs/environment-setup))
- Android Studio (for Android) or Xcode (for iOS)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd quranCompanion
   ```

2. **Install mobile dependencies**
   ```bash
   cd mobile
   npm install
   ```

3. **Install backend dependencies** (when ready)
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```

### Running the Mobile App

#### Android
```bash
cd mobile
npm start                # Start Metro bundler
npm run android          # Run on Android device/emulator
```

#### iOS
```bash
cd mobile
npm start                # Start Metro bundler
npm run ios              # Run on iOS simulator
```

### Running the Backend

```bash
cd backend
npm run dev              # Start development server
```

## 🛠️ Tech Stack

### Mobile
- **React Native** 0.82.1
- **React Navigation** - Navigation
- **Linear Gradient** - Modern UI gradients
- **Formik & Yup** - Form handling & validation
- **React Native Chart Kit** - Analytics charts

### Backend
- **Node.js** & **Express** - Server framework
- **MongoDB** - Database (optional)
- **JWT** - Authentication
- **dotenv** - Environment management

## 📱 Screenshots

*(Add your app screenshots here)*

## 🔧 Development

### Available Scripts

**From Mobile Directory:**
- `npm start` - Start Metro bundler
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm test` - Run tests

**From Backend Directory:**
- `npm run dev` - Start dev server
- `npm start` - Start production server

**From Root:**
- `npm run mobile` - Start mobile Metro bundler
- `npm run mobile:android` - Run mobile on Android
- `npm run backend` - Start backend server

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

Your Name - [GitHub Profile](https://github.com/yourusername)

## 🙏 Acknowledgments

- Quran data sources
- Islamic scholars for Tajweed rules
- React Native community
