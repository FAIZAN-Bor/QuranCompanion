const mongoose = require('mongoose');

const parentChildSchema = new mongoose.Schema({
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relationshipType: {
    type: String,
    enum: ['parent', 'guardian', 'teacher'],
    default: 'parent'
  },
  linkCode: {
    type: String,
    unique: true,
    sparse: true
    // Code generated for child to link to parent
  },
  linkCodeExpiresAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive'],
    default: 'pending'
  },
  permissions: {
    viewProgress: {
      type: Boolean,
      default: true
    },
    viewQuizResults: {
      type: Boolean,
      default: true
    },
    viewMistakes: {
      type: Boolean,
      default: true
    },
    receiveReports: {
      type: Boolean,
      default: true
    }
  },
  linkedAt: {
    type: Date,
    default: null
  },
  deactivatedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to ensure unique parent-child pairs
parentChildSchema.index({ parent: 1, child: 1 }, { unique: true });
parentChildSchema.index({ parent: 1, status: 1 });
parentChildSchema.index({ child: 1, status: 1 });

// Generate unique link code
parentChildSchema.methods.generateLinkCode = function() {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  this.linkCode = code;
  this.linkCodeExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  return code;
};

// Verify link code
parentChildSchema.statics.verifyLinkCode = async function(code) {
  const link = await this.findOne({ 
    linkCode: code,
    status: 'pending',
    linkCodeExpiresAt: { $gt: new Date() }
  });
  return link;
};

// Activate relationship
parentChildSchema.methods.activate = function() {
  this.status = 'active';
  this.linkedAt = new Date();
  this.linkCode = undefined;
  this.linkCodeExpiresAt = undefined;
};

module.exports = mongoose.model('ParentChild', parentChildSchema);
