-- Database indexes for performance optimization
-- These indexes will improve query performance for common operations

-- Index for User model queries
CREATE INDEX IF NOT EXISTS idx_user_clerk_id ON "User"("clerkId");
CREATE INDEX IF NOT EXISTS idx_user_points ON "User"("points" DESC);
CREATE INDEX IF NOT EXISTS idx_user_created_at ON "User"("createdAt");

-- Index for UserLecture model queries
CREATE INDEX IF NOT EXISTS idx_user_lecture_user_id ON "UserLecture"("userId");
CREATE INDEX IF NOT EXISTS idx_user_lecture_course_id ON "UserLecture"("courseId");
CREATE INDEX IF NOT EXISTS idx_user_lecture_created_at ON "UserLecture"("createdAt");
CREATE INDEX IF NOT EXISTS idx_user_lecture_user_course ON "UserLecture"("userId", "courseId");

-- Index for Certificate model queries
CREATE INDEX IF NOT EXISTS idx_certificate_user_id ON "Certificate"("userId");
CREATE INDEX IF NOT EXISTS idx_certificate_course_cms_id ON "Certificate"("courseCmsId");
CREATE INDEX IF NOT EXISTS idx_certificate_created_at ON "Certificate"("createdAt");
CREATE INDEX IF NOT EXISTS idx_certificate_user_course ON "Certificate"("userId", "courseCmsId");

-- Index for Exam model queries
CREATE INDEX IF NOT EXISTS idx_exam_user_id ON "Exam"("userId");
CREATE INDEX IF NOT EXISTS idx_exam_lecture_cms_id ON "Exam"("lectureCMSid");
CREATE INDEX IF NOT EXISTS idx_exam_created_at ON "Exam"("createdAt");
CREATE INDEX IF NOT EXISTS idx_exam_user_created ON "Exam"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS idx_exam_complete ON "Exam"("complete");

-- Index for Damage model queries
CREATE INDEX IF NOT EXISTS idx_damage_user_id ON "Damage"("userId");
CREATE INDEX IF NOT EXISTS idx_damage_created_at ON "Damage"("createdAt");
CREATE INDEX IF NOT EXISTS idx_damage_user_created ON "Damage"("userId", "createdAt");

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_user_lecture_user_created ON "UserLecture"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS idx_certificate_user_created ON "Certificate"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS idx_exam_user_complete ON "Exam"("userId", "complete");

