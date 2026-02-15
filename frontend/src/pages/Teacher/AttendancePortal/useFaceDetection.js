// import { useEffect, useState } from "react";
// import * as faceapi from "face-api.js";

// export default function useFaceDetection(webcamRef, canvasRef) {
//   const [modelsLoaded, setModelsLoaded] = useState(false);
//   const [faceDetected, setFaceDetected] = useState(false);
//   const [message, setMessage] = useState("Loading face detection models...");

//   useEffect(() => {
//     const loadModels = async () => {
//       try {
//         const MODEL_URL = "/models_data";
//         await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
//         await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
//         await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
//         setModelsLoaded(true);
//         setMessage("✅ Models loaded. Please look at the camera.");
//       } catch (err) {
//         console.error(err);
//         setMessage("❌ Failed to load face detection models.");
//       }
//     };
//     loadModels();
//   }, []);

//   useEffect(() => {
//     if (!modelsLoaded) return;
//     const interval = setInterval(async () => {
//       if (!webcamRef.current) return;
//       const video = webcamRef.current.video;
//       if (!video || video.readyState !== 4) return;

//       const detections = await faceapi
//         .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
//         .withFaceLandmarks();

//       const canvas = canvasRef.current;
//       const displaySize = { width: video.videoWidth, height: video.videoHeight };
//       faceapi.matchDimensions(canvas, displaySize);
//       const ctx = canvas.getContext("2d");
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       if (detections.length === 0) {
//         setMessage("No face detected. Please come closer.");
//         setFaceDetected(false);
//       } else {
//         setMessage(`Detected ${detections.length} face(s)! You can capture your photo.`);
//         setFaceDetected(true);

//         const resized = faceapi.resizeResults(detections, displaySize);
//         resized.forEach(det => {
//           const { x, y, width, height } = det.detection.box;
//           ctx.strokeStyle = "#00ffea";
//           ctx.lineWidth = 3;
//           ctx.shadowColor = "#00ffea";
//           ctx.shadowBlur = 15;
//           ctx.strokeRect(x, y, width, height);

//           ctx.fillStyle = "#00ffea";
//           ctx.font = "16px Inter";
//           ctx.shadowColor = "#00ffea";
//           ctx.shadowBlur = 10;
//           ctx.fillText((det.detection.score * 100).toFixed(2) + "%", x + 5, y - 10);
//         });
//       }
//     }, 500);

//     return () => clearInterval(interval);
//   }, [modelsLoaded, webcamRef, canvasRef]);

//   return { faceDetected, message, modelsLoaded };
// }

// modified 

import { useEffect, useState } from "react";
import * as faceapi from "face-api.js";

export default function useFaceDetection(videoRef, canvasRef) {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [message, setMessage] = useState("Loading face detection models...");

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models_data"; // ← adjust path to your public/models folder
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setMessage("Models loaded. Look at the camera.");
      } catch (err) {
        console.error("Model loading failed:", err);
        setMessage("Failed to load face detection models.");
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    if (!modelsLoaded) return;

    const interval = setInterval(async () => {
      if (!videoRef.current) return;
      const video = videoRef.current;
      if (video.readyState !== 4) return;

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detections.length === 0) {
        setMessage("No face detected. Please come closer or improve lighting.");
        setFaceCount(0);
      } else {
        setFaceCount(detections.length);
        setMessage(`Detected ${detections.length} face${detections.length === 1 ? "" : "s"} — ready to capture`);

        const resized = faceapi.resizeResults(detections, displaySize);
        resized.forEach((det) => {
          const { x, y, width, height } = det.detection.box;
          ctx.strokeStyle = "#00ffea";
          ctx.lineWidth = 3;
          ctx.shadowColor = "#00ffea";
          ctx.shadowBlur = 15;
          ctx.strokeRect(x, y, width, height);

          ctx.fillStyle = "#00ffea";
          ctx.font = "16px Arial";
          ctx.shadowBlur = 10;
          ctx.fillText((det.detection.score * 100).toFixed(1) + "%", x + 5, y - 5);
        });
      }
    }, 600);

    return () => clearInterval(interval);
  }, [modelsLoaded, videoRef, canvasRef]);

  return { modelsLoaded, faceCount, message };
}