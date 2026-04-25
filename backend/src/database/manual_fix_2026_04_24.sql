USE ripple_learning_platform;

CREATE TABLE IF NOT EXISTS app_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

SET @has_graded_by = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'assignment_submissions'
    AND column_name = 'graded_by'
);

SET @sql_add_graded_by = IF(
  @has_graded_by = 0,
  'ALTER TABLE assignment_submissions ADD COLUMN graded_by INT NULL',
  'SELECT ''assignment_submissions.graded_by already exists'' AS info'
);
PREPARE stmt_add_graded_by FROM @sql_add_graded_by;
EXECUTE stmt_add_graded_by;
DEALLOCATE PREPARE stmt_add_graded_by;

INSERT INTO app_settings (setting_key, setting_value)
VALUES
  ('allowRegistration', 'false'),
  ('dailyReportReminder', 'true'),
  ('assignmentReminder', 'true'),
  ('maxFileSize', '10'),
  ('bosEnabled', 'false'),
  ('bosDomain', ''),
  ('bosBucket', ''),
  ('bosAccessKey', ''),
  ('bosSecretKey', '')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

UPDATE users
SET real_name = '管理员'
WHERE username = 'admin';

UPDATE users
SET real_name = '张超'
WHERE username = 'zhangchao';

INSERT INTO schema_migrations (version)
VALUES
  ('001_initial_schema.sql'),
  ('002_indexes_and_compat.sql'),
  ('003_app_settings.sql'),
  ('004_bos_storage_settings.sql')
ON DUPLICATE KEY UPDATE version = VALUES(version);

SELECT 'manual_fix_completed' AS status, NOW() AS executed_at;
