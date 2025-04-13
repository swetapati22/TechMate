import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

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
  answeredByuser:string;
};

const AskMyGrandkid = () => {
  const [userEmail, setUserEmail] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [view, setView] = useState<"open" | "past">("open");

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
                        <button
                          className="btn btn-primary w-100"
                          onClick={() => handleUpload(ticket.Id)}
                        >
                          📤 Upload Help Video
                        </button>
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
