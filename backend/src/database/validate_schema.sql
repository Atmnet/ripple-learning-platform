SELECT 'current_database' AS check_name, DATABASE() AS check_value;

DROP TEMPORARY TABLE IF EXISTS tmp_validation_migrations;
CREATE TEMPORARY TABLE tmp_validation_migrations (
  version VARCHAR(255),
  applied_at DATETIME NULL
);

SET @has_schema_migrations = (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'schema_migrations'
);

SET @sql_migrations = IF(
  @has_schema_migrations > 0,
  'INSERT INTO tmp_validation_migrations (version, applied_at) SELECT version, applied_at FROM schema_migrations',
  'INSERT INTO tmp_validation_migrations (version, applied_at) VALUES (NULL, NULL)'
);
PREPARE stmt_migrations FROM @sql_migrations;
EXECUTE stmt_migrations;
DEALLOCATE PREPARE stmt_migrations;

SELECT 'applied_migrations' AS section, version, applied_at
FROM tmp_validation_migrations
WHERE version IS NOT NULL
ORDER BY version;

SELECT
  'migration_status' AS section,
  expected.version,
  CASE WHEN actual.version IS NULL THEN 'MISSING' ELSE 'OK' END AS status
FROM (
  SELECT '001_initial_schema.sql' AS version
  UNION ALL SELECT '002_indexes_and_compat.sql'
  UNION ALL SELECT '003_app_settings.sql'
  UNION ALL SELECT '004_bos_storage_settings.sql'
) AS expected
LEFT JOIN tmp_validation_migrations AS actual
  ON actual.version = expected.version;

SELECT
  'table_status' AS section,
  expected.table_name,
  CASE WHEN actual.table_name IS NULL THEN 'MISSING' ELSE 'OK' END AS status
FROM (
  SELECT 'users' AS table_name
  UNION ALL SELECT 'daily_reports'
  UNION ALL SELECT 'assignments'
  UNION ALL SELECT 'assignment_submissions'
  UNION ALL SELECT 'documents'
  UNION ALL SELECT 'video_resources'
  UNION ALL SELECT 'daily_report_comments'
  UNION ALL SELECT 'linux_exams'
  UNION ALL SELECT 'linux_student_exams'
  UNION ALL SELECT 'linux_student_answers'
  UNION ALL SELECT 'app_settings'
  UNION ALL SELECT 'schema_migrations'
) AS expected
LEFT JOIN information_schema.tables AS actual
  ON actual.table_schema = DATABASE()
 AND actual.table_name = expected.table_name
ORDER BY expected.table_name;

SELECT
  'column_status' AS section,
  expected.table_name,
  expected.column_name,
  CASE WHEN actual.column_name IS NULL THEN 'MISSING' ELSE 'OK' END AS status
FROM (
  SELECT 'daily_reports' AS table_name, 'reviewed_at' AS column_name
  UNION ALL SELECT 'assignments', 'file_url'
  UNION ALL SELECT 'assignment_submissions', 'graded_by'
  UNION ALL SELECT 'video_resources', 'embed_url'
  UNION ALL SELECT 'linux_exams', 'assigned_student_ids'
  UNION ALL SELECT 'app_settings', 'setting_key'
  UNION ALL SELECT 'app_settings', 'setting_value'
) AS expected
LEFT JOIN information_schema.columns AS actual
  ON actual.table_schema = DATABASE()
 AND actual.table_name = expected.table_name
 AND actual.column_name = expected.column_name
ORDER BY expected.table_name, expected.column_name;

SELECT
  'index_status' AS section,
  expected.table_name,
  expected.index_name,
  CASE WHEN actual.index_name IS NULL THEN 'MISSING' ELSE 'OK' END AS status
FROM (
  SELECT 'daily_reports' AS table_name, 'idx_daily_reports_user_date' AS index_name
  UNION ALL SELECT 'assignments', 'idx_assignments_deadline'
  UNION ALL SELECT 'assignment_submissions', 'idx_submissions_assignment_user'
  UNION ALL SELECT 'video_resources', 'idx_video_resources_category'
) AS expected
LEFT JOIN (
  SELECT DISTINCT table_name, index_name
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
) AS actual
  ON actual.table_name = expected.table_name
 AND actual.index_name = expected.index_name
