import mongoose from 'mongoose';

const birthCertificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    childName: {
      type: String,
      required: [true, 'Child name is required'],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Other'],
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    placeOfBirth: {
      type: String,
      required: [true, 'Place of birth is required'],
      trim: true,
    },
    fatherName: {
      type: String,
      required: [true, "Father's name is required"],
      trim: true,
    },
    motherName: {
      type: String,
      required: [true, "Mother's name is required"],
      trim: true,
    },
    registrar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    certificateHash: {
      type: String,
      required: true,
      unique: true,
    },
    blockIndex: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const BirthCertificate = mongoose.model('BirthCertificate', birthCertificateSchema);

export default BirthCertificate;
