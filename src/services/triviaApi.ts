import type { Question, QuizQuestion } from "../types/quiz";

const API_BASE_URL = "https://opentdb.com";
const CACHE_KEY = "trivia_questions_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to wait/delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const triviaApi = {
  async getQuestions(
    amount: number = 10,
    category?: number,
    difficulty?: string,
  ): Promise<QuizQuestion[]> {
    // Try to get from cache first
    const cached = this.getFromCache();
    if (cached) {
      console.log("Using cached questions");
      return cached;
    }

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retry attempt ${attempt}...`);
          await delay(2000 * attempt); // Exponential backoff: 2s, 4s
        }

        let url = `${API_BASE_URL}/api.php?amount=${amount}`;

        if (category) {
          url += `&category=${category}`;
        }

        if (difficulty) {
          url += `&difficulty=${difficulty}`;
        }

        const response = await fetch(url);

        // Handle rate limiting
        if (response.status === 429) {
          console.warn("Rate limited. Waiting before retry...");
          await delay(5000); // Wait 5 seconds for rate limit
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.response_code !== 0) {
          if (data.response_code === 5) {
            throw new Error(
              "Rate limit exceeded. Please try again in a few seconds.",
            );
          }
          throw new Error(`API error code: ${data.response_code}`);
        }

        const questions = data.results.map(
          (question: Question, index: number) => ({
            ...question,
            id: `${Date.now()}-${index}`,
            answers: shuffleArray([
              question.correct_answer,
              ...question.incorrect_answers,
            ]),
            question: decodeHtml(question.question),
            correct_answer: decodeHtml(question.correct_answer),
            incorrect_answers: question.incorrect_answers.map(decodeHtml),
          }),
        );

        // Cache the questions
        this.saveToCache(questions);

        return questions;
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
      }
    }

    // If all retries failed, try to use fallback questions
    console.log("All attempts failed, using fallback questions");
    return this.getFallbackQuestions();
  },

  async getCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/api_category.php`);
      const data = await response.json();
      return data.trivia_categories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  // Cache management
  saveToCache(questions: QuizQuestion[]) {
    try {
      const cacheData = {
        questions,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  },

  getFromCache(): QuizQuestion[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { questions, timestamp } = JSON.parse(cached);

      // Check if cache is still valid
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return questions;
    } catch (error) {
      console.error("Error reading from cache:", error);
      return null;
    }
  },

  // Fallback questions when API is unavailable
  getFallbackQuestions(): QuizQuestion[] {
    const fallbackData = [
      {
        category: "General Knowledge",
        type: "multiple",
        difficulty: "medium",
        question: "What is the capital of France?",
        correct_answer: "Paris",
        incorrect_answers: ["London", "Berlin", "Madrid"],
      },
      {
        category: "Science",
        type: "multiple",
        difficulty: "easy",
        question: "What planet is known as the Red Planet?",
        correct_answer: "Mars",
        incorrect_answers: ["Venus", "Jupiter", "Saturn"],
      },
      {
        category: "History",
        type: "multiple",
        difficulty: "medium",
        question: "In which year did World War II end?",
        correct_answer: "1945",
        incorrect_answers: ["1944", "1946", "1943"],
      },
      {
        category: "Geography",
        type: "multiple",
        difficulty: "easy",
        question: "What is the largest ocean on Earth?",
        correct_answer: "Pacific Ocean",
        incorrect_answers: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean"],
      },
      {
        category: "Science",
        type: "boolean",
        difficulty: "easy",
        question: "The Earth is flat.",
        correct_answer: "False",
        incorrect_answers: ["True"],
      },
      {
        category: "General Knowledge",
        type: "multiple",
        difficulty: "easy",
        question: "How many continents are there?",
        correct_answer: "7",
        incorrect_answers: ["5", "6", "8"],
      },
      {
        category: "Science",
        type: "multiple",
        difficulty: "medium",
        question: "What is the chemical symbol for gold?",
        correct_answer: "Au",
        incorrect_answers: ["Go", "Gd", "Ag"],
      },
      {
        category: "History",
        type: "multiple",
        difficulty: "easy",
        question: "Who was the first President of the United States?",
        correct_answer: "George Washington",
        incorrect_answers: [
          "Thomas Jefferson",
          "John Adams",
          "Benjamin Franklin",
        ],
      },
      {
        category: "Geography",
        type: "multiple",
        difficulty: "medium",
        question: "What is the capital of Japan?",
        correct_answer: "Tokyo",
        incorrect_answers: ["Kyoto", "Osaka", "Hiroshima"],
      },
      {
        category: "Science",
        type: "boolean",
        difficulty: "easy",
        question: "Water boils at 100 degrees Celsius at sea level.",
        correct_answer: "True",
        incorrect_answers: ["False"],
      },
    ];

    return fallbackData.map((question, index) => ({
      ...question,
      id: `fallback-${index}`,
      answers: shuffleArray([
        question.correct_answer,
        ...question.incorrect_answers,
      ]),
    }));
  },
};

// Utility function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Utility function to decode HTML entities
function decodeHtml(html: string): string {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}
