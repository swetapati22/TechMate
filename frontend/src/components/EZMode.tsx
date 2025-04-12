import React, { useEffect, useState } from 'react';
import { useSpeechSynthesis } from 'react-speech-kit';
import { auth } from '../firebase';

const EZMode: React.FC = () => {
  const [typedQuestion, setTypedQuestion] = useState('');
  const [voiceText, setVoiceText] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const { speak } = useSpeechSynthesis();

  const mockResponse = [
    'Open your email app',
    'Tap the compose button',
    "Type the recipient's address",
    'Write your message',
    'Tap send to deliver the email',
  ];

  // Web Speech API for voice-to-text
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

  const handleGetHelp = () => {
    const question = typedQuestion || voiceText;

    if (!question) {
      alert('Please type or speak your question.');
      return;
    }

    // Show mocked steps
    setSteps(mockResponse);

    // Read steps aloud
    speak({ text: mockResponse.join('. ') });
  };

  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (auth.currentUser) {
      setUserEmail(auth.currentUser.email || '');
      setUserId(auth.currentUser.uid);
    }
  }, []);

  return (
    <><div>
      <h2>Welcome, {userEmail}</h2>
      <p>Your UID: {userId}</p>
    </div>
    <div className="container py-5">
        <h1 className="text-center mb-5 display-4">🎙️ EZMode – Ask a Question</h1>

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
          <button className="btn btn-success btn-lg px-5 fs-4" onClick={handleGetHelp}>
            Get Help
          </button>
        </div>

        {steps.length > 0 && (
          <div className="mt-5">
            <h3 className="text-center mb-4">📋 Steps to follow:</h3>
            <ol className="fs-4">
              {steps.map((step, index) => (
                <li key={index} className="mb-2">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div></>
  );
};

export default EZMode;
