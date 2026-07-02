import Block from '../models/Block.js';
import BirthCertificate from '../models/BirthCertificate.js';
import DeathCertificate from '../models/DeathCertificate.js';
import { verifyBlockchainIntegrity } from '../services/blockchainService.js';

/**
 * @desc    Verify a certificate's authenticity by its SHA-256 hash signature
 * @route   GET /api/verify/:hash
 * @access  Public
 */
export const verifyCertificate = async (req, res, next) => {
  const { hash } = req.params;

  try {
    // 1. Audit check: Find matching block in the ledger
    const block = await Block.findOne({ certificateHash: hash });
    if (!block) {
      return res.status(200).json({
        success: true,
        isValid: false,
        message: 'Cryptographic signature not found in the blockchain ledger. Certificate is invalid or forged.',
      });
    }

    // 2. Metadata check: Find actual certificate document details
    let certificate = null;
    let type = '';

    if (block.certificateType === 'birth') {
      certificate = await BirthCertificate.findOne({ certificateHash: hash }).populate('registrar', 'name email');
      type = 'Birth Certificate';
    } else if (block.certificateType === 'death') {
      certificate = await DeathCertificate.findOne({ certificateHash: hash }).populate('registrar', 'name email');
      type = 'Death Certificate';
    }

    if (!certificate) {
      return res.status(200).json({
        success: true,
        isValid: false,
        message: 'Block recorded on ledger, but matching certificate metadata is missing from database (possible desync).',
        block,
      });
    }

    // 3. Chain Integrity Check: Verify if any blocks have been tampered with
    const integrity = await verifyBlockchainIntegrity();
    if (!integrity.isValid) {
      return res.status(200).json({
        success: true,
        isValid: false,
        message: `ALERT: Tampering detected in the blockchain sequence! Integrity check failed: ${integrity.reason}.`,
        compromised: true,
        block,
        certificate,
      });
    }

    // 4. Success: Certificate is fully authentic and verifiable
    res.status(200).json({
      success: true,
      isValid: true,
      message: 'Certificate successfully verified! Cryptographic signature matches immutable block ledger.',
      data: {
        certificateType: type,
        certificate,
        block: {
          index: block.index,
          timestamp: block.timestamp,
          hash: block.hash,
          previousHash: block.previousHash,
          nonce: block.nonce,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch system statistics (totals and blockchain health)
 * @route   GET /api/stats
 * @access  Public
 */
export const getSystemStats = async (req, res, next) => {
  try {
    const birthCount = await BirthCertificate.countDocuments();
    const deathCount = await DeathCertificate.countDocuments();
    const blockCount = await Block.countDocuments();

    // Verify blockchain health dynamically
    const integrity = await verifyBlockchainIntegrity();

    res.status(200).json({
      success: true,
      data: {
        births: birthCount,
        deaths: deathCount,
        blocks: blockCount,
        blockchainHealthy: integrity.isValid,
        integrityReason: integrity.isValid ? 'Ledger is completely sound' : integrity.reason,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch recent blockchain blocks list (latest 10 blocks)
 * @route   GET /api/certificates/blocks
 * @access  Public
 */
export const getBlocks = async (req, res, next) => {
  try {
    const blocks = await Block.find().sort({ index: -1 }).limit(10);
    res.status(200).json({
      success: true,
      data: blocks,
    });
  } catch (error) {
    next(error);
  }
};

