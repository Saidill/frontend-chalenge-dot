import type { QuizState, QuizResult, QuizHistory } from '../types/quiz';



const STORAGE_KEYS = {
  USER: 'quiz_user',
  QUIZ_STATE: 'quiz_state',
  QUIZ_HISTORY: 'quiz_history'
};

export const storage = {
  // User management
  setUser(username: string) {
    localStorage.setItem(STORAGE_KEYS.USER, username);
  },

  getUser(): string | null {
    return localStorage.getItem(STORAGE_KEYS.USER);
  },

  removeUser() {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Quiz state management
  saveQuizState(state: QuizState) {
    localStorage.setItem(STORAGE_KEYS.QUIZ_STATE, JSON.stringify(state));
  },

  getQuizState(): QuizState | null {
    const state = localStorage.getItem(STORAGE_KEYS.QUIZ_STATE);
    return state ? JSON.parse(state) : null;
  },

  clearQuizState() {
    localStorage.removeItem(STORAGE_KEYS.QUIZ_STATE);
  },

  saveQuizHistory(result: QuizResult) {
  const history = this.getQuizHistory();

  const historyItem: QuizHistory = {
    ...result,
    timestamp: Date.now(),
    username: this.getUser()
  };

  history.push(historyItem);

  localStorage.setItem(
    STORAGE_KEYS.QUIZ_HISTORY,
    JSON.stringify(history)
  );
},

getQuizHistory(): QuizHistory[] {
  const history = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
  return history ? JSON.parse(history) : [];
},


  clearAll() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};