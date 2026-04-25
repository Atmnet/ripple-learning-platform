ALTER TABLE daily_reports ADD INDEX idx_daily_reports_user_date (user_id, submit_date);
ALTER TABLE assignments ADD INDEX idx_assignments_deadline (deadline);
ALTER TABLE assignment_submissions ADD INDEX idx_submissions_assignment_user (assignment_id, user_id);
ALTER TABLE video_resources ADD INDEX idx_video_resources_category (category);
