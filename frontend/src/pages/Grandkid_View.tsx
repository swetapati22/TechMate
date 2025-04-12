import { useState } from "react";
import "./Grandkid_View.css";

type Ticket = {
  id: number;
  elderName: string;
  issue: string;
  stepsTried: string[];
  status: "unresolved" | "resolved";
  videoUrl?: string;
};

const AskMyGrandkid = () => {
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 1,
      elderName: "Grandpa Joe",
      issue: "Can't connect to Wi-Fi",
      stepsTried: ["Opened settings", "Clicked on Wi-Fi", "Entered password"],
      status: "unresolved",
    },
    {
      id: 2,
      elderName: "Grandma Sue",
      issue: "Trouble installing WhatsApp",
      stepsTried: ["Opened Play Store", "Searched WhatsApp"],
      status: "unresolved",
    },
    
    {
      id: 3,
      elderName: "Grandma ",
      issue: "Trouble installing WhatsApp",
      stepsTried: ["Opened Play Store", "Searched WhatsApp"],
      status: "unresolved",
    },

  ]);

  const handleUpload = (id: number) => {
    const updated = tickets.map((ticket) =>
      ticket.id === id
        ? {
            ...ticket,
            status: "resolved",
            videoUrl:
              "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
          }
        : ticket
    );
    setTickets(updated);
  };

  return (
    <div className="ask-container">
      <h1 className="ask-header">🎥 Help Your Elders</h1>
      <p className="ask-subtext">
        Select a ticket below and upload a video tutorial to help your loved ones.
      </p>

      <div className="ticket-grid">
        {tickets.map((ticket) => (
          <div className="ticket-card" key={ticket.id}>
            <div>
              <h2>👵 Elder: {ticket.elderName}</h2>
              <p><strong>❗ Issue:</strong> {ticket.issue}</p>
              <div>
                <strong>🛠️ Steps Tried:</strong>
                <ul className="steps-list">
                  {ticket.stepsTried.map((step, index) => (
                    <li key={index}>👉 {step}</li>
                  ))}
                </ul>
              </div>
            </div>

            {ticket.status === "unresolved" ? (
              <button className="upload-button" onClick={() => handleUpload(ticket.id)}>
                📤 Upload Help Video
              </button>
            ) : (
              <>
                <p className="uploaded-msg">✅ Help video uploaded!</p>
                {ticket.videoUrl && (
                  <div className="video-preview">
                    <video width="100%" controls>
                      <source src={ticket.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AskMyGrandkid;
