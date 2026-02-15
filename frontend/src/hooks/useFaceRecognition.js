import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';

const BACKEND_URL = 'http://localhost:5000';
const MATCH_THRESHOLD = 0.6;

export function useFaceRecognition(classId = null) {
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [students, setStudents] = useState([]);
    const [faceMatcher, setFaceMatcher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load models on mount
    useEffect(() => {
        loadModels();
    }, []);

    // Load students after models are loaded (and when classId changes)
    useEffect(() => {
        if (modelsLoaded) {
            loadStudents();
        }
    }, [modelsLoaded, classId]);

    async function loadModels() {
        try {
            setLoading(true);
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri(`${BACKEND_URL}/models`),
                faceapi.nets.faceLandmark68Net.loadFromUri(`${BACKEND_URL}/models`),
                faceapi.nets.faceRecognitionNet.loadFromUri(`${BACKEND_URL}/models`)
            ]);
            setModelsLoaded(true);
            console.log('Face-API models loaded successfully');
        } catch (err) {
            console.error('Error loading models:', err);
            setError('Failed to load face recognition models');
            setLoading(false);
        }
    }

    async function loadStudents() {
        try {
            // Get list of students from backend
            const url = classId
                ? `${BACKEND_URL}/api/students?classId=${encodeURIComponent(classId)}`
                : `${BACKEND_URL}/api/students`;
            const response = await fetch(url);
            const data = await response.json();

            if (!data.success || data.students.length === 0) {
                setError('No labeled student images found. Please upload student photos first.');
                setLoading(false);
                return;
            }

            console.log('Loading student data for:', data.students.map(s => s.name));
            setStudents(data.students.map(s => s.name));

            // Load face descriptors for each student (pass full student objects)
            const labeledDescriptors = await loadLabeledImages(data.students);

            if (labeledDescriptors.length === 0) {
                setError('Could not detect faces in any student images. Please upload clearer photos.');
                setLoading(false);
                return;
            }

            // Create face matcher
            const matcher = new faceapi.FaceMatcher(labeledDescriptors, MATCH_THRESHOLD);
            setFaceMatcher(matcher);
            setLoading(false);
            console.log('Face matcher ready with', labeledDescriptors.length, 'students');
        } catch (err) {
            console.error('Error loading students:', err);
            setError('Failed to load student data: ' + err.message);
            setLoading(false);
        }
    }

    async function loadLabeledImages(studentsData) {
        const labeledDescriptors = await Promise.all(
            studentsData.map(async (student) => {
                try {
                    const descriptions = [];

                    // Use the URL provided by the API
                    const imageUrl = `${BACKEND_URL}${student.url}`;
                    console.log(`Loading student ${student.name} from ${imageUrl}`);

                    const img = await faceapi.fetchImage(imageUrl);

                    // Detect face
                    const detections = await faceapi
                        .detectSingleFace(img)
                        .withFaceLandmarks()
                        .withFaceDescriptor();

                    if (!detections) {
                        console.warn(`Could not detect face in image for: ${student.name}`);
                        return new faceapi.LabeledFaceDescriptors(student.name, []);
                    }

                    descriptions.push(detections.descriptor);
                    console.log(`Successfully loaded face descriptor for ${student.name}`);
                    return new faceapi.LabeledFaceDescriptors(student.name, descriptions);
                } catch (err) {
                    console.error(`Error loading student ${student.name}:`, err);
                    return new faceapi.LabeledFaceDescriptors(student.name, []);
                }
            })
        );

        return labeledDescriptors.filter(desc => desc.descriptors.length > 0);
    }

    async function detectAndMatchFaces(imageElement) {
        if (!faceMatcher) {
            throw new Error('Face matcher not initialized');
        }

        try {
            // Detect all faces in the image
            const detections = await faceapi
                .detectAllFaces(imageElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
                .withFaceLandmarks()
                .withFaceDescriptors();

            if (detections.length === 0) {
                return {
                    detected: [],
                    recognized: [],
                    unknown: 0,
                    message: 'No faces detected in the image'
                };
            }

            // Match each detected face
            const results = detections.map((detection, index) => {
                const match = faceMatcher.findBestMatch(detection.descriptor);
                const confidence = Math.round((1 - match.distance) * 100);

                return {
                    index,
                    box: detection.detection.box,
                    label: match.label !== 'unknown' ? match.label : null,
                    confidence,
                    distance: match.distance,
                    isRecognized: match.label !== 'unknown'
                };
            });

            const recognized = results.filter(r => r.isRecognized);
            const unknown = results.filter(r => !r.isRecognized).length;

            return {
                detected: results,
                recognized: recognized.map(r => ({ name: r.label, confidence: r.confidence })),
                unknown,
                message: `Found ${recognized.length} known student(s) and ${unknown} unknown face(s)`
            };
        } catch (err) {
            console.error('Error detecting faces:', err);
            throw new Error('Failed to detect faces: ' + err.message);
        }
    }

    function drawDetections(imageElement, detections) {
        const canvas = faceapi.createCanvasFromMedia(imageElement);
        const displaySize = { width: imageElement.width, height: imageElement.height };
        faceapi.matchDimensions(canvas, displaySize);

        const resizedDetections = detections.map(d => ({
            ...d,
            detection: { box: d.box }
        }));

        resizedDetections.forEach(result => {
            const { box, label, confidence, isRecognized } = result;
            const color = isRecognized ? 'green' : 'red';
            const text = isRecognized ? `${label} (${confidence}%)` : 'Unknown';

            const drawBox = new faceapi.draw.DrawBox(box, {
                label: text,
                boxColor: color,
                lineWidth: 3
            });
            drawBox.draw(canvas);
        });

        return canvas;
    }

    return {
        modelsLoaded,
        loading,
        error,
        students,
        detectAndMatchFaces,
        drawDetections
    };
}
