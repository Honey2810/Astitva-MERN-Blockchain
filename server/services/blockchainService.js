import crypto from 'crypto';
import Block from '../models/Block.js';

// Difficulty defines number of leading zeros required in mined hashes
const DIFFICULTY = 2; 
const TARGET = '0'.repeat(DIFFICULTY);

/**
 * Calculates SHA256 cryptographic hash of a block's inputs
 */
export const calculateHash = (index, previousHash, timestamp, certificateHash, certificateType, nonce) => {
  const data = `${index}${previousHash}${timestamp}${certificateHash}${certificateType}${nonce}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Helper to retrieve the latest block on the chain
 */
export const getLatestBlock = async () => {
  return await Block.findOne().sort({ index: -1 });
};

/**
 * Creates and mines the Genesis block (index 0) if it doesn't already exist
 */
export const initializeGenesisBlock = async () => {
  const latestBlock = await getLatestBlock();
  if (latestBlock) return latestBlock; // Already initialized

  console.log('🌱 Generating Genesis Block...');
  
  const index = 0;
  const previousHash = '0';
  const certificateHash = 'genesis_ledger_hash';
  const certificateType = 'genesis';
  const timestamp = new Date('2026-01-01T00:00:00Z'); // Fixed timestamp for reproducibility
  
  let nonce = 0;
  let hash = '';
  
  // Mining loop (Proof of Work)
  while (true) {
    hash = calculateHash(index, previousHash, timestamp, certificateHash, certificateType, nonce);
    if (hash.substring(0, DIFFICULTY) === TARGET) {
      break;
    }
    nonce++;
  }

  const genesisBlock = await Block.create({
    index,
    timestamp,
    previousHash,
    hash,
    nonce,
    certificateHash,
    certificateType,
  });

  console.log(`✅ Genesis Block Created! Hash: ${genesisBlock.hash}`);
  return genesisBlock;
};

/**
 * Mines and commits a new block containing a certificate hash to the ledger
 * @param {string} certificateHash - The SHA256 hash of the issued certificate
 * @param {string} certificateType - Type of certificate ('birth' | 'death')
 * @returns {Promise<Object>} The saved block document
 */
export const mineBlock = async (certificateHash, certificateType) => {
  // Ensure genesis block is initialized first
  await initializeGenesisBlock();

  const latestBlock = await getLatestBlock();
  const index = latestBlock.index + 1;
  const previousHash = latestBlock.hash;
  const timestamp = new Date();
  
  let nonce = 0;
  let hash = '';

  console.log(`⛏️ Mining block ${index} for certificate hash ${certificateHash.substring(0, 10)}...`);
  
  // Proof of work algorithm
  while (true) {
    hash = calculateHash(index, previousHash, timestamp, certificateHash, certificateType, nonce);
    if (hash.substring(0, DIFFICULTY) === TARGET) {
      break;
    }
    nonce++;
  }

  const newBlock = await Block.create({
    index,
    timestamp,
    previousHash,
    hash,
    nonce,
    certificateHash,
    certificateType,
  });

  console.log(`🏁 Block ${index} mined successfully in ${nonce} iterations. Hash: ${newBlock.hash}`);
  return newBlock;
};

/**
 * Validates the cryptographic integrity of the entire blockchain
 * @returns {Promise<Object>} Status object { isValid: boolean, errorBlockIndex?: number }
 */
export const verifyBlockchainIntegrity = async () => {
  const blocks = await Block.find().sort({ index: 1 });

  if (blocks.length === 0) {
    return { isValid: true }; // Empty chain is technically valid or unitialized
  }

  // 1. Verify genesis block inputs specifically
  const genesis = blocks[0];
  if (genesis.index !== 0 || genesis.previousHash !== '0') {
    return { isValid: false, reason: 'Genesis block is corrupted', errorBlockIndex: 0 };
  }

  // 2. Iterate and verify block sequence links
  for (let i = 1; i < blocks.length; i++) {
    const current = blocks[i];
    const previous = blocks[i - 1];

    // Check if the previous hash link matches
    if (current.previousHash !== previous.hash) {
      return { 
        isValid: false, 
        reason: `Previous hash mismatch at block index ${current.index}`, 
        errorBlockIndex: current.index 
      };
    }

    // Recalculate block hash to check for tamper attempts
    const recalculatedHash = calculateHash(
      current.index,
      current.previousHash,
      current.timestamp,
      current.certificateHash,
      current.certificateType,
      current.nonce
    );

    if (current.hash !== recalculatedHash) {
      return { 
        isValid: false, 
        reason: `Hash corruption detected at block index ${current.index}`, 
        errorBlockIndex: current.index 
      };
    }

    // Verify proof of work difficulty constraint is met
    if (current.hash.substring(0, DIFFICULTY) !== TARGET) {
      return { 
        isValid: false, 
        reason: `Proof of Work constraint not met at block index ${current.index}`, 
        errorBlockIndex: current.index 
      };
    }
  }

  return { isValid: true };
};
