-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS taskmaster_db;
USE taskmaster_db;

-- Create the tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to VARCHAR(100),
    status ENUM('pending', 'done') DEFAULT 'pending',
    due_date DATE,
    priority ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
    category VARCHAR(50),
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
