import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { cameraStyles as styles } from './styles/cameraStyles';

const API_BASE_URL = 'http://10.200.158.245:8000';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<any>(null);

  // Add this to debug permission status
  React.useEffect(() => {
    console.log('Permission status:', permission);
  }, [permission]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', marginTop: 10 }}>
          Checking camera permission...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need camera permission to recognize faces
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.recognizeButton]}
          onPress={async () => {
            console.log('Requesting permission...');
            const result = await requestPermission();
            console.log('Permission result:', result);
          }}
        >
          <Text style={styles.buttonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef && !isProcessing) {
      setIsProcessing(true);
      try {
        const photo = await cameraRef.takePictureAsync({
          base64: true,
          quality: 0.8,
        });
        setCapturedPhoto(photo.uri);
        setRecognitionResult(null);
        console.log('Photo captured:', photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const retakePicture = () => {
    setCapturedPhoto(null);
    setRecognitionResult(null);
  };

  const addToDatabase = async () => {
    if (!capturedPhoto) {
      Alert.alert('No photo to add');
      return;
    }

    // Prompt user for name
    Alert.prompt(
      'Add to Database',
      "Enter the person's name:",
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Add',
          onPress: async (name?: string) => {
            if (!name || name.trim() === '') {
              Alert.alert('Error', 'Please enter a valid name');
              return;
            }

            console.log('Adding face to database:', name);
            setIsProcessing(true);

            try {
              const formData = new FormData();
              const filename = capturedPhoto.split('/').pop() || 'photo.jpg';

              console.log('📤 Adding to database:', name, filename);
              formData.append('file', {
                uri: capturedPhoto,
                type: 'image/jpeg',
                name: filename,
              } as any);

              console.log('📡 Sending to:', `${API_BASE_URL}/add-face`);
              const response = await fetch(
                `${API_BASE_URL}/add-face?name=${encodeURIComponent(
                  name.trim()
                )}`,
                {
                  method: 'POST',
                  body: formData,
                  headers: {
                    Accept: 'application/json',
                  },
                }
              );

              console.log('📥 Response status:', response.status);

              if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
              }

              const result = await response.json();
              console.log('✅ Add result:', result);

              if (result.status === 'success') {
                Alert.alert(
                  '✅ Success!',
                  `${name} has been added to the database!`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        setCapturedPhoto(null);
                        setRecognitionResult(null);
                      },
                    },
                  ]
                );
              } else if (result.status === 'no_face') {
                Alert.alert(
                  '⚠️ No Face Detected',
                  'Please take a clearer photo with a visible face'
                );
              } else {
                Alert.alert('❌ Error', result.message || 'Failed to add face');
              }
            } catch (error: any) {
              console.error('❌ Error adding face:', error);
              console.error('Error details:', JSON.stringify(error, null, 2));

              let errorMessage = 'Failed to connect to server';
              if (error.message.includes('Network request failed')) {
                errorMessage = `Cannot connect to backend at ${API_BASE_URL}\n\nMake sure:\n1. Backend is running\n2. Phone and PC are on same WiFi\n3. IP address is correct: 10.200.158.245`;
              } else {
                errorMessage = error.message || 'Failed to add face';
              }

              Alert.alert('❌ Network Error', errorMessage);
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const recognizeFace = async () => {
    if (!capturedPhoto) {
      Alert.alert('No photo to recognize');
      return;
    }

    console.log('🔍 Starting face recognition for:', capturedPhoto);
    console.log('📡 API URL:', `${API_BASE_URL}/recognize`);
    setIsProcessing(true);
    try {
      const formData = new FormData();
      const filename = capturedPhoto.split('/').pop() || 'photo.jpg';

      console.log('📤 Uploading file:', filename);
      formData.append('file', {
        uri: capturedPhoto,
        type: 'image/jpeg',
        name: filename,
      } as any);

      console.log('📡 Sending request to backend...');
      const response = await fetch(`${API_BASE_URL}/recognize`, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log('✅ Recognition result:', result);

      setRecognitionResult(result);
      if (result.status === 'match_found') {
        Alert.alert(
          '✅ Face Recognized!',
          `Person: ${result.name}\nConfidence: ${(
            result.confidence * 100
          ).toFixed(0)}%`
        );
      } else if (result.status === 'no_match_found') {
        Alert.alert('❓ Unknown Person', 'Face detected but not in database');
      } else if (result.status === 'no_face_detected') {
        Alert.alert(
          '⚠️ No Face Detected',
          'Could not detect a face. Try better lighting.'
        );
      } else if (result.status === 'empty_database') {
        Alert.alert(
          '📭 Empty Database',
          'No faces in database. Add some first!'
        );
      } else if (result.error) {
        Alert.alert('❌ Error', result.message || 'Recognition failed');
      }
    } catch (error: any) {
      console.error('❌ Error recognizing face:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));

      let errorMessage = 'Failed to connect to server';
      if (error.message.includes('Network request failed')) {
        errorMessage = `Cannot connect to backend at ${API_BASE_URL}\n\nMake sure:\n1. Backend is running\n2. Phone and PC are on same WiFi\n3. IP address is correct: 10.200.158.245`;
      } else {
        errorMessage = error.message || 'Recognition failed';
      }

      Alert.alert('❌ Network Error', errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };
  const testConnection = async () => {
    console.log('🔗 Testing backend connection...');
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
      });
      const result = await response.json();
      console.log('Backend response:', result);
      Alert.alert(
        ' Connected!',
        `Backend is running!\nStatus: ${result.status}`
      );
    } catch (error: any) {
      console.error(' Connection failed:', error);
      Alert.alert(
        ' Connection Failed',
        `Cannot reach backend at:\n${API_BASE_URL}\n\nError: ${error.message}`
      );
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    console.log(result);

    if (!result.canceled) {
      setCapturedPhoto(result.assets[0].uri); // ← Changed from setImage
      setRecognitionResult(null);
    }
  };

  // If photo is captured, show preview
  if (capturedPhoto) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Photo Preview</Text>
        <Image source={{ uri: capturedPhoto }} style={styles.preview} />

        {/* Show recognition result */}
        {recognitionResult && (
          <View
            style={{
              padding: 15,
              backgroundColor: '#f0f0f0',
              borderRadius: 10,
              margin: 10,
              width: '90%',
            }}
          >
            <Text
              style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}
            >
              {recognitionResult.status === 'match_found' &&
                `✅ ${recognitionResult.name}`}
              {recognitionResult.status === 'no_match' && '❓ Unknown Person'}
              {recognitionResult.status === 'no_face_detected' &&
                '⚠️ No Face Detected'}
              {recognitionResult.status === 'empty_database' &&
                '📭 Empty Database'}
            </Text>
            {recognitionResult.confidence && (
              <Text
                style={{
                  fontSize: 14,
                  color: '#666',
                  textAlign: 'center',
                  marginTop: 5,
                }}
              >
                Confidence: {(recognitionResult.confidence * 100).toFixed(0)}%
              </Text>
            )}
          </View>
        )}

        <View style={styles.previewButtons}>
          <TouchableOpacity
            style={[styles.button, styles.retakeButton]}
            onPress={retakePicture}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.addButton]}
            onPress={addToDatabase}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>Add to DB</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.recognizeButton]}
            onPress={recognizeFace}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>Recognize</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  // Camera view
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        ref={(ref) => setCameraRef(ref)}
        facing="front"
      >
        <View style={styles.cameraOverlay}>
          <View style={styles.faceFrame} />
        </View>
      </CameraView>

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Position your face in the frame
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {/* Camera Button */}
        <TouchableOpacity
          style={[
            styles.captureButton,
            isProcessing && styles.captureButtonDisabled,
          ]}
          onPress={takePicture}
          disabled={isProcessing}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        {/* Gallery Button */}
        <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
          <Text style={styles.galleryButtonText}>📁</Text>
        </TouchableOpacity>
      </View>

      {/* Backend Connection Button - Separate positioning */}
      <TouchableOpacity style={styles.backendButton} onPress={testConnection}>
        <Text style={styles.galleryButtonText}>🔗</Text>
      </TouchableOpacity>
    </View>
  );
}
