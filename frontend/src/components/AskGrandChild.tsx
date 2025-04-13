import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface Question {
  id: string;
  question: string;
  answer?: string;
  status: 'unanswered' | 'answered';
  timestamp: string;
}

const AskGrandChild: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'unanswered' | 'answered'>('unanswered');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current user's email once auth is ready
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch questions after userEmail is available
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!userEmail) {
        console.log("User not logged in or email unavailable");
        return;
      }

      setLoading(true);

      try {
        const isResolved = activeTab === 'answered';
        const q = query(
          collection(db, 'LLMRequestStatus'),
          where('email', '==', userEmail),
          where('is_resolved', '==', isResolved)
        );

        const snapshot = await getDocs(q);
        const fetchedQuestions: Question[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            question: data.question || '',
            answer: data.answer || '',
            status: data.is_resolved ? 'answered' : 'unanswered',
            timestamp: data.createdTimestamp?.toDate().toISOString() || new Date().toISOString(),
          };
        });

        setQuestions(fetchedQuestions);
      } catch (err) {
        console.error('Error fetching questions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchQuestions();
    }
  }, [activeTab, userEmail]);

  const speakText = (text: string) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const preferredVoices = ['Google US English', 'Samantha', 'Microsoft Zira'];
    const selectedVoice = voices.find((voice) =>
      preferredVoices.some((name) => voice.name.includes(name))
    ) || voices[0];

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.pitch = 1.2;
    utterance.rate = 1;
    synth.speak(utterance);
  };

  const handleDelete = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    // Optional: delete from Firestore
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="p-3 text-white" style={{ minHeight: '100vh', width: '250px', backgroundColor: '#edb26b' }}>
        <h4>ELDER's PANEL</h4>
        <ul className="nav flex-column">
          <li className="nav-item">
            <button
              className={`btn w-100 my-1 ${activeTab === 'unanswered' ? 'btn-light text-dark' : 'btn-outline-light text-white'}`}
              onClick={() => setActiveTab('unanswered')}
            >
              Unanswered Questions
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`btn w-100 my-1 ${activeTab === 'answered' ? 'btn-light text-dark' : 'btn-outline-light text-white'}`}
              onClick={() => setActiveTab('answered')}
            >
              Answered Questions
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="p-4 flex-grow-1">
        <h3 className="mb-4">
          {activeTab === 'unanswered' ? 'Pending Help Requests' : 'Resolved Help Requests'}
        </h3>

        {loading ? (
          <div className="alert alert-secondary">Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className="alert alert-info">No questions found</div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {questions.map((q) => (
              <div key={q.id} className="col">
                <div className="card h-100 shadow-sm">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title flex-grow-1">🗨️ {q.question}</h5>
                      {activeTab === 'unanswered' && (
                        <button
                          className="btn btn-danger btn-sm ms-2"
                          onClick={() => handleDelete(q.id)}
                          title="Delete question"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <div className="mt-auto">
                      {q.status === 'answered' ? (
                        <div className="alert alert-success mb-0">
                          <strong>✅ Answer:</strong> {q.answer}
                          {q.answer && (
                            <button
                              className="btn btn-sm btn-outline-success ms-2"
                              onClick={() => speakText(q.answer!)}
                              title="Speak answer"
                            >
                              🔊
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="alert alert-warning mb-0">
                          ⏳ Waiting for answer
                        </div>
                      )}
                    </div>

                    <div className="mt-3 d-flex justify-content-between align-items-center">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => speakText(q.question)}
                        title="Speak question"
                      >
                        🔊 Speak Question
                      </button>
                      <small className="text-muted">
                        {new Date(q.timestamp).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AskGrandChild;
