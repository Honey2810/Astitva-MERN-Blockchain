import BirthCertificate from '../models/BirthCertificate.js';
import { mineBlock } from '../services/blockchainService.js';
import { hashBirthData } from '../utils/hashUtils.js';

/**
 * @desc    Issue a new birth certificate & write to blockchain ledger
 * @route   POST /api/certificates/birth
 * @access  Private (Registrar)
 */
export const createBirthCertificate = async (req, res, next) => {
  const { childName, gender, dob, placeOfBirth, fatherName, motherName } = req.body;

  try {
    // 1. Basic validation
    if (!childName || !gender || !dob || !placeOfBirth || !fatherName || !motherName) {
      res.status(400);
      throw new Error('Please fill in all birth certificate fields');
    }

    // 2. Generate a unique certificate identifier
    const datePart = new Date(dob).toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const certificateId = `BC-${datePart}-${randPart}`;

    // 3. Compute certificate hash signature
    const certificateHash = hashBirthData({
      certificateId,
      childName,
      gender,
      dob,
      placeOfBirth,
      fatherName,
      motherName,
    });

    // 4. Prevent duplicate database submissions
    const hashExists = await BirthCertificate.findOne({ certificateHash });
    if (hashExists) {
      res.status(400);
      throw new Error('This certificate signature has already been issued in the registry');
    }

    // 5. Secure block mining on blockchain ledger (mineBlock)
    const block = await mineBlock(certificateHash, 'birth');

    // 6. Save certificate record to database linked to the block index
    const certificate = await BirthCertificate.create({
      certificateId,
      childName,
      gender,
      dob,
      placeOfBirth,
      fatherName,
      motherName,
      registrar: req.user._id, // Secured registrar id from protect middleware
      certificateHash,
      blockIndex: block.index,
    });

    res.status(201).json({
      success: true,
      message: 'Birth Certificate issued successfully and added to blockchain ledger',
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
 * @desc    Get all birth certificates issued
 * @route   GET /api/certificates/birth
 * @access  Private
 */
export const getBirthCertificates = async (req, res, next) => {
  try {
    const certificates = await BirthCertificate.find()
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
