import mongoose, { Schema } from 'mongoose';

const candidateSchema = new Schema(
  {
    name: String,
    email: String,
    githubProfile: String,
    linkedInProfile: String,
    portfolioWebsite: String,
    assignmentTitle: String,
    companyName: String,
    submissionDate: String,
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const Candidate = mongoose.model('Candidate', candidateSchema);
