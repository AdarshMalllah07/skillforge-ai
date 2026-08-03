import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './lib/authContext';
import { api } from './lib/api';
import Navbar, { AppTab } from './components/Navbar';
import Footer from './components/Footer';
import CourseCatalog from './components/CourseCatalog';
import CourseDetailView from './components/CourseDetailView';
import SubmissionPortal from './components/SubmissionPortal';
import AICurriculumGenerator from './components/AICurriculumGenerator';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AdminUserManagement from './components/AdminUserManagement';
import StudentDashboard from './components/StudentDashboard';
import InstructorDashboard from './components/InstructorDashboard';
import EvaluatorDashboard from './components/EvaluatorDashboard';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import { Course, Submission, Assignment, UserRole } from './types';

const AUTH_TABS: AppTab[] = ['login', 'signup', 'forgot_password'];

const ROLE_HOME: Record<UserRole, AppTab> = {
  ADMIN: 'admin_users',
  INSTRUCTOR: 'instructor_dashboard',
  STUDENT: 'student_dashboard',
  EVALUATOR: 'evaluator_dashboard',
};

function canAccessTab(tab: AppTab, role: UserRole | undefined, authenticated: boolean): boolean {
  if (AUTH_TABS.includes(tab)) return true;
  if (!authenticated || !role) return false;

  switch (tab) {
    case 'admin_users':
      return role === 'ADMIN';
    case 'student_dashboard':
      return role === 'STUDENT';
    case 'instructor_dashboard':
      return role === 'INSTRUCTOR';
    case 'evaluator_dashboard':
      return role === 'EVALUATOR';
    case 'generator':
      return role === 'ADMIN' || role === 'INSTRUCTOR' || role === 'EVALUATOR';
    case 'courses':
    case 'submissions':
    case 'analytics':
      return true;
    default:
      return false;
  }
}

