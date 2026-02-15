// import Webcam from "react-webcam";
// import { captureButtonClass, disabledButtonClass } from "./constants";

// export default function CameraCapture({ webcamRef, canvasRef, faceDetected, message, captureImage, photo, onSubmit }) {
//   return (
//     <div className="flex flex-col items-center gap-4 w-full">
//       <h1 className="text-3xl font-extrabold text-white text-center">Capture Your Photo</h1>
//       <p className="text-white text-sm text-center">{message}</p>

//       <div className="relative w-full max-w-[450px] h-[350px] rounded-xl border border-white/20 overflow-hidden">
//         <Webcam ref={webcamRef} audio={false} screenshotFormat="image/png" className="w-full h-full" />
//         <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
//       </div>

//       <button
//         onClick={captureImage}
//         disabled={!faceDetected}
//         className={`${captureButtonClass} ${!faceDetected ? disabledButtonClass : ""}`}
//       >
//         Capture
//       </button>

//       {photo && <img src={photo} className="w-32 h-32 rounded-lg border border-white/20" />}
//       <button onClick={() => navigate("/signup")} className="w-full py-3 rounded-xl bg-white/20 text-white">Back</button>
//       <button onClick={onSubmit} className="w-full py-3 rounded-xl bg-[#9B37FF] text-white"> 📸 </button>
//     </div>
//   );
// }
