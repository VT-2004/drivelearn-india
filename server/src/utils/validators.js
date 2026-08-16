const dns = require('dns').promises;

// Password strength: min 8 chars, at least one uppercase, one lowercase,
// one number, and one special character
const isPasswordStrong = (password) => {
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return strongRegex.test(password);
};

const passwordStrengthMessage =
  'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.';

// Real-time email domain check - confirms the domain has valid mail servers (MX records).
// This catches typos and fake/nonexistent domains (e.g. asdf@notarealdomain123.com),
// though it can't confirm the specific mailbox exists (that would need SMTP probing,
// which is unreliable and often blocked by mail providers).
const isEmailDomainValid = async (email) => {
  try {
    const domain = email.split('@')[1];
    if (!domain) return false;
    const records = await dns.resolveMx(domain);
    return records && records.length > 0;
  } catch (error) {
    // No MX records found, or domain doesn't resolve at all
    return false;
  }
};

module.exports = { isPasswordStrong, passwordStrengthMessage, isEmailDomainValid };