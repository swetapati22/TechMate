import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

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
  const [userEmail, setUserEmail] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [view, setView] = useState<"open" | "past">("open");

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [activeTicketId, setActiveTicketId] = useState<number | null>(null);

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

  const startRecording = async (ticketId: number) => {
    setActiveTicketId(ticketId);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setMediaStream(stream);

    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      setVideoBlob(blob);
      setVideoUrl(url);
    };

    recorder.start();
    setMediaRecorder(recorder);
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    mediaStream?.getTracks().forEach((track) => track.stop());
  };

  const uploadVideoAndUpdate = async () => {
    if (!videoBlob || !auth.currentUser || activeTicketId === null) return;

    const storage = getStorage();
    const videoRef = ref(storage, `videos/ticket_${activeTicketId}.mp4`);
    await uploadBytes(videoRef, videoBlob);
    const downloadURL = await getDownloadURL(videoRef);

    const ticketRef = doc(db, "LLMRequestStatus", activeTicketId.toString());

    await updateDoc(ticketRef, {
      is_resolved: true,
      answeredByuser: auth.currentUser.email,
      video: downloadURL,
    });

    alert("✅ Video uploaded and ticket updated!");

    // Reset states
    setVideoBlob(null);
    setVideoUrl(null);
    setActiveTicketId(null);
  };

  const markTicketAsResolved = async (ticketId: number) => {
    try {
      const q = query(
        collection(db, "LLMRequestStatus"),
        where("Id", "==", ticketId)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error("No matching document found for Id:", ticketId);
        return;
      }

      const userEmail = auth.currentUser?.email || "unknown";

      // Assuming Id is unique, take the first match
      const docRef = querySnapshot.docs[0].ref;

      await updateDoc(docRef, {
        is_resolved: true,
        answeredByuser: userEmail,
      });

      console.log("Ticket updated successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error updating ticket:", error);
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

                    <div className="mt-auto">
                      {!ticket.is_resolved ? (
                        <>
                          <button
                            className="btn btn-primary w-100 mb-2"
                            onClick={() => startRecording(ticket.Id)}
                          >
                            🎥 Start Recording
                          </button>

                          {activeTicketId === ticket.Id && (
                            <>
                              <button
                                className="btn btn-warning w-100 mb-2"
                                onClick={stopRecording}
                              >
                                ⏹️ Stop Recording
                              </button>

                              {videoUrl && (
                                <>
                                  <video width="100%" controls className="mb-2">
                                    <source src={videoUrl} type="video/mp4" />
                                  </video>
                                  <button
                                    className="btn btn-success w-100"
                                    onClick={() =>
                                      markTicketAsResolved(ticket.Id)
                                    }
                                  >
                                    ☁️ Upload Video
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </>
                      ) : (
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
                      )}
                    </div>
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
