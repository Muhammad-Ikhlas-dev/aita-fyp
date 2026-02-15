// App.jsx (only change: add teacher lazy imports + routes)
import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import ShimmerLoader from "./components/ShimmerLoader";
import Navbar from "./components/Navbar";

// Lazy load pages (existing)
const Home = lazy(() => import("./pages/Home"));
const Signup = lazy(() => import("./pages/Signup"));
const Signin = lazy(() => import("./pages/Signin"));
const Pricing = lazy(() => import("./pages/Pricing"));

// Student pages (existing)
const StudentLayout = lazy(() => import("./pages/Student/StudentLayout"));
const StudentDashboard = lazy(() => import("./pages/Student/StudentDashboard"));
const StudentAssignment = lazy(() => import("./pages/Student/StudentAssignment"));
const StudentResult = lazy(() => import("./pages/Student/StudentResult"));
const StudentSetting = lazy(() => import("./pages/Student/StudentSetting"));

// Teacher pages (new)
const AttendancePortal = lazy(() => import("./pages/Teacher/AttendancePortal"));
const TeacherLayout = lazy(() => import("./pages/Teacher/TeacherLayout"));
const TeacherDashboard = lazy(() => import("./pages/Teacher/TeacherDashboard"));
const CreateClass = lazy(() => import("./pages/Teacher/CreateClass"));
const UploadAssignment = lazy(() => import("./pages/Teacher/UploadAssignment"));
const UploadQuiz = lazy(() => import("./pages/Teacher/UploadQuiz"));
const TeacherSetting = lazy(() => import("./pages/Teacher/TeacherSetting"));
const TeacherClasses = lazy(() => import("./pages/Teacher/TeacherClasses"));
const TeacherClassDetail = lazy(() => import("./pages/Teacher/TeacherClassDetail"));


function App() {
  const location = useLocation();
  // hide main Navbar for student/teacher dashboards
  const hideNavbar = location.pathname.startsWith("/student") || location.pathname.startsWith("/teacher");

  return (
    <Suspense fallback={<ShimmerLoader />}>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* Student Routes */}
        <Route path="/student" element={<StudentLayout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="assignment" element={<StudentAssignment />} />
          <Route path="result" element={<StudentResult />} />
          <Route path="settings" element={<StudentSetting />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route path="attendance" element={<AttendancePortal />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="create-class" element={<CreateClass />} />
          <Route path="assignments" element={<UploadAssignment />} />
          <Route path="quizzes" element={<UploadQuiz />} />
          <Route path="classes" element={<TeacherClasses />} />
          <Route path="classes/:classId" element={<TeacherClassDetail />} />
          <Route path="settings" element={<TeacherSetting />} />
          {/* add more pages as needed */}
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
