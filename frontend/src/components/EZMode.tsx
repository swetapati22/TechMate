import React, { useState, useRef, useEffect } from 'react';
import { useSpeechSynthesis } from 'react-speech-kit';
import { useNavigate } from 'react-router-dom';
import androidLogo from '../assets/android_logo.png';
import iosLogo from '../assets/IOS_logo.png';
import phoneImg from '../assets/phone.jpg';
import tabletImg from '../assets/tablet.jpg';
import laptopImg from '../assets/laptop.jpeg';
import { auth } from '../firebase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const EZMode: React.FC = () => {
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (auth.currentUser) {
      setUserEmail(auth.currentUser.email || '');
    }
  }, []);


  const [typedQuestion, setTypedQuestion] = useState('');
  const [voiceText, setVoiceText] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [osChoice, setOsChoice] = useState<string | null>(null);
  const [deviceType, setDeviceType] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const synth = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, loading]);

  const startListening = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setVoiceText(transcript);
    };

    recognition.onerror = (event: any) => {
      alert('Voice recognition error: ' + event.error);
    };

    recognition.start();
  };

  const handleSendMessage = async () => {
    const userInput = typedQuestion || voiceText;
    if (!userInput.trim()) {
      alert('Please type or speak your question.');
      return;
    }

    const updatedConversation = [
      ...conversation,
      { role: 'user', content: userInput },
    ];
    setConversation(updatedConversation);
    setTypedQuestion('');
    setVoiceText('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/generate-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: [
            "You are a kind and patient assistant helping elderly users. Please explain everything as clearly and thoroughly as possible, with step-by-step instructions, even for simple tasks.",
            `User's OS: ${osChoice}`,
            `User's device type: ${deviceType}`,
            ...updatedConversation.map((msg) =>
              `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
            ),
          ].join('\n'),
        }),
      });

      const data = await response.json();
      let assistantReply = data?.steps?.join('\n') || 'Sorry, I had trouble answering that.';
      assistantReply = assistantReply.replace(/^assistant[:\-]?\s*/i, '');

      const assistantMessage = { role: 'assistant', content: assistantReply };
      setConversation((prev) => [...prev, assistantMessage]);
      setLoading(false);
      const index = updatedConversation.length;
      playMessage(assistantReply, index);
    } catch (error) {
      console.error('LLM Error:', error);
      alert('Assistant failed to respond.');
      setLoading(false);
    }
  };

  const playMessage = (text: string, index: number) => {
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utter;

    utter.onend = () => {
      setSpeakingIndex(null);
      setIsPaused(false);
    };

    synth.speak(utter);
    setSpeakingIndex(index);
    setIsPaused(false);
  };

  const handlePause = () => {
    synth.pause();
    setIsPaused(true);
  };

  const handleResume = () => {
    synth.resume();
    setIsPaused(false);
  };

  const handleReplay = (text: string, index: number) => {
    playMessage(text, index);
  };

  const handleSatisfied = () => {
    const goodbye =
      "I'm glad I could help. Taking you back to the homepage now. I'll be here if you need anything again!";
    synth.cancel();
    synth.speak(new SpeechSynthesisUtterance(goodbye));
    setTimeout(() => navigate('/dashboard'), 5000);
  };

  const handleNotSatisfied = () => {
    const message =
      "Looks like I wasn't able to help this time. Let’s find a young helper! I’ll post your question in the Talk with GrandKid section for further help.";
    synth.cancel();
    synth.speak(new SpeechSynthesisUtterance(message));
    setTimeout(() => navigate('/ask-grandkid'), 7000);
  };

  const showFeedbackButtons =
    conversation.length > 0 && conversation[conversation.length - 1].role === 'assistant';

  return (
    <><div>
      <h2>Welcome, {userEmail}</h2>
    </div>
    <div className="container py-5">
        <h1 className="text-center mb-5 display-4">🎙️ EZMode – Ask a Question</h1>

        {!osChoice ? (
          <>
            <p className="text-center fs-2 fw-bold mb-4">Which operating system are you using?</p>
            <div className="d-flex justify-content-center gap-5">
              <button className="border-0 bg-transparent" onClick={() => setOsChoice('Android')}>
                <img src={androidLogo} alt="Android" style={{ width: '180px', height: '120px', objectFit: 'contain', borderRadius: '12px', border: '2px solid #ccc' }} />
                <div className="text-center mt-2 fs-5 fw-semibold">Android</div>
              </button>
              <button className="border-0 bg-transparent" onClick={() => setOsChoice('iOS')}>
                <img src={iosLogo} alt="iOS" style={{ width: '180px', height: '120px', objectFit: 'contain', borderRadius: '12px', border: '2px solid #ccc' }} />
                <div className="text-center mt-2 fs-5 fw-semibold">iOS</div>
              </button>
            </div>
          </>
        ) : !deviceType ? (
          <>
            <p className="text-center fs-2 fw-bold mb-4">What kind of device are you using?</p>
            <div className="d-flex justify-content-center gap-5">
              <button className="border-0 bg-transparent" onClick={() => setDeviceType('Phone')}>
                <img src={phoneImg} alt="Phone" style={{ width: '180px', height: '120px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #ccc' }} />
                <div className="text-center mt-2 fs-5 fw-semibold">Phone</div>
              </button>
              <button className="border-0 bg-transparent" onClick={() => setDeviceType('Tablet')}>
                <img src={tabletImg} alt="Tablet" style={{ width: '180px', height: '120px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #ccc' }} />
                <div className="text-center mt-2 fs-5 fw-semibold">Tablet</div>
              </button>
              <button className="border-0 bg-transparent" onClick={() => setDeviceType('Computer')}>
                <img src={laptopImg} alt="Computer" style={{ width: '180px', height: '120px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #ccc' }} />
                <div className="text-center mt-2 fs-5 fw-semibold">Computer</div>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="row mb-4">
              <div className="col-md-6 mb-3">
                <label className="form-label fs-5">📝 Type your question</label>
                <textarea
                  className="form-control fs-4"
                  rows={3}
                  value={typedQuestion}
                  onChange={(e) => setTypedQuestion(e.target.value)}
                  placeholder="Type your question here..." />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fs-5">🎤 Or speak your question</label>
                <button className="btn btn-lg btn-warning mb-3" onClick={startListening}>
                  🎙️ Start Listening
                </button>
                <div className="border rounded p-3 bg-light fs-4">
                  <strong>Transcribed:</strong> {voiceText || 'Nothing yet...'}
                </div>
              </div>
            </div>

            <div className="text-center mb-4">
              <button
                className="btn btn-success btn-lg px-5 fs-4"
                onClick={handleSendMessage}
                disabled={loading}
              >
                {loading ? '⏳ Thinking...' : 'Get Help'}
              </button>
            </div>

            <div
              className="border rounded p-4 bg-white"
              style={{ maxHeight: '400px', overflowY: 'auto' }}
            >
              <h4 className="mb-3">💬 Assistant Conversation</h4>

              {conversation.map((msg, index) => (
                <div key={index} className="mb-3">
                  <span className={`fw-bold ${msg.role === 'user' ? 'text-primary' : 'text-success'}`}>
                    {msg.role === 'user' ? '🧓 You' : '🤖 Assistant'}:
                  </span>
                  <p className="mb-1 fs-5 d-flex justify-content-between align-items-center">
                    <span
                      className={`p-2 rounded ${msg.role === 'user' ? 'bg-primary-subtle text-dark' : 'bg-success-subtle text-dark'}`}
                      style={{ whiteSpace: 'pre-line', flex: 1 }}
                    >
                      {msg.content}
                    </span>
                    {msg.role === 'assistant' && (
                      <div className="ms-3 d-flex flex-column align-items-end">
                        {speakingIndex === index && !isPaused && (
                          <button
                            className="btn btn-sm btn-outline-secondary mb-1"
                            onClick={handlePause}
                          >
                            ⏸ Pause
                          </button>
                        )}
                        {speakingIndex === index && isPaused && (
                          <button
                            className="btn btn-sm btn-outline-secondary mb-1"
                            onClick={handleResume}
                          >
                            ▶️ Resume
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleReplay(msg.content, index)}
                        >
                          🔁 Replay
                        </button>
                      </div>
                    )}
                  </p>
                </div>
              ))}

              {loading && (
                <div className="mb-3">
                  <span className="fw-bold text-success">🤖 Assistant:</span>
                  <span className="typing-dots fs-5 ms-2">
                    Thinking<span className="dot">.</span>
                    <span className="dot">.</span>
                    <span className="dot">.</span>
                  </span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {showFeedbackButtons && (
              <div className="text-center mt-4">
                <p className="fs-5 fw-semibold">Were you satisfied with the help?</p>
                <button className="btn btn-success btn-lg me-3" onClick={handleSatisfied}>
                  ✅ Satisfied
                </button>
                <button className="btn btn-danger btn-lg" onClick={handleNotSatisfied}>
                  ❌ Not Satisfied
                </button>
              </div>
            )}
          </>
        )}
      </div></>
  );
};

export default EZMode;
