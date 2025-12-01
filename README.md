# Face Recognition Mobile App 🔍

A cross-platform mobile application for real-time face recognition built with React Native and FastAPI, achieving 98.4% accuracy using state-of-the-art deep learning models.

## 🚀 Features

- **Real-time Face Recognition** - Instantly identify faces from camera or photo gallery
- **Face Enrollment** - Add new faces to the database with name association
- **Multi-Detector System** - Robust detection even with glasses, hats, and accessories
- **Cross-Platform** - Works on both iOS and Android
- **Database Management** - View and manage enrolled faces
- **High Accuracy** - 98.4% recognition accuracy using Facenet512 model

## 🛠️ Tech Stack

### Frontend

- **React Native** - Cross-platform mobile framework
- **TypeScript** - Type-safe development
- **Expo** - Development platform
- **Expo Camera** - Camera integration
- **Expo Image Picker** - Gallery access

### Backend

- **FastAPI** - High-performance Python web framework
- **DeepFace** - Face recognition library
- **TensorFlow** - Deep learning framework
- **Facenet512** - Face recognition model (98.4% accuracy)
- **MTCNN/SSD/OpenCV** - Multi-detector fallback system

## 📋 Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- npm or yarn
- Expo CLI
- Android/iOS device or emulator

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/face-recognizer.git
cd face-recognizer
```

### 2. Setup Frontend

```bash
# Install dependencies
npm install

# Start the Expo development server
npx expo start
```

### 3. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
python main.py
```

The backend will run on `http://localhost:8000`

## 📱 Running the App

### On Android/iOS Device

1. Install **Expo Go** from App Store or Google Play
2. Scan the QR code from `npx expo start`
3. Update `API_BASE_URL` in `app/index.tsx` to your computer's IP address

### On Emulator

```bash
# Android
npx expo run:android

# iOS (macOS only)
npx expo run:ios
```

## 🔐 Firewall Configuration (Linux)

If you encounter connection issues, configure your firewall:

```bash
# Allow Expo Metro bundler
sudo firewall-cmd --add-port=8081/tcp --permanent

# Allow FastAPI backend
sudo firewall-cmd --add-port=8000/tcp --permanent

# Reload firewall
sudo firewall-cmd --reload
```

## 🌐 API Endpoints

| Method | Endpoint     | Description                        |
| ------ | ------------ | ---------------------------------- |
| GET    | `/`          | API status                         |
| GET    | `/health`    | Health check                       |
| POST   | `/recognize` | Recognize face from uploaded image |
| POST   | `/add-face`  | Add new face to database           |
| GET    | `/database`  | List all enrolled faces            |

## 📂 Project Structure

```
face-recognizer/
├── app/                    # React Native frontend
│   ├── index.tsx          # Main app component
│   └── styles/            # Styling files
├── backend/               # FastAPI backend
│   ├── main.py           # API server
│   ├── models/           # Face database
│   └── uploads/          # Temporary uploads
├── package.json
└── README.md
```

## 🎯 How to Use

1. **Grant Camera Permission** - Allow camera access when prompted
2. **Capture Photo** - Tap the capture button or select from gallery
3. **Recognize Face** - Tap "Recognize" to identify the person
4. **Add to Database** - Tap "Add to DB" to enroll a new face
5. **View Results** - See recognition results with confidence scores

## 🧪 Testing

Test the backend API:

```bash
# Check API health
curl http://localhost:8000/health

# Or open in browser
http://localhost:8000/docs  # FastAPI interactive documentation
```

## 🐛 Troubleshooting

### Network Error

- Ensure phone and computer are on the same WiFi
- Update `API_BASE_URL` with correct IP address
- Check firewall settings

### Camera Permission Issues

```bash
# Grant camera permission (Android)
adb shell pm grant com.anonymous.facerecognizer android.permission.CAMERA
```

### Face Not Detected

- Ensure good lighting
- Remove heavy accessories if possible
- Try taking photo from different angles

## 📊 Model Performance

- **Facenet512**: 98.4% accuracy
- **MTCNN Detector**: Best for faces with accessories
- **SSD Detector**: Fast and reliable fallback
- **OpenCV Detector**: Very lenient for difficult cases

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

Your Name

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- [DeepFace](https://github.com/serengil/deepface) - Face recognition library
- [Expo](https://expo.dev) - React Native development platform
- [FastAPI](https://fastapi.tiangolo.com) - Modern Python web framework

---

**Note**: This app is for educational purposes. Ensure compliance with privacy laws when using face recognition technology.
