import { useEffect, useRef, useState } from "react";
import { storage, db } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";

type Props = {
  ticket: any;
  userEmail: string;
  onClose: () => void;
};

const VideoRecorder = ({ ticket, userEmail, onClose }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks: Blob[] = [];
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (e) => {
          chunks.push(e.data);
        };
        mediaRecorderRef.current.onstop = async () => {
          const blob = new Blob(chunks, { type: "video/mp4" });
          const filename = `videos/${ticket.Id}_${Date.now()}.mp4`;
          const storageRef = ref(storage, filename);
          await uploadBytes(storageRef, blob);
          const url = await getDownloadURL(storageRef);

          // Update Firestore
          const ticketRef = doc(db, "LLMRequestStatus", ticket.Id.toString());
          await updateDoc(ticketRef, {
            is_resolved: true,
            answeredByUser: userEmail,
            video: url,
          });

          onClose();
        };
      })
      .catch((err) => alert("Camera access denied."));
  }, []);

  const start = () => {
    chunks.length = 0;
    mediaRecorderRef.current?.start();
    setRecording(true);
  };

  const stop = () => {
    mediaRecorderRef.current?.stop();
    const tracks = (videoRef.current?.srcObject as MediaStream)?.getTracks();
    tracks?.forEach((t) => t.stop());
    setRecording(false);
  };

  return (
    <div>
      <video ref={videoRef} autoPlay className="w-100 mb-3" />
      {!recording ? (
        <button className="btn btn-success w-100" onClick={start}>
          🔴 Start Recording
        </button>
      ) : (
        <button className="btn btn-danger w-100" onClick={stop}>
          ⏹️ Stop & Upload
        </button>
      )}
    </div>
  );
};

export default VideoRecorder;
