import mongoose from 'mongoose';

const deathCertificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    deceasedName: {
      type: String,
      required: [true, 'Deceased name is required'],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Other'],
    },
    dateOfDeath: {
      type: Date,
      required: [true, 'Date of death is required'],
    },
    placeOfDeath: {
      type: String,
      required: [true, 'Place of death is required'],
      trim: true,
    },
    causeOfDeath: {
      type: String,
      trim: true,
      default: 'Natural Causes',
    },
    age: {
      type: Number,
      required: [true, 'Age of deceased is required'],
      min: [0, 'Age cannot be negative'],
    },
    relativeName: {
      type: String,
      required: [true, "Relative/Informant name is required"],
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

const DeathCertificate = mongoose.model('DeathCertificate', deathCertificateSchema);

export default DeathCertificate;
