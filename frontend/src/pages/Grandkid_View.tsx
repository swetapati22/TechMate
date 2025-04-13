import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { storage } from "../firebase";  // import storage from your firebase config file
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

type Ticket = {
  AnsweredTimestamp?: string;
  Id: number;
  LLMRequestStatus: boolean;
  Satisfied: boolean;
  answer: string;
  appname: string;
  createdTimestamp: string;
  devicename: string;
  email: string;
  is_resolved: boolean;
  os: string;
  question: string;
  summary: string;
  userid: string;
  video: string;
  answeredByuser: string;
};



const AskMyGrandkid = () => {

  const uploadVideoToFirebase = async (ticketId: number, videoBlob: Blob) => {
    if (!videoBlob) {
      console.error("No video to upload.");
      return;
    }
  
    // Create a reference for the video file in Firebase Storage
    const videoRef = ref(storage, `videos/ticket_${ticketId}.mp4`);
  
    // Upload the video file
    const uploadTask = uploadBytesResumable(videoRef, videoBlob);
  
    // Monitor upload progress
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Track progress (optional)
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.error("Error uploading video", error);
      },
      async () => {
        // Get the download URL of the uploaded video
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log("Video uploaded! Download URL:", downloadURL);
  
        // Update Firebase document with the video URL
        updateTicketResolvedStatus(ticketId, downloadURL);
      }
    );
  };

  
  
  const updateTicketResolvedStatus = async (ticketId: number, videoUrl: string) => {
    const ticketRef = doc(db, "LLMRequestStatus", `${ticketId}`); // Assuming ticketId is same as Firestore doc ID
  
    // Update the ticket's status in Firestore
    await updateDoc(ticketRef, {
      is_resolved: true,
      answeredByUser: auth.currentUser?.email,
      video: videoUrl,
    });
  
    // Optionally, set the ticket as resolved in the UI too
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.Id === ticketId
          ? { ...ticket, is_resolved: true, video: videoUrl }
          : ticket
      )
    );
  };
  
  const [userEmail, setUserEmail] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [view, setView] = useState<"open" | "past">("open");
  const [activeRecorderId, setActiveRecorderId] = useState<number | null>(null);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
const [isRecording, setIsRecording] = useState<boolean>(false);
const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndTickets = async () => {
      const user = auth.currentUser;
      if (user) {
        const email = user.email || "";
        setUserEmail(email);
        await fetchTickets(email, view);
      }
    };

    fetchUserAndTickets();
  }, [view]);

  const fetchTickets = async (email: string, viewType: "open" | "past") => {
    try {
      let q;

      if (viewType === "open") {
        q = query(
          collection(db, "LLMRequestStatus"),
          where("is_resolved", "==", false)
        );
      } else {
        q = query(
          collection(db, "LLMRequestStatus"),
          where("answeredByuser", "==", email)
        );
      }

      const snapshot = await getDocs(q);
      const results: Ticket[] = snapshot.docs.map((doc) => ({
        ...doc.data(),
        Id: doc.data().Id,
      })) as Ticket[];

      setTickets(results);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices) {
      console.error("Media Devices not supported.");
      return;
    }
  
    // Get user media (video + audio)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMediaStream(stream);
  
      // Initialize media recorder
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
  
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => chunks.push(event.data);
  
      // On stop, create video blob
      recorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: "video/mp4" });
        setVideoBlob(videoBlob);
        const videoUrl = URL.createObjectURL(videoBlob);
        setVideoUrl(videoUrl);  // This will be used to preview the video
      };
  
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting video recording", err);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaStream?.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  
  

  const handleUpload = (id: number) => {
    const updated = tickets.map((ticket) =>
      ticket.Id === id
        ? {
            ...ticket,
            is_resolved: true,
            video:
              "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
          }
        : ticket
    );
    setTickets(updated);
  };

  return (
    <div className="container-fluid">
      <div className="row vh-100">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2 bg-dark text-white p-3">
          <h4 className="mb-4">🧓 Grandkid Panel</h4>
          <ul className="nav flex-column">
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link text-start text-white ${
                  view === "open" ? "fw-bold text-info" : ""
                }`}
                onClick={() => setView("open")}
              >
                📬 Open Tickets
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link text-start text-white ${
                  view === "past" ? "fw-bold text-info" : ""
                }`}
                onClick={() => setView("past")}
              >
                🗂️ Past Tickets
              </button>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-lg-10 p-4">
          <h2>
            {view === "open" ? "🎥 Help Your Elders" : "📁 Your Past Uploads"}
          </h2>
          <p className="text-muted">
            {view === "open"
              ? "Select a ticket and upload a help video."
              : "View your previously resolved tickets."}
          </p>

          <div className="row">
            {tickets.map((ticket) => (
              <div className="col-12 col-md-6 mb-4" key={ticket.Id}>
                <div className="card shadow-sm h-100 d-flex flex-column">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{ticket.email}</h5>
                    <p className="card-text">
                      <strong>❓ Question:</strong> {ticket.question}
                    </p>
                    <p>
                      <strong>📱 Device:</strong> {ticket.devicename} (
                      {ticket.os})
                    </p>
                    <p>
                      <strong>📦 App:</strong> {ticket.appname}
                    </p>
                    <p>
                      <strong>📝 Summary:</strong>{" "}
                      <span className="text-muted">{ticket.summary}</span>
                    </p>

                    {ticket.is_resolved ? (
                      <>
                        <p className="text-success mt-3 mb-1">
                          ✅ Help video uploaded!
                        </p>
                        {ticket.video && (
                          <video width="100%" controls className="mt-2">
                            <source src={ticket.video} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-primary w-100"
                          onClick={() =>
                            setActiveRecorderId(
                              activeRecorderId === ticket.Id ? null : ticket.Id
                            )
                          }
                        >
                          📤 Upload Help Video
                        </button>

                        {/* Recording section */}
                        {activeRecorderId === ticket.Id && (
  <div className="mt-3">
    <h6>🎥 Recording Interface</h6>
    <div className="d-flex flex-column">
      {!isRecording ? (
        <button className="btn btn-danger" onClick={startRecording}>
          Start Recording
        </button>
      ) : (
        <button className="btn btn-secondary" onClick={stopRecording}>
          Stop Recording
        </button>
      )}
    </div>

    {videoUrl && (
      <div className="mt-2">
        <video width="100%" controls>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    )}
  </div>
)}

                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskMyGrandkid;
