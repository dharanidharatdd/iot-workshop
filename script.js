import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuaADrmj7IJCKKCTFcTj1ULSRVTdqvbKc",
  authDomain: "facial-emotion-8aafa.firebaseapp.com",
  databaseURL: "https://facial-emotion-8aafa-default-rtdb.firebaseio.com",
  // authDomain: "facial-emotion-8aafa-default-rtdb.firebaseio.com",
  projectId: "facial-emotion-8aafa",
  storageBucket: "facial-emotion-8aafa.appspot.com",
  messagingSenderId: "475283841989",
  appId: "1:475283841989:web:1e3fbac0a3bdcfc861e1ac",
  measurementId: "G-NNN9EXQRFG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore();

// Rest of your code
const video = document.getElementById('video');

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  );
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    // Get detected emotions
    const emotions = resizedDetections.map(detection => detection.expressions);
        
    // Send emotions data to Firebase
    try {
      const docRef = await addDoc(collection(db, "emotions"), {
        timestamp: serverTimestamp(),
        emotions: emotions
      });
      console.log("Emotions data added with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }, 100);
});
