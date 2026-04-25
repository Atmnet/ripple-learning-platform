INSERT INTO app_settings (setting_key, setting_value)
VALUES
  ('bosEnabled', 'false'),
  ('bosDomain', ''),
  ('bosBucket', ''),
  ('bosAccessKey', ''),
  ('bosSecretKey', '')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
