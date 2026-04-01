const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Content = require('../src/models/Content');

const additionalDuas = [
  {
    type: 'Dua',
    name: 'Entering the Mosque',
    nameArabic: 'دعاء دخول المسجد',
    number: 9,
    category: 'Mosque',
    arabicText: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    transliteration: 'Allahumma-ftah li abwaba rahmatik',
    translation: 'O Allah, open for me the gates of Your mercy',
    difficulty: 'beginner',
    tags: ['mosque', 'masjid', 'daily'],
    isActive: true,
    order: 9
  },
  {
    type: 'Dua',
    name: 'Leaving the Mosque',
    nameArabic: 'دعاء الخروج من المسجد',
    number: 10,
    category: 'Mosque',
    arabicText: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    transliteration: 'Allahumma inni as-aluka min fadlik',
    translation: 'O Allah, I ask You from Your favor',
    difficulty: 'beginner',
    tags: ['mosque', 'masjid', 'daily'],
    isActive: true,
    order: 10
  },
  {
    type: 'Dua',
    name: 'Before Wudu',
    nameArabic: 'دعاء قبل الوضوء',
    number: 11,
    category: 'Prayer',
    arabicText: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillah',
    translation: 'In the name of Allah',
    difficulty: 'beginner',
    tags: ['wudu', 'purity', 'prayer'],
    isActive: true,
    order: 11
  },
  {
    type: 'Dua',
    name: 'After Wudu',
    nameArabic: 'دعاء بعد الوضوء',
    number: 12,
    category: 'Prayer',
    arabicText: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    transliteration: 'Ash-hadu alla ilaha illallah wahdahu la sharika lahu wa ash-hadu anna Muhammadan abduhu wa rasuluhu',
    translation: 'I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and Messenger',
    difficulty: 'intermediate',
    tags: ['wudu', 'shahada', 'prayer'],
    isActive: true,
    order: 12
  },
  {
    type: 'Dua',
    name: 'Entering the Toilet',
    nameArabic: 'دعاء دخول الخلاء',
    number: 13,
    category: 'Daily',
    arabicText: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
    transliteration: "Allahumma inni a'udhu bika minal khubuthi wal khaba'ith",
    translation: 'O Allah, I seek refuge in You from the male and female devils',
    difficulty: 'intermediate',
    tags: ['purity', 'protection', 'daily'],
    isActive: true,
    order: 13
  },
  {
    type: 'Dua',
    name: 'Leaving the Toilet',
    nameArabic: 'دعاء الخروج من الخلاء',
    number: 14,
    category: 'Daily',
    arabicText: 'غُفْرَانَكَ',
    transliteration: 'Ghufranak',
    translation: 'I ask for Your forgiveness',
    difficulty: 'beginner',
    tags: ['purity', 'daily'],
    isActive: true,
    order: 14
  },
  {
    type: 'Dua',
    name: 'Dua for Traveling',
    nameArabic: 'دعاء السفر',
    number: 15,
    category: 'Travel',
    arabicText: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
    transliteration: 'Subhan-alladhi sakhkhara lana hadha wa ma kunna lahu muqrineen wa inna ila rabbina lamunqaliboon',
    translation: 'Glory be to Him who has subjected this to us, and we could not have otherwise subdued it. And indeed, to our Lord we shall return',
    difficulty: 'advanced',
    tags: ['travel', 'protection', 'journey'],
    isActive: true,
    order: 15
  },
  {
    type: 'Dua',
    name: 'Dua for Parents',
    nameArabic: 'دعاء للوالدين',
    number: 16,
    category: 'Daily',
    arabicText: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    transliteration: 'Rabbi irhamhuma kama rabbayani sagheera',
    translation: 'My Lord, have mercy upon them as they brought me up [when I was] small',
    difficulty: 'beginner',
    tags: ['parents', 'family', 'mercy'],
    isActive: true,
    order: 16
  },
  {
    type: 'Dua',
    name: 'Dua for Knowledge',
    nameArabic: 'دعاء لزيادة العلم',
    number: 17,
    category: 'Daily',
    arabicText: 'رَّبِّ زِدْنِي عِلْمًا',
    transliteration: 'Rabbi zidni ilma',
    translation: 'My Lord, increase me in knowledge',
    difficulty: 'beginner',
    tags: ['knowledge', 'success', 'daily'],
    isActive: true,
    order: 17
  },
  {
    type: 'Dua',
    name: 'When Angry',
    nameArabic: 'عند الغضب',
    number: 18,
    category: 'Daily',
    arabicText: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
    transliteration: "A'udhu billahi minash-shaitanir-rajim",
    translation: 'I seek refuge in Allah from the rejected Shaitan',
    difficulty: 'beginner',
    tags: ['anger', 'protection', 'daily'],
    isActive: true,
    order: 18
  }
];

const seedDuas = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    for (const duaData of additionalDuas) {
      const existing = await Content.findOne({ 
        type: 'Dua', 
        number: duaData.number 
      });

      if (existing) {
        console.log(`Updating existing Dua: ${duaData.name}`);
        Object.assign(existing, duaData);
        await existing.save();
      } else {
        console.log(`Adding new Dua: ${duaData.name}`);
        await Content.create(duaData);
      }
    }

    console.log('✅ Successfully seeded additional Duas!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Duas:', error);
    process.exit(1);
  }
};

seedDuas();
