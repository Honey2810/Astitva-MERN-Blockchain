import crypto from 'crypto';

/**
 * Generates a SHA-256 hash of birth certificate properties
 */
export const hashBirthData = (cert) => {
  const payload = `${cert.certificateId}${cert.childName}${cert.gender}${new Date(cert.dob).toISOString()}${cert.placeOfBirth}${cert.fatherName}${cert.motherName}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
};

/**
 * Generates a SHA-256 hash of death certificate properties
 */
export const hashDeathData = (cert) => {
  const payload = `${cert.certificateId}${cert.deceasedName}${cert.gender}${new Date(cert.dateOfDeath).toISOString()}${cert.placeOfDeath}${cert.causeOfDeath}${cert.age}${cert.relativeName}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
};
