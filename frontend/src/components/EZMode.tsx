import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import androidLogo from '../assets/android_logo.png';
import iosLogo from '../assets/IOS_logo.png';
import phoneImg from '../assets/phone.jpg';
import tabletImg from '../assets/tablet.jpg';
import laptopImg from '../assets/laptop.jpeg';
import './EZMode.css';
import { saveLLMFeedback } from '../utils/saveLLMFeedback';

const EZMode = () => {
  const [userEmail, setUserEmail] = useState('');
  const [typedQuestion, setTypedQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [osChoice, setOsChoice] = useState(null);
  const [deviceType, setDeviceType] = useState(null);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  const synth = window.speechSynthesis;
  const utteranceRef = useRef(null);
  const [speakingIndex, setSpeakingIndex] = useState(null);
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
      setTypedQuestion(transcript);
    };

    recognition.onerror = (event: any) => {
      alert('Voice recognition error: ' + event.error);
    };

    recognition.start();
  };

  const handleSendMessage = async () => {
    if (!typedQuestion.trim()) {
      alert('Please type or speak your question.');
      return;
    }

    const updatedConversation = [
      ...conversation,
      { role: 'user', content: typedQuestion },
    ];
    setConversation(updatedConversation);
    setTypedQuestion('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/generate-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: [
            "You are a kind, encouraging, and patient assistant helping elderly users. Please explain everything as clearly and thoroughly as possible, using simple step-by-step instructions, even for basic tasks. Offer reassurance and praise their efforts to motivate and comfort them throughout the process.",
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
      playMessage(assistantReply, updatedConversation.length);
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

  const handleSatisfied = async () => {
    const goodbye = "I'm glad I could help. Taking you back to the homepage now. I'll be here if you need anything again!";
    synth.cancel();
    synth.speak(new SpeechSynthesisUtterance(goodbye));

    await saveLLMFeedback(userEmail, conversation, osChoice, deviceType, true);
    setTimeout(() => navigate('/dashboard'), 5000);
  };

  const handleNotSatisfied = async () => {
    const message = "Looks like I wasn't able to help this time. Let’s find a young helper! I’ll post your question in the Talk with GrandKid section for further help.";
    synth.cancel();
    synth.speak(new SpeechSynthesisUtterance(message));

    await saveLLMFeedback(userEmail, conversation, osChoice, deviceType, false);
    setTimeout(() => navigate('/ask-grandkid'), 7000);
  };

  const showFeedbackButtons = conversation.length > 0 && conversation[conversation.length - 1].role === 'assistant';

  return (
    <div className="ezmode-container">
      {deviceType && (
        <div className="user-header">
          <h2>Welcome, {userEmail}</h2>
        </div>
      )}

      <div className="main-content">
        {!osChoice ? (
          <div className="selection-screen">
            <p className="selection-prompt">📱 Which operating system are you using?</p>
            <div className="os-grid">
              <button className="device-card" onClick={() => setOsChoice('Android')}>
                <img src={androidLogo} alt="Android" className="os-image" />
                <div className="device-label">Android</div>
              </button>
              <button className="device-card" onClick={() => setOsChoice('iOS')}>
                <img src={iosLogo} alt="iOS" className="os-image" />
                <div className="device-label">iOS</div>
              </button>
            </div>
          </div>
        ) : !deviceType ? (
          <div className="selection-screen">
            <p className="selection-prompt">📲 What kind of device are you using?</p>
            <div className="device-grid">
              {['Phone', 'Tablet', 'Computer'].map((device) => (
                <button key={device} className="device-card" onClick={() => setDeviceType(device)}>
                  <img
                    src={device === 'Phone' ? phoneImg : device === 'Tablet' ? tabletImg : laptopImg}
                    alt={device}
                    className="device-image"
                  />
                  <div className="device-label">{device}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="conversation-window">
              <h4 className="conversation-title">💬 Assistant Conversation</h4>
              <div className="chat-scroll-container">
                {conversation.map((msg, index) => (
                  <div key={index} className={`message-container ${msg.role}-message`}>
                    <div className="message-header">
                      {msg.role === 'user' ? '🧓 You' : '🤖 Assistant'}
                    </div>
                    <div className="message-content">
                      {msg.content.split('\n').map((line, i) => (
                        <p key={i} className="instruction-step">{line}</p>
                      ))}
                    </div>
                    {msg.role === 'assistant' && (
                      <div className="voice-controls">
                        {speakingIndex === index && (
                          !isPaused ? (
                            <button className="voice-control-btn" onClick={handlePause}>⏸ Pause</button>
                          ) : (
                            <button className="voice-control-btn" onClick={handleResume}>▶️ Resume</button>
                          )
                        )}
                        <button className="voice-control-btn" onClick={() => handleReplay(msg.content, index)}>🔁 Replay</button>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="input-area">
                <input
                  type="text"
                  placeholder="Type your question..."
                  value={typedQuestion}
                  onChange={(e) => setTypedQuestion(e.target.value)}
                />
                <button onClick={handleSendMessage}>📤 Send</button>
                <button onClick={startListening}>🎤 Speak</button>
              </div>

              {loading && <p className="loading-msg">⏳ Thinking...</p>}

              {showFeedbackButtons && (
                <div className="feedback-buttons">
                  <button onClick={handleSatisfied}>😊 Yes, it helped</button>
                  <button onClick={handleNotSatisfied}>😕 Not really</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EZMode;