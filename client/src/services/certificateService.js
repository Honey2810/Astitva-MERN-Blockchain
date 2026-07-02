import API from './api';

/**
 * Service methods coordinating certificate endpoints requests
 */
export const issueBirthCertificate = async (data) => {
  const response = await API.post('/certificates/birth', data);
  return response.data;
};

export const issueDeathCertificate = async (data) => {
  const response = await API.post('/certificates/death', data);
  return response.data;
};

export const getBirthCertificates = async () => {
  const response = await API.get('/certificates/birth');
  return response.data;
};

export const getDeathCertificates = async () => {
  const response = await API.get('/certificates/death');
  return response.data;
};

export const verifyCertificate = async (hash) => {
  const response = await API.get(`/certificates/verify/${hash}`);
  return response.data;
};

export const getSystemStats = async () => {
  const response = await API.get('/certificates/stats');
  return response.data;
};

export const getBlocks = async () => {
  const response = await API.get('/certificates/blocks');
  return response.data;
};

