import React, { useState } from 'react';
import { Github, Linkedin, UserCheck, Code2, Award, Sparkles, ExternalLink, ShieldAlert } from 'lucide-react';
import { useAuth } from '../lib/authContext';
import CandidateModal from './CandidateModal';

export default function Footer() {
  const { candidateInfo } = useAuth();
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);

  return (
    <footer className="mt-20 border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Column 1: Organization & App Details */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                E
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                House of EdTech <span className="text-indigo-400 font-medium text-sm ml-1">Matrix Platform</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              An intelligent Next.js 16 architecture showcasing AI-powered curriculum generation, student submission grading with Gemini 3.6 Flash, role-based authorization, and interactive assessment analytics.
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                Next.js 16 Concept Full-Stack Engine
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                <Sparkles className="w-3 h-3 mr-1 text-indigo-400" />
                Gemini 3.6 Flash AI
              </span>
            </div>
          </div>

          {/* Column 2: Candidate Submission Info (REQUIRED BY ASSIGNMENT) */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidate Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-slate-200 font-medium">
                <UserCheck className="w-4 h-4 mr-2 text-indigo-400" />
                {candidateInfo.name}
              </div>
              <p className="text-xs text-slate-400">{candidateInfo.assignmentTitle}</p>
              <button
                onClick={() => setIsCandidateModalOpen(true)}
                className="mt-2 inline-flex items-center text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                <Code2 className="w-3.5 h-3.5 mr-1" />
                View Full Assignment Architecture Specs &rarr;
              </button>
            </div>
          </div>

          {/* Column 3: Mandatory Links & Profile Connections */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Social & Repository</h4>
            <div className="space-y-2">
              <a
                href={candidateInfo.githubProfile}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-slate-300 hover:text-white transition-colors group"
              >
                <Github className="w-4 h-4 mr-2 text-slate-400 group-hover:text-white transition-colors" />
                GitHub Profile
                <ExternalLink className="w-3 h-3 ml-1.5 opacity-60 group-hover:opacity-100" />
              </a>

              <a
                href={candidateInfo.linkedInProfile}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-slate-300 hover:text-blue-400 transition-colors group"
              >
                <Linkedin className="w-4 h-4 mr-2 text-slate-400 group-hover:text-blue-400 transition-colors" />
                LinkedIn Profile
                <ExternalLink className="w-3 h-3 ml-1.5 opacity-60 group-hover:opacity-100" />
              </a>

              {candidateInfo.portfolioWebsite && (
                <a
                  href={candidateInfo.portfolioWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-slate-300 hover:text-emerald-400 transition-colors group"
                >
                  <Award className="w-4 h-4 mr-2 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  Portfolio Website
                  <ExternalLink className="w-3 h-3 ml-1.5 opacity-60 group-hover:opacity-100" />
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>
            Submitted for <span className="font-semibold text-slate-200">House of EdTech</span> Fullstack Developer Evaluation (Jan 2026).
          </p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span>Built with React 19, Express, & Tailwind CSS</span>
            <span>&bull;</span>
            <button 
              onClick={() => setIsCandidateModalOpen(true)}
              className="text-indigo-400 hover:underline"
            >
              Candidate Submission Footer
            </button>
          </div>
        </div>
      </div>

      {isCandidateModalOpen && (
        <CandidateModal onClose={() => setIsCandidateModalOpen(false)} />
      )}
    </footer>
  );
}
