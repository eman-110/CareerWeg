# CareerWeg

<div align="center">

[![Java 17](https://img.shields.io/badge/Java-17-blue.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-orange.svg)](https://www.mysql.com/)
[![Netlify](https://img.shields.io/badge/Netlify-Static%20Preview-00C7B7.svg)](https://www.netlify.com/)

</div>

A modern career platform for job seekers, employers, and learners — built with Java, Spring Boot, and a MySQL-backed backend.

Live demo: https://careerweg.netlify.app/beforelogin/homepagebeforelogin/homepagebeforelogin

CareerWeg brings together profile management, job applications, employer hiring flows, and course-based learning into a single, cohesive platform. It is designed to help users build professional identities, explore opportunities, and grow their skills in one place.

## 🌟 Overview

CareerWeg solves the problem of fragmented career tools by combining:

- personal profile creation and skill tracking
- job discovery and application workflows
- employer job posting and applicant management
- learning resources, course access, and certificate-oriented sections

This project is intended as a full-stack application prototype and portfolio-ready web platform for career-tech use cases.

## 🚀 Key Features

- Student and employer signup/login flows
- Profile creation and editing for job seekers
- Education, work experience, language, and skill management
- Employer contact and hiring profile information
- Job posting, listing, and application processing
- Course enrollment and learning dashboard sections
- Career-path and certificate-related pages
- File upload support for skill-related documents
- Session-based authenticated access
- Static preview deployment through Netlify

## 🛠️ Technologies Used

| Category | Tools and Technologies |
| --- | --- |
| Backend | Java 17, Spring Boot 3.4.5, Spring Web MVC |
| Persistence | Spring Data JPA, Hibernate, MySQL, H2 |
| Frontend | HTML, CSS, JavaScript |
| Build Tool | Maven Wrapper (`mvnw` / `mvnw.cmd`) |
| Deployment | Netlify static site publishing |
| Testing | Spring Boot test starter, Node.js test script |
| Project Tools | Git, npm, Maven |

## 📂 Project Structure

```text
CareerWeg/
├── .git/
├── .github/
├── .gitignore
├── .netlify/
├── .vscode/
├── README.md
├── netlify.toml
├── package.json
├── package-lock.json
├── test/
│   └── netlify-api.test.mjs
├── netlify/
│   └── function-source/
│       └── api.mjs
├── uploads/
│   ├── bhb.ai
│   └── saad.ai
├── back-end/
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   ├── user-info-writing.png
│   └── src/
│       ├── main/
│       │   ├── java/
│       │   │   └── com/
│       │   │       └── careerweg/
│       │   │           └── back_end/
│       │   │               ├── BackEndApplication.java
│       │   │               ├── controller/
│       │   │               │   ├── FileUploadController.java
│       │   │               │   ├── JobController.java
│       │   │               │   ├── SessionController.java
│       │   │               │   ├── UserApiController.java
│       │   │               │   └── UserController.java
│       │   │               ├── model/
│       │   │               │   ├── CareerPath.java
│       │   │               │   ├── Course.java
│       │   │               │   ├── Education.java
│       │   │               │   ├── EmployerContact.java
│       │   │               │   ├── Enrollment.java
│       │   │               │   ├── Job.java
│       │   │               │   ├── JobApplication.java
│       │   │               │   ├── Language.java
│       │   │               │   ├── SignupRequest.java
│       │   │               │   ├── User.java
│       │   │               │   └── WorkExperience.java
│       │   │               ├── repository/
│       │   │               │   ├── EducationRepository.java
│       │   │               │   ├── EmployerContactRepository.java
│       │   │               │   ├── EnrolledCourseRepository.java
│       │   │               │   ├── JobApplicationRepository.java
│       │   │               │   ├── JobRepository.java
│       │   │               │   ├── LanguageRepository.java
│       │   │               │   ├── UserRepository.java
│       │   │               │   └── WorkExperienceRepository.java
│       │   │               └── service/
│       │   │                   └── UserService.java
│       │   └── resources/
│       │       ├── application.properties
│       │       └── static/
│       │           ├── AfterLogin/
│       │           ├── BeforeLogin/
│       │           ├── Hire/
│       │           ├── ProfileForm/
│       │           ├── login/
│       │           ├── signup/
│       │           ├── assets/
│       │           ├── index.html
│       │           ├── styles.css
│       │           └── test-auth.html
│       └── test/
│           └── java/
│               └── com/
│                   └── careerweg/
│                       └── back_end/
└── ...
```

## ⚙️ Prerequisites

Before running the project locally, ensure the following are installed:

- Java 17+
- Maven or the included Maven wrapper
- MySQL 8.0 or a compatible database server
- Node.js 20+ and npm
- Git
- A browser such as Chrome, Edge, or Firefox
- Write permissions for the `uploads/` directory

## 🏁 Installation & Setup

### 1) Clone the repository

```bash
git clone https://github.com/eman-110/CareerWeg.git
cd CareerWeg
```

### 2) Configure database environment variables

Set the following variables before starting the backend:

#### macOS / Linux

```bash
export DB_URL="jdbc:mysql://localhost:3306/careerweg_db?useSSL=false&serverTimezone=UTC"
export DB_USERNAME="root"
export DB_PASSWORD="your_mysql_password"
```

#### Windows PowerShell

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/careerweg_db?useSSL=false&serverTimezone=UTC"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your_mysql_password"
```

### 3) Create the database

```sql
CREATE DATABASE careerweg_db;
```

### 4) Run the backend

```bash
cd back-end
./mvnw spring-boot:run
```

Windows:

```powershell
cd back-end
.\mvnw.cmd spring-boot:run
```

Then open:

```text
http://localhost:8080
```

### 5) Optional: static Netlify preview

The app is also configured for a static preview via Netlify using the publish directory:

```toml
[build]
  publish = "back-end/src/main/resources/static"
```

This preview shows the front-end UI, but it does not fully support backend-driven database operations.

## 🗄️ Database Configuration

The Spring Boot backend uses MySQL and the configuration is defined in `back-end/src/main/resources/application.properties`.

```properties
spring.application.name=back-end
```properties
spring.application.name=back-end
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/careerweg_db?useSSL=false&serverTimezone=UTC}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

Hibernate creates or updates tables based on the JPA entity classes. The main entities include:

- `User` → `users`
- `Job` → `jobs`
- `Education` → `educations`
- `EmployerContact` → `employer_contact_info`
- `Enrollment` → `enrollments`
- `Course` → `courses`
- `CareerPath` → `career_paths`
- `JobApplication` → application records

## 🧭 Application Usage

### Student Flow

1. Sign up as a student.
2. Complete your profile with education, skills, work experience, and languages.
3. Browse job listings and apply for roles.
4. Explore learning and career-related sections.
5. Access dashboard and session-based account pages.

### Employer Flow

1. Sign up as an employer.
2. Complete employer contact details.
3. Post a job listing with title, skills, category, budget, and deadline.
4. Manage posted jobs and view applicant activity.
5. Use the hiring dashboard for employer operations.

### File Uploads

The `FileUploadController` saves uploaded files into the project-level `uploads/` directory, which is used for document and skill-related uploads during local testing.

## 📸 Screenshots

The repository includes a sample project image:

```md
![CareerWeg Screenshot](back-end/user-info-writing.png)
```

![CareerWeg Screenshot](back-end/user-info-writing.png)

Additional screenshots can be added for:

- landing page
- signup/login screens
- profile form flow
- employer dashboard
- job listing and application pages
- course and roadmap views

## 🌱 Future Improvements

- Add password hashing and stronger authentication security
- Improve validation and error handling for forms and APIs
- Introduce DTOs for cleaner API responses
- Add admin and moderation dashboards
- Expand job matching and filtering features
- Improve course and certificate data models
- Add end-to-end automated testing
- Prepare the app for production deployment with environment hardening
- Add a proper open-source license file

## 👨‍💻 Author

Developed by Emaan

GitHub: https://github.com/eman-110

---

Built as a portfolio and learning project to demonstrate a real-world career platform with both job and learning workflows.
