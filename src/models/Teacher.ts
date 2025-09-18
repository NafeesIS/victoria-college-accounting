import mongoose from 'mongoose';

const TeacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
  },
  bcsBatch: {
    type: String,
    required: [true, 'BCS Batch is required'],
    trim: true,
  },
  idNumber: {
    type: String,
    required: [true, 'ID Number is required'],
    unique: true,
    trim: true,
  },
  nidNumber: {
    type: String,
    required: [true, 'NID Number is required'],
    unique: true,
    trim: true,
  },
  eTin: {
    type: String,
    required: [true, 'E-TIN is required'],
    unique: true,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);