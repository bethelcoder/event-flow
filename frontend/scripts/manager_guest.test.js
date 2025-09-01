const { validateEmail } = require('./manager_guests');

test('valid email should return true', () => {
  expect(validateEmail('test@example.com')).toBe(true);
});

test('invalid email should return false', () => {
  expect(validateEmail('notanemail')).toBe(false);
});

test('empty string should return false', () => {
  expect(validateEmail('')).toBe(false);
});
