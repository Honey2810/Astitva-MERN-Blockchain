import DeathCertificate from '../models/DeathCertificate.js';
import { mineBlock } from '../services/blockchainService.js';
import { hashDeathData } from '../utils/hashUtils.js';

/**
 * @desc    Issue a new death certificate & write to blockchain ledger
 * @route   POST /api/certificates/death
 * @access  Private (Registrar)
 */
export const createDeathCertificate = async (req, res, next) => {
  const { deceasedName, gender, dateOfDeath, placeOfDeath, causeOfDeath, age, relativeName } = req.body;

  try {
    // 1. Basic validation
    if (!deceasedName || !gender || !dateOfDeath || !placeOfDeath || !age || !relativeName) {
      res.status(400);
      throw new Error('Please fill in all required death certificate fields');
    }

    // 2. Generate a unique certificate identifier
    const datePart = new Date(dateOfDeath).toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const certificateId = `DC-${datePart}-${randPart}`;

    // 3. Compute certificate hash signature
    const certificateHash = hashDeathData({
      certificateId,
      deceasedName,
      gender,
      dateOfDeath,
      placeOfDeath,
      causeOfDeath: causeOfDeath || 'Natural Causes',
      age,
      relativeName,
    });

    // 4. Prevent duplicate database submissions
    const hashExists = await DeathCertificate.findOne({ certificateHash });
    if (hashExists) {
      res.status(400);
      throw new Error('This certificate signature has already been issued in the registry');
    }

    // 5. Secure block mining on blockchain ledger (mineBlock)
    const block = await mineBlock(certificateHash, 'death');

    // 6. Save certificate record to database linked to the block index
    const certificate = await DeathCertificate.create({
      certificateId,
      deceasedName,
      gender,
      dateOfDeath,
      placeOfDeath,
      causeOfDeath: causeOfDeath || 'Natural Causes',
      age,
      relativeName,
      registrar: req.user._id, // Secured registrar id from protect middleware
      certificateHash,
      blockIndex: block.index,
    });

    res.status(201).json({
      success: true,
      message: 'Death Certificate issued successfully and added to blockchain ledger',
      data: {
        certificate,
        blockHash: block.hash,
        blockNonce: block.nonce,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all death certificates issued
 * @route   GET /api/certificates/death
 * @access  Private
 */
export const getDeathCertificates = async (req, res, next) => {
  try {
    const certificates = await DeathCertificate.find()
      .populate('registrar', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    next(error);
  }
};
