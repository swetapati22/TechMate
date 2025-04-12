import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Question {
  id: string;
  question: string;
  answer?: string;
  status: 'unanswered' | 'answered';
  timestamp: string;
}

const mockQuestions: Question[] = [
  {
    id: '1',
    question: 'How do I reset my password?',
    status: 'unanswered',
    timestamp: '2025-04-12T09:00:00Z',
  },
  {
    id: '2',
    question: 'How do I use WhatsApp on my phone?',
    answer: 'Open the WhatsApp app, tap on a contact, and type your message.',
    status: 'answered',
    timestamp: '2025-04-11T18:00:00Z',
  },
  {
    id: '3',
    question: 'How do I check the weather?',
    status: 'unanswered',
    timestamp: '2025-04-10T14:30:00Z',
  }
];

const speakText = (text: string) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
  
    const setVoiceAndSpeak = () => {
      const voices = synth.getVoices();
      const preferredVoices = ['Google US English', 'Samantha', 'Microsoft Zira', 'Microsoft Aria'];
  
      const femaleVoice = voices.find((voice) =>
        preferredVoices.some((name) => voice.name.includes(name))
      );
  
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      } else if (voices.length > 0) {
        utterance.voice = voices[0]; // fallback to any available voice
      }
  
      utterance.pitch = 1.2; // slightly higher pitch
      utterance.rate = 1;    // normal speed
  
      synth.speak(utterance);
    };
  
    if (synth.getVoices().length === 0) {
      synth.onvoiceschanged = setVoiceAndSpeak;
    } else {
      setVoiceAndSpeak();
    }
  };
  

const AskGrandChild: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'unanswered' | 'answered'>('unanswered');

  useEffect(() => {
    setQuestions(mockQuestions);
  }, []);

  const handleDelete = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const filteredQuestions = questions.filter((q) => q.status === activeTab);

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="p-3 text-white" style={{ minHeight: '100vh', width: '250px', backgroundColor: 'navy' }}>
        <h4>Grandpa's Panel</h4>
        <ul className="nav flex-column">
          <li className="nav-item">
            <button className={`btn w-100 my-1 ${activeTab === 'unanswered' ? 'btn-light text-dark' : 'btn-outline-light text-white'}`} onClick={() => setActiveTab('unanswered')}>
              Unanswered Questions
            </button>
          </li>
          <li className="nav-item">
            <button className={`btn w-100 my-1 ${activeTab === 'answered' ? 'btn-light text-dark' : 'btn-outline-light text-white'}`} onClick={() => setActiveTab('answered')}>
              Answered Questions
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="p-4 flex-grow-1">
        <h3>{activeTab === 'unanswered' ? 'Pending Help Requests' : 'Resolved Help Requests'}</h3>
        <div className="list-group">
          {filteredQuestions.length === 0 ? (
            <p className="text-muted mt-3">No questions found.</p>
          ) : (
            filteredQuestions.map((q) => (
              <div key={q.id} className="list-group-item list-group-item-action mb-3 d-flex justify-content-between align-items-center">
                <div>
                  <h5>
                    🗨️ {q.question}{' '}
                    <button className="btn btn-sm btn-outline-primary ms-2" onClick={() => speakText(q.question)}>
                      🔊
                    </button>
                  </h5>
                  {q.status === 'answered' && (
                    <p className="mt-2">
                      ✅ <strong>Answer:</strong> {q.answer}{' '}
                      <button className="btn btn-sm btn-outline-success ms-2" onClick={() => speakText(q.answer!)}>
                        🔊
                      </button>
                    </p>
                  )}
                </div>
                {activeTab === 'unanswered' && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(q.id)}>Delete</button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AskGrandChild;