ORDER BY expected.table_name, expected.index_name;

DROP TEMPORARY TABLE IF EXISTS tmp_validation_app_settings;
CREATE TEMPORARY TABLE tmp_validation_app_settings (
  setting_key VARCHAR(100),
  setting_value TEXT
);

SET @has_app_settings = (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'app_settings'
);

SET @sql_app_settings = IF(
  @has_app_settings > 0,
  'INSERT INTO tmp_validation_app_settings (setting_key, setting_value) SELECT setting_key, setting_value FROM app_settings',
  'INSERT INTO tmp_validation_app_settings (setting_key, setting_value) VALUES (NULL, NULL)'
);
PREPARE stmt_app_settings FROM @sql_app_settings;
EXECUTE stmt_app_settings;
DEALLOCATE PREPARE stmt_app_settings;

SELECT
  'app_settings_status' AS section,
  expected.setting_key,
  CASE WHEN actual.setting_key IS NULL THEN 'MISSING' ELSE 'OK' END AS status,
  actual.setting_value
FROM (
  SELECT 'allowRegistration' AS setting_key
  UNION ALL SELECT 'dailyReportReminder'
  UNION ALL SELECT 'assignmentReminder'
  UNION ALL SELECT 'maxFileSize'
  UNION ALL SELECT 'bosEnabled'
  UNION ALL SELECT 'bosDomain'
  UNION ALL SELECT 'bosBucket'
  UNION ALL SELECT 'bosAccessKey'
  UNION ALL SELECT 'bosSecretKey'
) AS expected
LEFT JOIN tmp_validation_app_settings AS actual
  ON actual.setting_key = expected.setting_key
ORDER BY expected.setting_key;

SELECT
  'row_counts' AS section,
  expected.table_name,
  COALESCE(actual.table_rows, 0) AS total_rows_estimate
FROM (
  SELECT 'users' AS table_name
  UNION ALL SELECT 'daily_reports'
  UNION ALL SELECT 'assignments'
  UNION ALL SELECT 'assignment_submissions'
  UNION ALL SELECT 'documents'
  UNION ALL SELECT 'video_resources'
  UNION ALL SELECT 'daily_report_comments'
  UNION ALL SELECT 'linux_exams'
  UNION ALL SELECT 'linux_student_exams'
  UNION ALL SELECT 'linux_student_answers'
  UNION ALL SELECT 'app_settings'
) AS expected
LEFT JOIN information_schema.tables AS actual
  ON actual.table_schema = DATABASE()
 AND actual.table_name = expected.table_name
ORDER BY expected.table_name;

SELECT
  'admin_account_status' AS section,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = 'users'
    )
    THEN 'CHECK USERS TABLE BELOW'
    ELSE 'USERS TABLE MISSING'
  END AS status;

DROP TEMPORARY TABLE IF EXISTS tmp_validation_admin_users;
CREATE TEMPORARY TABLE tmp_validation_admin_users (
  username VARCHAR(50),
  real_name VARCHAR(50),
  role VARCHAR(20)
);

SET @has_users = (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'users'
);

SET @sql_admin_users = IF(
  @has_users > 0,
  'INSERT INTO tmp_validation_admin_users (username, real_name, role) SELECT username, real_name, role FROM users WHERE role = ''admin''',
  'INSERT INTO tmp_validation_admin_users (username, real_name, role) VALUES (NULL, NULL, NULL)'
);
PREPARE stmt_admin_users FROM @sql_admin_users;
EXECUTE stmt_admin_users;
DEALLOCATE PREPARE stmt_admin_users;

SELECT
  'admin_account' AS section,
  username,
  real_name,
  role
FROM tmp_validation_admin_users
WHERE username IS NOT NULL;

DROP TEMPORARY TABLE IF EXISTS tmp_validation_migrations;
DROP TEMPORARY TABLE IF EXISTS tmp_validation_app_settings;
DROP TEMPORARY TABLE IF EXISTS tmp_validation_admin_users;
