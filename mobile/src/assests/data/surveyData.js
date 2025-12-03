// Survey Questions Data for Learner Assessment

export const surveyQuestions = [
  // Section 1: Reading Ability
  {
    id: 'q1',
    section: 'Reading Ability',
    sectionNumber: 1,
    question: 'Can you recognize Arabic alphabets?',
    options: [
      { label: 'Yes, all alphabets', value: 'all_alphabets', score: 3 },
      { label: 'Only some alphabets', value: 'some_alphabets', score: 2 },
      { label: "No, I don't recognize alphabets", value: 'no_alphabets', score: 1 }
    ],
    required: true
  },
  {
    id: 'q2',
    section: 'Reading Ability',
    sectionNumber: 1,
    question: 'Can you read Arabic letters with basic vowel signs (Harakat: َ ِ ُ )?',
    options: [
      { label: 'Yes, easily', value: 'easily', score: 4 },
      { label: 'Yes, but slowly', value: 'slowly', score: 3 },
      { label: 'I struggle', value: 'struggle', score: 2 },
      { label: 'Not at all', value: 'not_at_all', score: 1 }
    ],
    required: true
  },

  // Section 2: Pronunciation Ability
  {
    id: 'q3',
    section: 'Pronunciation Ability',
    sectionNumber: 2,
    question: 'Can you pronounce Arabic letters correctly (like خ، غ، ق ، ح )?',
    options: [
      { label: 'Yes, correctly', value: 'correctly', score: 4 },
      { label: 'Some of them', value: 'some', score: 3 },
      { label: 'I struggle with many', value: 'struggle_many', score: 2 },
      { label: 'Not at all', value: 'not_at_all', score: 1 }
    ],
    required: true
  },
  {
    id: 'q4',
    section: 'Pronunciation Ability',
    sectionNumber: 2,
    question: 'Have you ever practiced Tajweed rules?',
    options: [
      { label: 'Yes, intermediate', value: 'intermediate', score: 4 },
      { label: 'Yes, basic rules', value: 'basic', score: 3 },
      { label: "I've heard about Tajweed but never studied", value: 'heard_only', score: 2 },
      { label: 'No', value: 'no', score: 1 }
    ],
    required: true
  },

  // Section 3: Word & Sentence Reading
  {
    id: 'q5',
    section: 'Word & Sentence Reading',
    sectionNumber: 3,
    question: 'Can you read 2–3 letter Arabic words?\n(مثال: بَاب – دَرَس – كِتَاب)',
    options: [
      { label: 'Yes, easily', value: 'easily', score: 4 },
      { label: 'Yes, but slowly', value: 'slowly', score: 3 },
      { label: 'Very difficult', value: 'very_difficult', score: 2 },
      { label: 'Cannot read', value: 'cannot_read', score: 1 }
    ],
    required: true
  },
  {
    id: 'q6',
    section: 'Word & Sentence Reading',
    sectionNumber: 3,
    question: 'Can you read short Arabic sentences?',
    options: [
      { label: 'Yes', value: 'yes', score: 4 },
      { label: 'Yes but slowly', value: 'yes_slowly', score: 3 },
      { label: 'Barely', value: 'barely', score: 2 },
      { label: 'No', value: 'no', score: 1 }
    ],
    required: true
  },

  // Section 4: Previous Learning Experience
  {
    id: 'q7',
    section: 'Previous Learning Experience',
    sectionNumber: 4,
    question: 'Have you completed any part of the Qaida before?',
    options: [
      { label: 'Yes, fully completed', value: 'fully_completed', score: 4 },
      { label: 'Completed half', value: 'half_completed', score: 3 },
      { label: 'Only studied basics', value: 'basics_only', score: 2 },
      { label: 'Never studied Qaida', value: 'never', score: 1 }
    ],
    required: true
  },
  {
    id: 'q8',
    section: 'Previous Learning Experience',
    sectionNumber: 4,
    question: 'Have you ever learned Quran reading (Nazra)?',
    options: [
      { label: 'Yes, I can read Quran', value: 'can_read', score: 4 },
      { label: 'I can read a little', value: 'read_little', score: 3 },
      { label: "I started but didn't complete", value: 'started_incomplete', score: 2 },
      { label: 'No', value: 'no', score: 1 }
    ],
    required: true
  },

  // Section 5: Audio & Speaking Comfort
  {
    id: 'q9',
    section: 'Audio & Speaking Comfort',
    sectionNumber: 5,
    question: 'Are you comfortable speaking Arabic letters out loud for practice?',
    options: [
      { label: 'Yes', value: 'yes', score: 4 },
      { label: 'Yes but shy', value: 'yes_shy', score: 3 },
      { label: 'Not really', value: 'not_really', score: 2 },
      { label: 'No', value: 'no', score: 1 }
    ],
    required: true
  },
  {
    id: 'q10',
    section: 'Audio & Speaking Comfort',
    sectionNumber: 5,
    question: 'Do you have a quiet environment to record pronunciation lessons?',
    options: [
      { label: 'Yes', value: 'yes', score: 4 },
      { label: 'Sometimes', value: 'sometimes', score: 3 },
      { label: 'Rarely', value: 'rarely', score: 2 },
      { label: 'No', value: 'no', score: 1 }
    ],
    required: true
  },

  // Optional Questions
  {
    id: 'q11',
    section: 'Optional',
    sectionNumber: 6,
    question: 'What is your main goal?',
    options: [
      { label: 'Learn Quran reading', value: 'quran_reading' },
      { label: 'Improve pronunciation', value: 'improve_pronunciation' },
      { label: 'Learn basic Arabic alphabet', value: 'basic_alphabet' },
      { label: 'Improve fluency', value: 'improve_fluency' },
      { label: 'Other', value: 'other' }
    ],
    required: false,
    allowOther: true
  },
  {
    id: 'q12',
    section: 'Optional',
    sectionNumber: 6,
    question: 'What is your age range?',
    options: [
      { label: 'Under 10', value: 'under_10' },
      { label: '10–15', value: '10_15' },
      { label: '16–25', value: '16_25' },
      { label: '26–40', value: '26_40' },
      { label: '40+', value: '40_plus' }
    ],
    required: false
  }
];

// Function to calculate proficiency level based on scores
export const calculateProficiencyLevel = (answers) => {
  let totalScore = 0;
  let maxScore = 0;

  surveyQuestions.forEach((question) => {
    if (question.required && answers[question.id]) {
      const selectedOption = question.options.find(
        (opt) => opt.value === answers[question.id]
      );
      if (selectedOption && selectedOption.score) {
        totalScore += selectedOption.score;
        maxScore += Math.max(...question.options.map((opt) => opt.score || 0));
      }
    }
  });

  const percentage = (totalScore / maxScore) * 100;

  if (percentage >= 80) {
    return { level: 'Advanced', description: 'You have strong Arabic reading skills' };
  } else if (percentage >= 60) {
    return { level: 'Intermediate', description: 'You have moderate Arabic reading skills' };
  } else if (percentage >= 40) {
    return { level: 'Beginner', description: 'You have basic Arabic reading skills' };
  } else {
    return { level: 'Absolute Beginner', description: 'You are just starting your Arabic learning journey' };
  }
};

// Get unique sections
export const getSections = () => {
  const sections = [];
  surveyQuestions.forEach((question) => {
    if (!sections.find((s) => s.number === question.sectionNumber)) {
      sections.push({
        number: question.sectionNumber,
        name: question.section
      });
    }
  });
  return sections;
};
