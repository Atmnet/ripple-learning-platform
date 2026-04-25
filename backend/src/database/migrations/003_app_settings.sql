CREATE TABLE IF NOT EXISTS app_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO app_settings (setting_key, setting_value)
VALUES
  ('allowRegistration', 'false'),
  ('dailyReportReminder', 'true'),
  ('assignmentReminder', 'true'),
  ('maxFileSize', '10')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
