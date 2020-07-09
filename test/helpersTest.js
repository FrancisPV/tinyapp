const { assert } = require('chai');

const { findUserByEmail } = require('../helper.js');

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', () => {
  it('should return a user with valid email', () => {
    const actual = findUserByEmail("user@example.com", users);
    const expected = "user@example.com";
    assert(actual.email === expected);
  });
});

describe('findUserByEmail', () => {
  it('should return undefined if the email doesn\'t exist', () => {
    const actual = findUserByEmail("Whatever", users);
    const expected = undefined;
    assert(actual === expected);
  });
});
