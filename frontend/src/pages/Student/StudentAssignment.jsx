import React, { useState } from "react";

import ClassSelect from "./components/ClassSelect";
import AssignmentSelect from "./components/AssignmentSelect";
import FileUploader from "../../components/FileUploader";
import PendingTaskCard from "./components/PendingTaskCard";

const StudentAssignment = () => {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const classes = [
    { id: 1, name: "Advanced Computer Vision" },
    { id: 2, name: "Quantum Physics 101" },
    { id: 3, name: "Neural Networks & AI" },
  ];

  const allAssignments = [
    { id: 101, classId: 1, title: "Edge Detection", due: "Today, 11:59 PM" },
    { id: 102, classId: 1, title: "YOLO Report", due: "Next Week" },
    { id: 201, classId: 2, title: "Schrödinger Lab", due: "Oct 24" },
    { id: 301, classId: 3, title: "Backprop Essay", due: "Tomorrow" },
  ];

  const filteredAssignments = allAssignments.filter(
    (a) => a.classId === Number(selectedClassId)
  );

  const pendingTasks = [
    { id: 1, title: "Edge Detection", class: "Computer Vision", due: "Today", status: "Urgent" },
    { id: 2, title: "Backprop Essay", class: "Neural Net", due: "Tomorrow", status: "Pending" },
  ];

  return (
    <div className="w-full h-full pb-10 text-white font-sans animate-fade-in">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* LEFT — FORM */}
        <div className="xl:col-span-7 space-y-6">
          
          <div className="bg-[#150a2e] border border-white/10 rounded-2xl p-6 lg:p-8 shadow-2xl">
            
            <ClassSelect
              classes={classes}
              selectedClassId={selectedClassId}
              setSelectedClassId={setSelectedClassId}
            />

            <AssignmentSelect
              assignments={filteredAssignments}
              selectedClassId={selectedClassId}
            />

            <FileUploader
              uploadedFile={uploadedFile}
              setUploadedFile={setUploadedFile}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
            />

            <div className="mt-8 flex justify-end">
              <button
                disabled={!uploadedFile || !selectedClassId}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl font-bold disabled:opacity-40"
              >
                Submit
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT — PENDING TASKS */}
        <div className="xl:col-span-5 space-y-4">
          {pendingTasks.map((task) => (
            <PendingTaskCard
              key={task.id}
              task={task}
              onClick={() => setSelectedClassId("1")}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentAssignment;