function AppContent() {
  const { currentUser, isAuthenticated, isLoading, token } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const [activeTab, setActiveTab] = useState<AppTab>('login');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeSubmissionAssignment, setActiveSubmissionAssignment] = useState<{
    assignment: Assignment;
    course: Course;
  } | null>(null);

  const navigateToTab = useCallback(
    (tab: AppTab) => {
      if (!canAccessTab(tab, currentUser?.role, isAuthenticated)) {
        if (!isAuthenticated) {
          setActiveTab('login');
          return;
        }
        setActiveTab(ROLE_HOME[currentUser!.role]);
        return;
      }
      setActiveTab(tab);
      setSelectedCourse(null);
      setActiveSubmissionAssignment(null);
    },
    [currentUser, isAuthenticated]
  );

  // After auth loads, send user to role home or login
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      if (!AUTH_TABS.includes(activeTab)) {
        setActiveTab('login');
      }
      return;
    }
    if (AUTH_TABS.includes(activeTab) || !canAccessTab(activeTab, currentUser?.role, true)) {
      setActiveTab(ROLE_HOME[currentUser!.role]);
    }
  }, [isLoading, isAuthenticated, currentUser]);

  // Fetch data when authenticated
  useEffect(() => {
    if (!isAuthenticated || !token) {
      setCourses([]);
      setSubmissions([]);
      return;
    }

    api<Course[]>('/api/courses')
      .then((data) => {
        if (Array.isArray(data)) setCourses(data);
      })
      .catch((e) => console.log('Failed to load courses', e));

    api<Submission[]>('/api/submissions')
      .then((data) => {
        if (Array.isArray(data)) setSubmissions(data);
      })
      .catch((e) => console.log('Failed to load submissions', e));
  }, [isAuthenticated, token, currentUser?.id]);

  const handleCreateCourse = async (courseData: Partial<Course>) => {
    try {
      const newCourse = await api<Course>('/api/courses', {
        method: 'POST',
        body: JSON.stringify(courseData),
      });
      setCourses((prev) => [newCourse, ...prev]);
    } catch (err) {
      console.error('Create course error', err);
      alert(err instanceof Error ? err.message : 'Failed to create course');
    }
  };

  const handleUpdateCourse = async (id: string, updatedFields: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c)));
    if (selectedCourse && selectedCourse.id === id) {
      setSelectedCourse((prev) => (prev ? { ...prev, ...updatedFields } : null));
    }

    try {
      await api(`/api/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedFields),
      });
    } catch (err) {
      console.error('Update course error', err);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    if (selectedCourse && selectedCourse.id === id) {
      setSelectedCourse(null);
    }

    try {
      await api(`/api/courses/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Delete course error', err);
    }
  };

  const handleCreateAssignment = async (courseId: string, assignmentData: Partial<Assignment>) => {
    try {
      const newAssign = await api<Assignment>(`/api/courses/${courseId}/assignments`, {
        method: 'POST',
        body: JSON.stringify(assignmentData),
      });

      setCourses((prev) =>
        prev.map((c) => {
          if (c.id === courseId) {
            const updated = { ...c, assignments: [...c.assignments, newAssign] };
            if (selectedCourse && selectedCourse.id === courseId) {
              setSelectedCourse(updated);
            }
            return updated;
          }
          return c;
        })
      );
    } catch (err) {
      console.error('Create assignment error', err);
    }
  };

  const handleSubmissionSuccess = (newSubmission: Submission) => {
    setSubmissions((prev) => [newSubmission, ...prev.filter((s) => s.id !== newSubmission.id)]);
  };

  const handleUpdateSubmissionGrade = async (
    submissionId: string,
    grade: number,
    feedback: string
  ) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === submissionId) {
          return {
            ...s,
            finalScore: grade,
            instructorFeedback: feedback,
            status: 'GRADED',
          };
        }
        return s;
      })
    );

    try {
      await api(`/api/submissions/${submissionId}`, {
        method: 'PUT',
        body: JSON.stringify({
          finalScore: grade,
          instructorFeedback: feedback,
          status: 'GRADED',
        }),
      });
    } catch (err) {
      console.error('Grade update error', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 text-sm font-medium">
        Loading EdTech Matrix…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased">
      <Navbar activeTab={activeTab} setActiveTab={navigateToTab} />

      <main className="flex-1 w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {activeTab === 'login' ? (
          <LoginPage
            onNavigateToSignup={() => navigateToTab('signup')}
            onNavigateToForgotPassword={() => navigateToTab('forgot_password')}
            onLoginSuccess={() => {
              /* useEffect routes to ROLE_HOME once session is set */
            }}
          />
        ) : activeTab === 'signup' ? (
          <SignupPage
            onNavigateToLogin={() => navigateToTab('login')}
            onSignupSuccess={() => {
              /* useEffect routes STUDENT to student_dashboard */
            }}
          />
        ) : activeTab === 'forgot_password' ? (
          <ForgotPasswordPage onNavigateToLogin={() => navigateToTab('login')} />
        ) : !isAuthenticated ? (
          <LoginPage
            onNavigateToSignup={() => navigateToTab('signup')}
            onNavigateToForgotPassword={() => navigateToTab('forgot_password')}
            onLoginSuccess={() => {}}
          />
        ) : activeTab === 'admin_users' && currentUser?.role === 'ADMIN' ? (
          <AdminUserManagement
            onViewUserCurriculums={() => navigateToTab('courses')}
            onViewUserSubmissions={() => navigateToTab('submissions')}
          />
        ) : activeTab === 'student_dashboard' && currentUser?.role === 'STUDENT' ? (
          <StudentDashboard
            courses={courses}
            submissions={submissions}
            onSelectCourse={(course) => setSelectedCourse(course)}
            onSubmitAssignment={(assignment, course) => {
              setActiveSubmissionAssignment({ assignment, course });
            }}
          />
        ) : activeTab === 'instructor_dashboard' && currentUser?.role === 'INSTRUCTOR' ? (
          <InstructorDashboard
            courses={courses}
            submissions={submissions}
            onSelectCourse={(course) => setSelectedCourse(course)}
            onOpenAIGenerator={() => navigateToTab('generator')}
            onOpenSubmissions={() => navigateToTab('submissions')}
          />
        ) : activeTab === 'evaluator_dashboard' && currentUser?.role === 'EVALUATOR' ? (
          <EvaluatorDashboard
            submissions={submissions}
            onUpdateSubmissionGrade={handleUpdateSubmissionGrade}
          />
        ) : activeSubmissionAssignment ? (
          <SubmissionPortal
            assignment={activeSubmissionAssignment.assignment}
            course={activeSubmissionAssignment.course}
            onBack={() => setActiveSubmissionAssignment(null)}
            onSubmissionSuccess={(sub) => {
              handleSubmissionSuccess(sub);
            }}
          />
        ) : selectedCourse ? (
          <CourseDetailView
            course={selectedCourse}
            onBack={() => setSelectedCourse(null)}
            onOpenSubmissionPortal={(assign, crs) => {
              setActiveSubmissionAssignment({ assignment: assign, course: crs });
            }}
            onCreateAssignment={handleCreateAssignment}
          />
        ) : activeTab === 'courses' ? (
          <CourseCatalog
            courses={courses}
            onSelectCourse={(course) => setSelectedCourse(course)}
            onCreateCourse={handleCreateCourse}
            onUpdateCourse={handleUpdateCourse}
            onDeleteCourse={handleDeleteCourse}
            onOpenAIGenerator={() => navigateToTab('generator')}
          />
        ) : activeTab === 'generator' &&
          currentUser &&
          ['ADMIN', 'INSTRUCTOR', 'EVALUATOR'].includes(currentUser.role) ? (
          <AICurriculumGenerator
            onCourseGeneratedAndSaved={async (newCourse) => {
              try {
                const saved = await api<Course>('/api/courses', {
                  method: 'POST',
                  body: JSON.stringify(newCourse),
                });
                setCourses((prev) => [saved, ...prev]);
                setSelectedCourse(saved);
                navigateToTab('courses');
              } catch (err) {
                console.error(err);
                setCourses((prev) => [newCourse, ...prev]);
                setSelectedCourse(newCourse);
                navigateToTab('courses');
              }
            }}
            onCancel={() => navigateToTab('courses')}
          />
        ) : activeTab === 'analytics' || activeTab === 'submissions' ? (
          <AnalyticsDashboard
            submissions={submissions}
            courses={courses}
            onReviewSubmission={(sub) => {
              const matchedCourse = courses.find((c) => c.id === sub.courseId) || courses[0];
              if (!matchedCourse) return;
              const matchedAssign =
                matchedCourse.assignments.find((a) => a.id === sub.assignmentId) ||
                matchedCourse.assignments[0];
              if (matchedAssign) {
                setActiveSubmissionAssignment({ assignment: matchedAssign, course: matchedCourse });
              }
            }}
          />
        ) : null}
      </main>

      <AuthModal />
      <UserProfileModal />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
