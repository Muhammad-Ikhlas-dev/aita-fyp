import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CaptureButton from './components/CaptureButton';
import UploadButton from '../../../components/UploadButton';
import CameraModal from './components/CameraModal';
import NamePromptModal from './components/NamePromptModal';
import StudentList from './components/StudentList';
import DashboardHeader from './components/DashboardHeader';

function AttendanceContentArea({ classId, className, subject }) {
    // const MAX_IMAGES = 8;

    const [showCamera, setShowCamera] = useState(false);
    const [showNamePrompt, setShowNamePrompt] = useState(false);
    const [pendingFiles, setPendingFiles] = useState([]);
    const [uploadStatus, setUploadStatus] = useState('');

// ** stundentList state and fetch function bcz it was needed in dashboard header as prop and for updating student list without clicking on refresh
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(true);
    const [studentsFetchError, setStudentsFetchError] = useState(null);
    const fetchStudents = async () => {
        try {
            setStudentsLoading(true);
            const url = classId
                ? `http://localhost:5000/api/students?classId=${encodeURIComponent(classId)}`
                : 'http://localhost:5000/api/students';
            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setStudents(data.students);
            } else {
                setStudentsFetchError('Failed to load students');
            }
        } catch (err) {
            console.error('Error fetching students:', err);
            setStudentsFetchError('Error loading students');
        } finally {
            setStudentsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [classId]);

    // Upload handlers
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Store files and show name prompt
        setPendingFiles(files);
        setShowNamePrompt(true);
        e.target.value = '';
    };

    const handleNameSubmit = async (name) => {
        setShowNamePrompt(false);
        setUploadStatus('Uploading...');

        try {
            // Upload each file to backend
            for (const file of pendingFiles) {
                const formData = new FormData();
                formData.append('image', file);

                const uploadUrl = classId
                    ? `http://localhost:5000/api/upload?name=${encodeURIComponent(name)}&classId=${encodeURIComponent(classId)}`
                    : `http://localhost:5000/api/upload?name=${encodeURIComponent(name)}`;
                const response = await fetch(uploadUrl, {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.message || 'Upload failed');
                }
            }

            setUploadStatus(`Successfully uploaded ${pendingFiles.length} image(s) as "${name}"`);
            fetchStudents();
            setTimeout(() => setUploadStatus(''), 3000);
        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus(`Error: ${error.message}`);
            setTimeout(() => setUploadStatus(''), 5000);
        } finally {
            setPendingFiles([]);
        }
    };

    const handleNameCancel = () => {
        setShowNamePrompt(false);
        setPendingFiles([]);
    };

    return (
        <>
            <Header />
            {classId && (className || subject) && (
                <div className="mb-4 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-sm">
                    Marking attendance for: <span className="font-semibold">{[className, subject].filter(Boolean).join(' — ')}</span>
                </div>
            )}
            <DashboardHeader studentCount={students.length}/>
            {/* Upload Status */}
            {uploadStatus && (
                <div className="mb-6 flex justify-center">
                    <div className={`px-6 py-3 rounded-lg font-semibold ${uploadStatus.includes('Error') ? 'bg-red-500/20 text-red-300 border border-red-500/50' : 'bg-green-500/20 text-green-300 border border-green-500/50'}`}>
                        {uploadStatus}
                    </div>
                </div>
            )}

            {/* Student List Dashboard */}
            <div className="mb-12">
                <StudentList fetchStudents={fetchStudents} students={students} studentsLoading={studentsLoading} studentsFetchError={studentsFetchError}/>
            </div>

            {/* Action Buttons  */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
                <UploadButton onFileChange={handleFileChange}>
                    <span className="text-2xl">📤</span>
                    Upload Photo
                </UploadButton>

                <CaptureButton onclick={() => { setShowCamera(true) }}>
                    <span className="text-2xl">📸</span>
                    Capture Photo
                </CaptureButton>
            </div>

            {/* Name Prompt Modal */}
            <NamePromptModal
                isOpen={showNamePrompt}
                onSubmit={handleNameSubmit}
                onCancel={handleNameCancel}
            />

            {/* Camera Modal */}
            {showCamera && (
                <CameraModal
                  setShowCamera={setShowCamera}
                  showCamera={showCamera}
                  classId={classId}
                />
              )}
        </>
    );
}

export default AttendanceContentArea;