const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Quiz = require('../src/models/Quiz');

const quizzes = [
  {
    levelId: 'qaida_1',
    module: 'Qaida',
    title: 'Basic Alphabets Quiz',
    questions: [
      {
        question: 'Which of these is the letter Alif?',
        options: ['ا', 'ب', 'ت', 'ث'],
        correctAnswer: 0,
        explanation: 'Alif is a straight vertical line.'
      },
      {
        question: 'How many dots does the letter Ba (ب) have?',
        options: ['None', 'One dot below', 'Two dots above', 'Three dots above'],
        correctAnswer: 1,
        explanation: 'Ba has one dot below the boat shape.'
      },
      {
        question: 'Which letter has two dots above it?',
        options: ['ب', 'ت', 'ث', 'ج'],
        correctAnswer: 1,
        explanation: 'Ta (ت) has two dots on top.'
      }
    ]
  },
  {
    levelId: 'qaida_2',
    module: 'Qaida',
    title: 'Letter Combinations Quiz',
    questions: [
      {
        question: 'When letters are joined, do they always keep their full shape?',
        options: ['Yes', 'No, they often change to a shorter "head" shape', 'Only Alif changes', 'Only dots change'],
        correctAnswer: 1
      },
      {
        question: 'Identify the combination: لا',
        options: ['Ba-Alif', 'Lam-Alif', 'Kaaf-Alif', 'Nun-Alif'],
        correctAnswer: 1
      }
    ]
  },
  {
    levelId: 'qaida_3',
    module: 'Qaida',
    title: 'Harakat Quiz',
    questions: [
      {
        question: 'What sound does Fatha (َ ) make?',
        options: ['"ee" sound', '"oo" sound', '"aa" or "eh" sound', 'No sound'],
        correctAnswer: 2
      },
      {
        question: 'Which sign is placed BELOW the letter?',
        options: ['Fatha', 'Kasra', 'Damma', 'Sukun'],
        correctAnswer: 1
      },
      {
        question: 'What is the "oo" sound sign called?',
        options: ['Fatha', 'Kasra', 'Damma', 'Tanween'],
        correctAnswer: 2
      }
    ]
  },
  {
    levelId: 'quran_1',
    module: 'Quran',
    title: 'Short Surahs Quiz',
    questions: [
      {
        question: 'What is the first Surah of the Quran?',
        options: ['Al-Ikhlas', 'An-Nas', 'Al-Fatihah', 'Al-Baqarah'],
        correctAnswer: 2
      },
      {
        question: 'Which Surah is known for emphasizing "The Oneness of Allah"?',
        options: ['Al-Falaq', 'Al-Ikhlas', 'An-Nas', 'Al-Kawthar'],
        correctAnswer: 1
      },
      {
        question: 'How many verses are in Surah Al-Ikhlas?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1
      }
    ]
  }
];

async function seedQuizzes() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    // Clear existing quizzes
    await Quiz.deleteMany({});
    console.log('Existing quizzes cleared');

    // Insert new quizzes
    await Quiz.insertMany(quizzes);
    console.log(`Successfully seeded ${quizzes.length} quizzes`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding quizzes:', error);
    process.exit(1);
  }
}

seedQuizzes();
