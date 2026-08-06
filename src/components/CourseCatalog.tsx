'use client';
import React, { useState } from 'react';
import { Course, FilterOptions } from '../types';
import { useAuth } from '../lib/authContext';
import Select from './ui/Select';
import { 
  Plus, Search, Filter, Sparkles, BookOpen, Layers, Users, Star, 
  Trash2, Edit, ExternalLink, AlertCircle, ArrowRight, CheckCircle,
  SlidersHorizontal, RotateCcw, X
} from 'lucide-react';

interface CourseCatalogProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  onCreateCourse: (courseData: Partial<Course>) => void;
  onUpdateCourse: (id: string, courseData: Partial<Course>) => void;
  onDeleteCourse: (id: string) => void;
  onOpenAIGenerator: () => void;
}

export default function CourseCatalog({
  courses,
  onSelectCourse,
  onCreateCourse,
  onUpdateCourse,
  onDeleteCourse,
  onOpenAIGenerator,
}: CourseCatalogProps) {
  const { currentUser } = useAuth();
  const isInstructor =
    currentUser?.role === 'INSTRUCTOR' ||
    currentUser?.role === 'EVALUATOR' ||
    currentUser?.role === 'ADMIN';

  // State for filtering
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: 'ALL',
    level: 'ALL',
    status: 'ALL',
  });

  // State for Create/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Next.js & Frontend',
    level: 'INTERMEDIATE' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    thumbnail: '',
    status: 'PUBLISHED' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
  });

  // Filter logic
  const filteredCourses = courses.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      c.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      c.category.toLowerCase().includes(filters.search.toLowerCase());

    const matchesCategory = filters.category === 'ALL' || c.category === filters.category;
    const matchesLevel = filters.level === 'ALL' || c.level === filters.level;
    const matchesStatus = filters.status === 'ALL' || c.status === filters.status;

    return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
  });

  const categories = ['ALL', 'Next.js & Frontend', 'Backend & Node.js', 'Databases & System Design', 'General Tech'];

  const handleOpenCreateModal = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      category: 'Next.js & Frontend',
      level: 'INTERMEDIATE',
      thumbnail: '',
      status: 'PUBLISHED',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course: Course, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      thumbnail: course.thumbnail,
      status: course.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      onUpdateCourse(editingCourse.id, formData);
    } else {
      onCreateCourse(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              House of EdTech Evaluation Suite
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-400">Next.js 16 Fullstack CRUD</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Curriculum & Assessment Catalog
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Explore production-grade courses, interactive coding challenges, and AI submission rubrics. Designed for high-impact technical evaluation without basic todo lists or superficial CRUD.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            {isInstructor && (
              <>
                <button
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-indigo-500/20 transition-all flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Course (CRUD)</span>
                </button>

                <button
                  onClick={onOpenAIGenerator}
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-2 border border-violet-400/30"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Generate Course via AI</span>
                </button>
              </>
            )}

            {!isInstructor && (
              <div className="text-xs text-emerald-300 font-medium flex items-center bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Active Mode: Student / Candidate View (Select any course to enroll & submit assignments)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses by title, tags, or concepts..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            className="w-full text-xs pl-10 pr-9 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="hidden xl:flex items-center space-x-1.5 text-xs text-slate-400 font-semibold mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Category Dropdown */}
          <Select
            value={filters.category}
            onChange={(category) => setFilters({ ...filters, category })}
            aria-label="Filter by category"
            className="min-w-[10rem]"
            buttonClassName="border-slate-200 bg-slate-50/50 hover:bg-white"
            options={categories.map((cat) => ({
              value: cat,
              label: cat === 'ALL' ? 'Category: All' : `Category: ${cat}`,
            }))}
          />

          {/* Level Dropdown */}
          <Select
            value={filters.level}
            onChange={(level) => setFilters({ ...filters, level })}
            aria-label="Filter by level"
            className="min-w-[10rem]"
            buttonClassName="border-slate-200 bg-slate-50/50 hover:bg-white"
            options={[
              { value: 'ALL', label: 'Level: All Levels' },
              { value: 'BEGINNER', label: 'Level: Beginner' },
              { value: 'INTERMEDIATE', label: 'Level: Intermediate' },
              { value: 'ADVANCED', label: 'Level: Advanced' },
            ]}
          />

          {/* Status Dropdown (Instructors/Evaluators) */}
          {isInstructor && (
            <Select
              value={filters.status}
              onChange={(status) => setFilters({ ...filters, status })}
              aria-label="Filter by status"
              className="min-w-[9rem]"
              buttonClassName="border-slate-200 bg-slate-50/50 hover:bg-white"
              options={[
                { value: 'ALL', label: 'Status: All' },
                { value: 'PUBLISHED', label: 'Status: Published' },
                { value: 'DRAFT', label: 'Status: Draft' },
              ]}
            />
          )}

          {/* Reset Filters */}
          {(filters.search || filters.category !== 'ALL' || filters.level !== 'ALL' || filters.status !== 'ALL') && (
            <button
              onClick={() => setFilters({ search: '', category: 'ALL', level: 'ALL', status: 'ALL' })}
              className="px-2.5 py-2 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors flex items-center space-x-1"
              title="Reset All Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

        </div>

      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <div
            key={course.id}
            onClick={() => onSelectCourse(course)}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all duration-300 cursor-pointer group flex flex-col"
          >
            {/* Image Thumbnail */}
            <div className="relative h-44 overflow-hidden bg-slate-100">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-md">
                  {course.category}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  course.level === 'ADVANCED' ? 'bg-amber-500/90 text-white' :
                  course.level === 'INTERMEDIATE' ? 'bg-indigo-600/90 text-white' :
                  'bg-emerald-600/90 text-white'
                }`}>
                  {course.level}
                </span>
              </div>

              {/* CRUD Action buttons overlay for instructors */}
              {isInstructor && (
                <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-white/90 backdrop-blur-md p-1 rounded-lg border border-white/50 shadow-sm opacity-90 group-hover:opacity-100">
                  <button
                    onClick={(e) => handleOpenEditModal(course, e)}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                    title="Edit Course (CRUD)"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(course.id);
                    }}
                    className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded transition-colors"
                    title="Delete Course (CRUD)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Meta information */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="flex items-center">
                    <Layers className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                    {course.modules.length} Modules
                  </span>
                  <span className="flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                    {course.enrolledStudentsCount} Enrolled
                  </span>
                  <span className="flex items-center text-amber-600 font-bold">
                    <Star className="w-3.5 h-3.5 mr-1 fill-amber-400 text-amber-400" />
                    {course.rating}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    By <strong className="text-slate-700">{course.instructorName}</strong>
                  </span>
                  <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center">
                    Explore &rarr;
                  </span>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No courses match your filter criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, selecting another category, or generate a new course using the AI Architect.
          </p>
          <button
            onClick={() => setFilters({ search: '', category: 'ALL', level: 'ALL', status: 'ALL' })}
            className="px-3.5 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Delete Course Confirmation</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this course and its associated modules and assignments? This action is permanent and enforces backend CRUD cascading operations.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteCourse(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-bold bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal (CRUD) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 border border-slate-200 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              {editingCourse ? 'Edit Course Details (CRUD Update)' : 'Create New Course (CRUD Create)'}
            </h3>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Next.js 16 Server Components Architecture"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Detailed course overview and target outcomes..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <Select
                    value={formData.category}
                    onChange={(category) => setFormData({ ...formData, category })}
                    aria-label="Course category"
                    options={[
                      { value: 'Next.js & Frontend', label: 'Next.js & Frontend' },
                      { value: 'Backend & Node.js', label: 'Backend & Node.js' },
                      { value: 'Databases & System Design', label: 'Databases & System Design' },
                      { value: 'General Tech', label: 'General Tech' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Skill Level</label>
                  <Select
                    value={formData.level}
                    onChange={(level) =>
                      setFormData({
                        ...formData,
                        level: level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
                      })
                    }
                    aria-label="Course skill level"
                    options={[
                      { value: 'BEGINNER', label: 'Beginner' },
                      { value: 'INTERMEDIATE', label: 'Intermediate' },
                      { value: 'ADVANCED', label: 'Advanced' },
                    ]}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thumbnail Cover Image URL</label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg"
                  placeholder="https://example.com/course-cover.jpg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm"
                >
                  {editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
