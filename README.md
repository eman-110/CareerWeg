# CareerWeg

CareerWeg is a Java/Spring Boot career platform designed for job seekers and employers. The project includes a backend API for managing users, profiles, jobs, and applications, and it serves a collection of HTML/CSS/JavaScript pages from the `back-end/src/main/resources/static` folder for the public and authenticated flows.

## Features

- Student and employer signup/login flows
- User profile creation and updates with personal details, education, work experience, languages, skills, portfolio links, and contact information
- Employer job posting and job-list management
- Job search and candidate application workflow
- Session-based authenticated access for logged-in users
- Course, roadmap, skill test, and certificate-related pages
- File upload support for uploaded artifacts stored under the project `uploads/` directory

## Technologies used

- Java 17
- Spring Boot 3.4.5
- Spring Web MVC
- Spring Data JPA / Hibernate
- MySQL driver and H2 dependency in the build
- Maven wrapper (`mvnw` / `mvnw.cmd`)
- Static HTML, CSS, and JavaScript front-end files served by the Spring Boot application

## Prerequisites

Before running the application, make sure you have:

- Java 17 or newer installed
- A local MySQL instance and `careerweg_db` database for the default local profile
- A browser available for the front-end pages

## Installation and setup

1. Clone the repository.
2. Open the project root.
3. Configure the `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` environment variables for your local MySQL instance.
4. Ensure the project root has write access for uploaded files under `uploads/`.

Example configuration values in the project currently point to:

- JDBC URL: `jdbc:mysql://localhost:3306/careerweg_db`
- Username: `root`
- Password: set in the `DB_PASSWORD` environment variable

## How to run the project

From the `back-end` directory, run:

```bash
./mvnw spring-boot:run
```

On Windows, use:

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/careerweg_db?useSSL=false&serverTimezone=UTC"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "<your-local-mysql-password>"
.\mvnw.cmd spring-boot:run
```

The application is configured to run with the default Spring Boot web server on port `8080` unless overridden elsewhere.

## Deploying a demo to Render

The repository includes a root-level `Dockerfile` for deploying the application as a Render web service. The container activates the `render` Spring profile, which uses the included in-memory H2 database instead of MySQL.

1. Push the repository to a Git provider account that Render can access.
2. In Render, create a **New > Web Service** and connect the repository.
3. Choose Docker as the runtime and keep the repository root as the build context so Render can find the root-level `Dockerfile`.
4. Choose the **Free** instance type and deploy.
5. Open the `onrender.com` address Render assigns to the service.

This setup is intended for a demo, not durable production use:

- Render Free services can spin down after inactivity and take time to start again.
- H2 is in-memory, so database records reset when the service restarts.
- Uploaded files are saved in the service's local `uploads/` directory, which is not persistent on Render Free.
- The Render profile enables secure session cookies for HTTPS.

Do not commit real database credentials; supply them through `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`. If a real password was already committed, rotate it because removing it from the current file does not erase it from Git history.

## How to use it

1. Start the backend.
2. Open the application in a browser, typically at `http://localhost:8080`.
3. Use the public and authenticated pages under the static resources to sign up, log in, complete a profile, browse jobs, and manage employer flows.
4. For example, the project contains static pages for:
   - `BeforeLogin/HomePageBeforeLogin/homePageBeforeLogin.html`
   - `ProfileForm/WelcomePage/index.html`
   - `Hire/Login/index.html`
   - `AfterLogin/Dashboard/index.html`

The backend also exposes API endpoints under `/api`, including user management and job operations.

## Project structure

```text
CareerWeg/
├── back-end/
│   ├── .mvn/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/careerweg/back_end/
│   │   │   │       ├── controller/
│   │   │   │       ├── model/
│   │   │   │       ├── repository/
│   │   │   │       ├── service/
│   │   │   │       └── BackEndApplication.java
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       ├── application-render.properties
│   │   │       └── static/
│   │   └── test/
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   └── user-info-writing.png
├── uploads/
│   ├── bhb.ai
│   └── saad.ai
├── Dockerfile
├── README.md
└── .git/
```

Key backend application classes include:

- `BackEndApplication.java` — Spring Boot application entry point
- `UserController.java` — signup, login, session, profile, and profile-data endpoints
- `JobController.java` — employer job submission, job listings, and applications
- `FileUploadController.java` — file upload handling
- `SessionController.java` — session user lookup
- `UserService.java` — core user service logic

## Configuration or environment variables

The main runtime settings are defined in:

- `back-end/src/main/resources/application.properties`

Current configuration includes:

- `spring.application.name=back-end`
- MySQL datasource URL: `jdbc:mysql://localhost:3306/careerweg_db`
- `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` environment variables can override the local MySQL settings
- `spring.jpa.hibernate.ddl-auto=update`
- `spring.jpa.show-sql=true`
- `server.servlet.session.timeout=30m`
- `spring.servlet.multipart.max-file-size=10MB`
- `spring.servlet.multipart.max-request-size=10MB`
- Render demo settings are in `back-end/src/main/resources/application-render.properties`

The application also configures CORS for `http://localhost:8080` in `BackEndApplication.java`. For a different local database, set the `DB_*` values accordingly.

## Screenshots

The repository includes an image file at `back-end/user-info-writing.png`.

![Project screenshot](back-end/user-info-writing.png)

The main UI is built as static HTML pages under `back-end/src/main/resources/static`, so screenshots can also be captured from the app once it is running locally.

## Contributing

Contributions are welcome for bug fixes, feature improvements, and UI refinements. For an effective contribution:

1. Keep changes scoped and easy to review.
2. Update the relevant backend or static front-end files.
3. Verify the Spring Boot application still starts cleanly with Maven.
4. Document important configuration changes.

This repository does not currently include a dedicated contribution policy or CI workflow file.

## License

No explicit license file is present in the repository, so the project does not currently declare a license. If this project is intended for public distribution or reuse, add a license file before publishing it externally.
