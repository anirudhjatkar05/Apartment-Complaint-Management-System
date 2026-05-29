# Apartment Complaint Management System

## Overview

The Apartment Complaint Management System is a web-based application developed to streamline the process of complaint registration, tracking, and resolution within residential apartment communities. The system allows residents to submit complaints online and enables administrators to manage and resolve complaints efficiently.

## Features

### Resident Module

* User Registration and Login
* Submit New Complaints
* View Complaint Status
* Track Complaint History
* Secure User Authentication

### Administrator Module

* Admin Login
* View All Complaints
* Update Complaint Status
* Manage Residents
* Monitor Complaint Resolution Progress
* Complaint Management Dashboard

## Technologies Used

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MySQL

### Tools & Platforms

* Git
* GitHub
* Visual Studio Code
* MySQL Workbench

## System Architecture

```text
Resident
   ↓
Frontend (HTML, CSS, JavaScript)
   ↓
Node.js + Express.js Backend
   ↓
MySQL Database
   ↓
Administrator Dashboard
```

## Project Objectives

* Digitize apartment complaint management.
* Reduce manual paperwork and communication delays.
* Improve transparency in complaint resolution.
* Provide efficient communication between residents and management.
* Maintain a centralized complaint database.

## Installation Guide

### 1. Clone Repository

```bash
git clone https://github.com/anirudhjatkar05/Apartment-Complaint-Management-System.git
```

### 2. Navigate to Project Folder

```bash
cd Apartment-Complaint-Management-System
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Database

Create a MySQL database:

```sql
CREATE DATABASE complaint_db ;
```

Update database credentials in your configuration file.

Example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=12345678
DB_NAME=complaint_db
PORT=5000
```

### 5. Start the Application

```bash
npm start
```

### 6. Open the Application

```text
http://localhost:5000
```

## Database Design

### Users Table

* User ID
* Name
* Email
* Password
* Role

### Complaints Table

* Complaint ID
* User ID
* Complaint Title
* Description
* Status
* Date Created

## Future Enhancements

* Mobile Application
* Email Notifications
* SMS Alerts
* Complaint Analytics Dashboard
* AI-Based Complaint Categorization
* Multi-Apartment Support
* Image Upload for Complaints
* Real-Time Complaint Tracking

## Learning Outcomes

This project helped in understanding:

* Full Stack Web Development
* REST API Development
* MySQL Database Management
* Authentication and Authorization
* Backend Development using Express.js
* Version Control using Git and GitHub
* Project Deployment Concepts

## Project Status

 Completed and Functional

## Author

**Anirudh Jatkar**

GitHub: https://github.com/anirudhjatkar05

## License

This project is developed for educational and learning purposes.
