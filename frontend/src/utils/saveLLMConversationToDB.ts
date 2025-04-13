import { db, auth } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface LLMFeedbackData {
  email: string;
  devicename: string;
  os: string;
  question: string;
  summary: string;
  answer: string;
  appname: string;
  LLMRequestStatus: boolean;
}

export const saveLLMConversationToDB = async (data: LLMFeedbackData) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.error("❌ No authenticated user found.");
      return;
    }

    const userRefPath = `users/${user.uid}`;
    const ticketId = Date.now().toString();
    const docRef = doc(db, 'LLMRequestStatus', ticketId);

    const payload = {
      Id: ticketId,
      createdTimestamp: serverTimestamp(),
      AnsweredTimestamp: serverTimestamp(),
      userid: userRefPath,
      email: data.email,
      devicename: data.devicename,
      os: data.os,
      question: data.question,
      summary: data.summary,
      answer: data.LLMRequestStatus ? data.answer : '',
      appname: data.appname,
      LLMRequestStatus: data.LLMRequestStatus,
      is_resolved: false,
      video: '',
    };

    await setDoc(docRef, payload);

    console.log(`✅ Saved to Firestore (ticketId: ${ticketId}):`);
    Object.entries(payload).forEach(([key, val]) => {
      console.log(`📌 ${key}:`, val);
    });
  } catch (error) {
    console.error("🔥 Failed to save LLM feedback:", error);
  }
};
