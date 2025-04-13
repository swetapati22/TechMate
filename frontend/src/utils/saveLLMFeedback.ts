import { db, auth } from '../firebase';
import {
  addDoc,
  collection,
  serverTimestamp,
  doc
} from 'firebase/firestore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const saveLLMFeedback = async (
  email: string,
  conversation: Message[],
  os: string | null,
  device: string | null,
  isSatisfied: boolean
) => {
  const formattedMessages = conversation
    .map((msg) => `${msg.role === 'user' ? '👵' : '🤖'}: ${msg.content}`)
    .join('\n');

  try {
    console.log('🧠 Starting saveLLMFeedback...');
    console.log('📨 Sending conversation to /llm-summary...', formattedMessages);

    const response = await fetch('http://localhost:5001/llm-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation: formattedMessages })
    });

    const result = await response.json();
    console.log('📦 LLM Summary Response:', result);

    const {
      question = 'Unknown',
      summary = 'Unavailable',
      appname = 'N/A',
      answer = ''
    } = result || {};

    const userId = auth.currentUser?.uid || 'anonymous';
    const userRef = doc(db, 'User_details', userId);
    console.log('🧾 User Ref:', userRef.path);

    const ticketData = {
      Id: Date.now(),
      createdTimestamp: serverTimestamp(),
      AnsweredTimestamp: serverTimestamp(),
      userid: userRef.path,
      email,
      devicename: device,
      os,
      question,
      summary,
      answer: isSatisfied ? answer : '',
      appname,
      LLMRequestStatus: isSatisfied,
      Satisfied: isSatisfied,
      is_resolved: false,
      answeredByuser: '',
      video: ''
    };

    console.log('🚀 Ready to save to Firestore:', ticketData);

    await addDoc(collection(db, 'LLMRequestStatus'), ticketData);
    console.log('✅ Firestore: Ticket saved to LLMRequestStatus');

  } catch (err) {
    console.error('❌ Firestore Save Error:', err);
  }
};
