const mongoose = require('mongoose');
const User = require('../models/User');
const devStore = require('./devStore');

async function resolveUser(authUser) {
  const { userId, phone } = authUser;

  if (devStore.isEnabled()) {
    return devStore.ensureUser(userId, phone);
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return null;
  }

  return User.findById(userId);
}

module.exports = { resolveUser };
