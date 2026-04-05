const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Quiz = require('../src/models/Quiz');

const quizzes = [
  {
    levelId: 'qaida_1',
    module: 'Qaida',
    title: 'Qaida Level 1 - Basic Alphabets Quiz',
    questions: [
      {
        question: 'Which of these is the letter Alif?',
        options: ['ا', 'ب', 'ت', 'ث'],
        correctAnswer: 0,
        explanation: 'Alif is the straight vertical letter.'
      },
      {
        question: 'How many dots does Ba (ب) have?',
        options: ['No dot', 'One dot below', 'Two dots above', 'Three dots above'],
        correctAnswer: 1,
        explanation: 'Ba has one dot under the shape.'
      },
      {
        question: 'Which letter has two dots above it?',
        options: ['ب', 'ت', 'ث', 'ج'],
        correctAnswer: 1,
        explanation: 'Ta (ت) has two dots above.'
      }
    ]
  },
  {
    levelId: 'qaida_2',
    module: 'Qaida',
    title: 'Qaida Level 2 - Letter Connections Quiz',
    questions: [
      {
        question: 'What is the connected form of Lam + Alif?',
        options: ['با', 'لا', 'نا', 'فا'],
        correctAnswer: 1,
        explanation: 'Lam and Alif combine into لا.'
      },
      {
        question: 'When letters connect, their shape can change.',
        options: ['Always false', 'Sometimes true', 'Only for Alif', 'Only for Ya'],
        correctAnswer: 1,
        explanation: 'Many Arabic letters have isolated and connected forms.'
      },
      {
        question: 'Which one is a connected pair?',
        options: ['ب ا', 'ل ا', 'ت .', 'ج ,'],
        correctAnswer: 1,
        explanation: 'Lam + Alif is a common connected pair.'
      }
    ]
  },
  {
    levelId: 'qaida_3',
    module: 'Qaida',
    title: 'Qaida Level 3 - Harakat Quiz',
    questions: [
      {
        question: 'Which harakah gives an "a" sound?',
        options: ['Kasra', 'Damma', 'Fatha', 'Sukun'],
        correctAnswer: 2,
        explanation: 'Fatha gives a short "a" sound.'
      },
      {
        question: 'Which sign appears below the letter?',
        options: ['Fatha', 'Kasra', 'Damma', 'Shadda'],
        correctAnswer: 1,
        explanation: 'Kasra is written below the letter.'
      },
      {
        question: 'Which harakah gives a short "u" sound?',
        options: ['Fatha', 'Kasra', 'Damma', 'Tanween'],
        correctAnswer: 2,
        explanation: 'Damma gives a short "u" sound.'
      }
    ]
  },
  {
    levelId: 'qaida_4',
    module: 'Qaida',
    title: 'Qaida Level 4 - Sukoon and Shadda Quiz',
    questions: [
      {
        question: 'What does Sukoon indicate?',
        options: ['Long vowel', 'No vowel sound', 'Double vowel', 'Nasal sound'],
        correctAnswer: 1,
        explanation: 'Sukoon means the letter is read without a vowel.'
      },
      {
        question: 'What does Shadda indicate?',
        options: ['Stop sound', 'Double consonant', 'Silent letter', 'Tanween'],
        correctAnswer: 1,
        explanation: 'Shadda means the consonant is doubled.'
      },
      {
        question: 'Which one contains Shadda?',
        options: ['بْ', 'بَ', 'بّ', 'بُ'],
        correctAnswer: 2,
        explanation: 'The symbol ّ marks Shadda.'
      }
    ]
  },
  {
    levelId: 'qaida_5',
    module: 'Qaida',
    title: 'Qaida Level 5 - Tanween and Madd Quiz',
    questions: [
      {
        question: 'Tanween usually adds which sound at the end?',
        options: ['m', 'n', 's', 'r'],
        correctAnswer: 1,
        explanation: 'Tanween gives an "n" ending sound.'
      },
      {
        question: 'How many counts for Madd Asli?',
        options: ['1', '2', '4', '6'],
        correctAnswer: 1,
        explanation: 'Madd Asli is typically stretched for 2 counts.'
      },
      {
        question: 'Which sign is Tanween Fath?',
        options: ['ً', 'ٍ', 'ٌ', 'ْ'],
        correctAnswer: 0,
        explanation: 'ً is Fathatain (Tanween Fath).'
      }
    ]
  },
  {
    levelId: 'qaida_6',
    module: 'Qaida',
    title: 'Qaida Level 6 - Applied Reading Quiz',
    questions: [
      {
        question: 'When reading words, what should be prioritized first?',
        options: ['Speed', 'Correct makhraj', 'Volume', 'Decoration'],
        correctAnswer: 1,
        explanation: 'Correct articulation comes before speed.'
      },
      {
        question: 'If a letter has Sukoon, you should:',
        options: ['Add a vowel', 'Skip the letter', 'Read it without vowel', 'Double it'],
        correctAnswer: 2,
        explanation: 'Sukoon means no vowel movement on the letter.'
      },
      {
        question: 'Best practice for mastering Qaida level is:',
        options: ['One-time reading', 'Daily repetition', 'Only quizzes', 'Only writing'],
        correctAnswer: 1,
        explanation: 'Consistent daily repetition improves fluency.'
      }
    ]
  },
  {
    levelId: 'qaida_7',
    module: 'Qaida',
    title: 'Qaida Level 7 - Mastery Review Quiz',
    questions: [
      {
        question: 'Qaida mastery mainly prepares you for:',
        options: ['Arabic grammar only', 'Quran recitation fluency', 'Calligraphy only', 'Translation only'],
        correctAnswer: 1,
        explanation: 'Qaida builds the foundation for correct Quran recitation.'
      },
      {
        question: 'In a revision session, you should focus on:',
        options: ['Only easy items', 'Previously weak areas', 'Only new topics', 'Only long surahs'],
        correctAnswer: 1,
        explanation: 'Targeting weak areas improves overall accuracy.'
      },
      {
        question: 'A strong Qaida learner is identified by:',
        options: ['Fast reading only', 'Correct and consistent pronunciation', 'Memorizing English only', 'Skipping rules'],
        correctAnswer: 1,
        explanation: 'Consistency and correctness are key outcomes.'
      }
    ]
  },
  {
    levelId: 'quran_1',
    module: 'Quran',
    title: 'Quran Level 1 - Opening and Essentials Quiz',
    questions: [
      {
        question: 'What is the first surah of the Quran?',
        options: ['Al-Ikhlas', 'An-Nas', 'Al-Fatihah', 'Al-Baqarah'],
        correctAnswer: 2,
        explanation: 'Al-Fatihah is the opening surah.'
      },
      {
        question: 'How many ayahs are in Surah Al-Ikhlas?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1,
        explanation: 'Surah Al-Ikhlas has 4 ayahs.'
      },
      {
        question: 'Surah Al-Kawthar has how many ayahs?',
        options: ['2', '3', '4', '5'],
        correctAnswer: 1,
        explanation: 'Surah Al-Kawthar has 3 ayahs.'
      }
    ]
  },
  {
    levelId: 'quran_2',
    module: 'Quran',
    title: 'Quran Level 2 - Daily Reflection I Quiz',
    questions: [
      {
        question: 'Surah Al-Fil discusses the people of:',
        options: ['The cave', 'The elephant', 'The sea', 'The mountain'],
        correctAnswer: 1,
        explanation: 'Surah Al-Fil describes the event of the elephant army.'
      },
      {
        question: 'Surah Quraysh emphasizes gratitude for:',
        options: ['Food and safety', 'Trade only', 'Rain only', 'War victory'],
        correctAnswer: 0,
        explanation: 'It highlights Allah’s blessings of provision and security.'
      },
      {
        question: 'Surah Al-Masad is also known as:',
        options: ['Al-Lahab', 'Al-Feel', 'Al-Maun', 'Al-Asr'],
        correctAnswer: 0,
        explanation: 'Surah 111 is known as Al-Masad or Al-Lahab.'
      }
    ]
  },
  {
    levelId: 'quran_3',
    module: 'Quran',
    title: 'Quran Level 3 - Daily Reflection II Quiz',
    questions: [
      {
        question: 'Surah Al-Falaq and Surah An-Nas are recited for:',
        options: ['Travel planning', 'Protection', 'Trade success', 'Historical stories'],
        correctAnswer: 1,
        explanation: 'They are commonly recited as supplications for protection.'
      },
      {
        question: 'Surah An-Nas focuses on seeking refuge in the Lord of:',
        options: ['The heavens', 'The angels', 'Mankind', 'The earth'],
        correctAnswer: 2,
        explanation: 'The surah repeatedly mentions رب الناس (Lord of mankind).'
      },
      {
        question: 'Surah Al-Kafirun teaches clarity in:',
        options: ['Worship and belief', 'Food laws', 'Inheritance', 'Travel etiquette'],
        correctAnswer: 0,
        explanation: 'It emphasizes clear distinction in creed and worship.'
      }
    ]
  },
  {
    levelId: 'quran_4',
    module: 'Quran',
    title: 'Quran Level 4 - Accountability and Time Quiz',
    questions: [
      {
        question: 'Surah Al-Asr highlights the value of:',
        options: ['Wealth', 'Time', 'Strength', 'Fame'],
        correctAnswer: 1,
        explanation: 'The surah begins with an oath by time.'
      },
      {
        question: 'Surah At-Takathur warns against excessive:',
        options: ['Charity', 'Competition in worldly increase', 'Prayer', 'Travel'],
        correctAnswer: 1,
        explanation: 'It warns about distraction through rivalry in worldly gains.'
      },
      {
        question: 'Surah Al-Bayyinah discusses the coming of:',
        options: ['A king', 'Clear proof', 'A battle', 'A prophet before Islam'],
        correctAnswer: 1,
        explanation: 'Al-Bayyinah literally means the clear evidence.'
      }
    ]
  },
  {
    levelId: 'quran_5',
    module: 'Quran',
    title: 'Quran Level 5 - Power and Awakening Quiz',
    questions: [
      {
        question: 'Surah Az-Zalzalah describes events of:',
        options: ['Creation', 'The Day of Judgment', 'Migration', 'Battle'],
        correctAnswer: 1,
        explanation: 'It describes the earth shaking on the Last Day.'
      },
      {
        question: 'Surah Al-Adiyat opens with oaths by:',
        options: ['Stars', 'Winds', 'Galloping horses', 'Rain clouds'],
        correctAnswer: 2,
        explanation: 'It starts with oaths related to racing horses.'
      },
      {
        question: 'Surah Al-Alaq starts with the command:',
        options: ['Read', 'Listen', 'Write', 'Travel'],
        correctAnswer: 0,
        explanation: 'The first revealed word is "Iqra" (Read).'
      }
    ]
  },
  {
    levelId: 'quran_6',
    module: 'Quran',
    title: 'Quran Level 6 - Character Building I Quiz',
    questions: [
      {
        question: 'Surah Al-Balad speaks about striving through:',
        options: ['Luxury', 'Difficulty', 'Entertainment', 'Isolation'],
        correctAnswer: 1,
        explanation: 'It reminds that humans are created into hardship and effort.'
      },
      {
        question: 'Surah Ash-Shams links success to:',
        options: ['Purifying the soul', 'Winning arguments', 'Collecting wealth', 'Physical power'],
        correctAnswer: 0,
        explanation: 'Success is tied to cleansing the soul.'
      },
      {
        question: 'Surah Al-Lail contrasts those who:',
        options: ['Read and write', 'Give and withhold', 'Travel and stay', 'Farm and trade'],
        correctAnswer: 1,
        explanation: 'It contrasts generosity and piety with stinginess.'
      }
    ]
  },
  {
    levelId: 'quran_7',
    module: 'Quran',
    title: 'Quran Level 7 - Character Building II Quiz',
    questions: [
      {
        question: 'Surah Ad-Duha gives comfort to the Prophet and teaches:',
        options: ['Despair', 'Hope and gratitude', 'Isolation', 'Silence'],
        correctAnswer: 1,
        explanation: 'The surah reassures and encourages gratitude and care.'
      },
      {
        question: 'Surah Ash-Sharh highlights that with hardship comes:',
        options: ['Punishment', 'Ease', 'Delay', 'Loss'],
        correctAnswer: 1,
        explanation: 'The surah repeats that ease accompanies hardship.'
      },
      {
        question: 'Surah At-Tin concludes with Allah as:',
        options: ['Most Powerful only', 'Best of judges', 'Most hidden', 'Lord of trade'],
        correctAnswer: 1,
        explanation: 'It closes by affirming Allah as the most just judge.'
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
