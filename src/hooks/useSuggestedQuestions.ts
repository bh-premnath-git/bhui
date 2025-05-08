import { useState } from 'react';

export interface SuggestedQuestion {
  id: string;
  text: string;
  category?: string;
}

export function useSuggestedQuestions() {
  const defaultQuestions: SuggestedQuestion[] = [
    {
      id: '1',
      text: "Which customers placed the most and fewest orders?",
      category: "sales"
    },
    {
      id: '2',
      text: "List top 10 expensive products",
      category: "sales"
    },
    {
      id: '3',
      text: "How is order volume distributed among employees within territory?",
      category: "sales"
    },
    {
      id: '4',
      text: "For the top customer, what product categories do they order most?",
      category: "products"
    },
    {
      id: '5',
      text: "Which shipping methods are used significantly more or less than average?",
      category: "employees"
    },
    {
      id: '6',
      text: "What are our top 5 performing products?",
      category: "products"
    }
  ];

  const [questions, setQuestions] = useState<SuggestedQuestion[]>(defaultQuestions);

  const addQuestion = (question: Omit<SuggestedQuestion, 'id'>) => {
    const newQuestion = {
      ...question,
      id: crypto.randomUUID()
    };
    setQuestions(prev => [newQuestion, ...prev]);
    return newQuestion;
  };

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const getQuestionsByCategory = (category: string) => {
    return questions.filter(q => q.category === category);
  };

  const getQuestionsAsArray = () => {
    return questions.map(q => q.text);
  };

  return {
    questions,
    addQuestion,
    removeQuestion,
    getQuestionsByCategory,
    getQuestionsAsArray
  };
}

export function useSuggestedDataopsQuestions() {
  const defaultQuestions: SuggestedQuestion[] = [
    {
      id: '1',
      text: "Show me the jobs failed for last week",
      category: "dataops"
    },
    {
      id: '2',
      text: "Show me all jobs which costed more than $1000 today?",
      category: "dataops"
    },
    {
      id: '3',
      text: "Show me job with less than 90% quality?",
      category: "dataops"
    },
    {
      id: '4',
      text: "Show me jobs with latency greater than 2hrs",
      category: "dataops"
    },
  ];

  const [questions, setQuestions] = useState<SuggestedQuestion[]>(defaultQuestions);

  const addQuestion = (question: Omit<SuggestedQuestion, 'id'>) => {
    const newQuestion = {
      ...question,
      id: crypto.randomUUID()
    };
    setQuestions(prev => [newQuestion, ...prev]);
    return newQuestion;
  };

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const getQuestionsByCategory = (category: string) => {
    return questions.filter(q => q.category === category);
  };

  const getQuestionsAsArray = () => {
    return questions.map(q => q.text);
  };

  return {
    questions,
    addQuestion,
    removeQuestion,
    getQuestionsByCategory,
    getQuestionsAsArray
  };
}
