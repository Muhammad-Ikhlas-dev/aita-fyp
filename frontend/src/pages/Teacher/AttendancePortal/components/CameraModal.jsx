import React, { useRef, useEffect, useState } from 'react';
import { useFaceRecognition } from '../../../../hooks/useFaceRecognition';
import AttendanceResults from './AttendanceResults';

function CameraModal({ setShowCamera, showCamera, classId, onAttendanceMarked }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const capturedImageRef = useRef(null);
    const streamRef = useRef(null);

    const [capturedImage, setCapturedImage] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [attendanceResults, setAttendanceResults] = useState(null);

    const { modelsLoaded, loading, error, detectAndMatchFaces, drawDetections } = useFaceRecognition(classId);

    // Start / stop camera
    useEffect(() => {
        if (!showCamera) return;

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" } // back camera – better for groups
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera access error:", err);
                alert("Cannot access camera. Please allow permission.");
                setShowCamera(false);
            }
        };

        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [showCamera]);

    // Capture photo and process with face recognition
    const handleCapture = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

        // Stop camera stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        // Set captured image and process with face recognition
        setCapturedImage(dataUrl);
        setProcessing(true);

        try {
            // Create image element from captured photo
            const img = new Image();
            img.src = dataUrl;

            await new Promise((resolve) => {
                img.onload = resolve;
            });

            // Detect and match faces
            const results = await detectAndMatchFaces(img);

            // Draw detection boxes on the image
            const resultCanvas = drawDetections(img, results.detected);

            // Update captured image with detection boxes
            const updatedDataUrl = resultCanvas.toDataURL('image/jpeg', 0.88);
            setCapturedImage(updatedDataUrl);

            setAttendanceResults(results);
        } catch (err) {
            console.error('Error processing image:', err);
            alert(`Error: ${err.message}`);
        } finally {
            setProcessing(false);
        }
    };

    const handleCloseResults = () => {
        setCapturedImage(null);
        setAttendanceResults(null);
        setShowCamera(false);
    };

    const handleMarkAttendance = async (recognizedStudents) => {
        try {
            console.log('Marking attendance for:', recognizedStudents);

            // API: POST /api/attendance/mark — save attendance log (students, timestamp, optional classId)
            const payload = {
                students: recognizedStudents,
                timestamp: new Date().toISOString()
            };
            if (classId) payload.classId = classId;

            const response = await fetch('http://localhost:5000/api/attendance/mark', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.success) {
                const studentList = recognizedStudents
                .map(s => `  • ${s.name.padEnd(15)} (${s.confidence}% match)`)
                .join("\n");
              
              alert(
                `✅ Attendance marked successfully!\n\n` +
                `${recognizedStudents.length} student(s) recognized:\n\n` +
                studentList
              );
                handleCloseResults();
                if (typeof onAttendanceMarked === 'function') onAttendanceMarked();
            } else {
                alert(`❌ Error marking attendance: ${result.message}`);
            }
        } catch (error) {
            console.error('Error marking attendance:', error);
            alert(`❌ Failed to mark attendance: ${error.message}`);
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setAttendanceResults(null);

        // Restart camera
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" }
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera access error:", err);
                alert("Cannot access camera.");
            }
        };
        startCamera();
    };

    return (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-zinc-950/90 border border-purple-500/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-purple-900/50 my-4">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-purple-900/30">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-purple-300">
                            {capturedImage ? 'Attendance Recognition' : 'Capture Group Photo'}
                        </h3>
                        {loading && (
                            <span className="text-sm text-yellow-400 flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                                Loading...
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setShowCamera(false)}
                        className="text-3xl text-zinc-400 hover:text-white leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="p-6">
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                            <p className="text-red-300">⚠️ {error}</p>
                            <p className="text-red-200 text-sm mt-2">Please upload student photos first using "Upload Photo" button</p>
                        </div>
                    </div>
                )}

                {/* Camera View or Captured Image */}
                {!error && (
                    <>
                        <div className="relative aspect-video bg-black">
                            {!capturedImage ? (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                    <canvas ref={canvasRef} className="hidden" />
                                </>
                            ) : (
                                <img
                                    ref={capturedImageRef}
                                    src={capturedImage}
                                    alt="Captured"
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </div>

                        <div className="p-6">
                            {!capturedImage ? (
                                <>
                                    <p className="text-lg font-medium text-center mb-4 text-purple-300">
                                        {modelsLoaded ? '📸 Ready to capture' : '⏳ Preparing...'}
                                    </p>
                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={handleCapture}
                                            disabled={!modelsLoaded}
                                            className={`px-10 py-3 rounded-full font-semibold text-white transition ${modelsLoaded
                                                ? 'bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-700/50'
                                                : 'bg-zinc-700 cursor-not-allowed'
                                                }`}
                                        >
                                            Capture
                                        </button>
                                        <button
                                            onClick={() => setShowCamera(false)}
                                            className="px-8 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-full transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {processing ? (
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                                            <p className="text-purple-300">Processing faces...</p>
                                        </div>
                                    ) : attendanceResults ? (
                                        <AttendanceResults
                                            results={attendanceResults}
                                            capturedImage={capturedImage}
                                            onClose={handleCloseResults}
                                            onSave={handleMarkAttendance}
                                        />
                                    ) : null}
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default CameraModal;
