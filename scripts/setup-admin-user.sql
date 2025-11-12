-- ============================================
-- Admin Authentication Database Setup Script
-- ============================================

-- User Table (sudah dibuat oleh Prisma)
-- Struktur:
-- - id: INT, PRIMARY KEY, AUTO_INCREMENT
-- - username: VARCHAR, UNIQUE
-- - email: VARCHAR, UNIQUE
-- - password: VARCHAR (bcrypt hash)
-- - role: VARCHAR (default: 'user', bisa 'admin')
-- - createdAt: DATETIME
-- - updatedAt: DATETIME

-- ============================================
-- CREATE ADMIN USER
-- ============================================
-- Pasword: password123 (bcrypt hash)

INSERT INTO User (username, email, password, role, createdAt, updatedAt)
VALUES (
  'admin',
  'admin@example.com',
  '$2a$10$O2.E0T3l8BU.eIH0LQ/hM.1t2Ls52/gViBCYv5gJ6Dh/Z5Yq3iNQG',
  'admin',
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  password = '$2a$10$O2.E0T3l8BU.eIH0LQ/hM.1t2Ls52/gViBCYv5gJ6Dh/Z5Yq3iNQG',
  role = 'admin',
  updatedAt = NOW();

-- ============================================
-- OPTIONAL: Create AdminLoginLog Table
-- ============================================
-- Uncomment jika ingin menyimpan login history ke database

/*
CREATE TABLE IF NOT EXISTS AdminLoginLog (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT,
  username VARCHAR(255) NOT NULL,
  success BOOLEAN NOT NULL,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  reason VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_createdAt (createdAt)
);
*/

-- ============================================
-- VERIFY DATA
-- ============================================
-- Jalankan query ini untuk verify setup:

-- SELECT * FROM User WHERE role = 'admin';
-- SELECT COUNT(*) as total_admin FROM User WHERE role = 'admin';

-- ============================================
-- ADDITIONAL ADMIN USERS (Optional)
-- ============================================
-- Uncomment dan jalankan jika ingin menambah admin lain

/*
INSERT INTO User (username, email, password, role, createdAt, updatedAt)
VALUES (
  'super_admin',
  'super@example.com',
  '$2a$10$...',  -- bcrypt hash dari password yang diinginkan
  'admin',
  NOW(),
  NOW()
);

INSERT INTO User (username, email, password, role, createdAt, updatedAt)
VALUES (
  'manager',
  'manager@example.com',
  '$2a$10$...',  -- bcrypt hash dari password yang diinginkan
  'admin',
  NOW(),
  NOW()
);
*/

-- ============================================
-- NOTES
-- ============================================
-- 1. Untuk generate bcrypt hash:
--    node scripts/generate-password-hash.js <password>
--
-- 2. Default password: password123
--    Default username: admin
--
-- 3. Ganti password segera setelah login pertama kali
--
-- 4. Jangan commit hash password ke git
--    Gunakan environment variable atau secret management
--
-- ============================================
