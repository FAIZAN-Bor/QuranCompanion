const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['child', 'parent', 'admin'],
    default: 'child',
    required: true
  },
  profileImage: {
    type: String,
    default: null
  },
  coins: {
    type: Number,
    default: 0,
    min: 0
  },
  proficiencyLevel: {
    type: String,
    enum: ['Absolute Beginner', 'Beginner', 'Elementary', 'Intermediate', 'Advanced'],
    default: 'Absolute Beginner'
  },
  currentLevel: {
    type: String,
    default: 'qaida_1' // References progressMapData
  },
  totalLessonsCompleted: {
    type: Number,
    default: 0
  },
  totalQuizzesCompleted: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  streakDays: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date,
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  notificationSettings: {
    dailyReminder: {
      type: Boolean,
      default: true
    },
    achievements: {
      type: Boolean,
      default: true
    },
    parentReports: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  };
  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function(inputOtp) {
  console.log('Verifying OTP:', { 
    stored: this.otp?.code, 
    input: inputOtp, 
    match: this.otp?.code === inputOtp,
    inputType: typeof inputOtp,
    storedType: typeof this.otp?.code
  });
  
  if (!this.otp || !this.otp.code) {
    console.log('No OTP stored');
    return false;
  }
  
  if (new Date() > this.otp.expiresAt) {
    console.log('OTP expired');
    return false;
  }
  
  // Ensure both are strings and trimmed
  const storedOtp = String(this.otp.code).trim();
  const providedOtp = String(inputOtp).trim();
  
  return storedOtp === providedOtp;
};

// Update streak on login
userSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!this.lastActiveDate) {
    this.streakDays = 1;
  } else {
    const lastActive = new Date(this.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);
    
    const diffTime = today - lastActive;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Continue streak
      this.streakDays += 1;
    } else if (diffDays > 1) {
      // Reset streak
      this.streakDays = 1;
    }
    // If diffDays === 0, same day, no change
  }
  
  this.lastActiveDate = new Date();
};

module.exports = mongoose.model('User', userSchema);
