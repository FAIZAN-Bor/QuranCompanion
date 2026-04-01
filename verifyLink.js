const mongoose = require('mongoose');
const User = require('./backend/src/models/User');
const ParentChild = require('./backend/src/models/ParentChild');

async function checkAndLink() {
  try {
    await mongoose.connect('mongodb://localhost:27017/quranCompanion');
    console.log('Connected to DB');

    const parent = await User.findOne({ email: 'testerparent@test.com' });
    const child = await User.findOne({ email: 'newtester@test.com' });

    console.log('Parent found:', !!parent);
    console.log('Child found:', !!child);

    if (parent && child) {
      const link = await ParentChild.findOne({ parent: parent._id, child: child._id });
      if (link) {
        console.log('Link exists! Status:', link.status);
        if (link.status !== 'active') {
          link.status = 'active';
          await link.save();
          console.log('Link activated manually.');
        }
      } else {
        await ParentChild.create({
          parent: parent._id,
          child: child._id,
          status: 'active'
        });
        console.log('Link created and activated manually.');
      }
    } else if (!parent) {
      console.log('Parent does not exist. Please create first.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

checkAndLink();
