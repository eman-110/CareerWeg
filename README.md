# CareerWeg

CareerWeg is a career platform showcase for job seekers and employers, with static pages for profiles, job listings, applications, and courses. The full application has a Java/Spring Boot backend and MySQL database. The Netlify preview described here publishes only the static frontend; it does not deploy or connect to a backend or database.

## Features

- Student and employer signup/login flows
- User profile creation and updates with personal details, education, work experience, languages, skills, portfolio links, and contact information
- Employer job posting and job-list management
- Job search and candidate application workflow
- Session-based authenticated access for logged-in users
- Course, roadmap, skill test, and certificate-related pages
- Static showcase preview on Netlify

The features above describe the full application. On the backend-free Netlify preview, data-driven and account features are not operational; see [Features unavailable in the static preview](#features-unavailable-in-the-static-preview).

## Technologies used

- Java 17
- Spring Boot 3.4.5
- Spring Web MVC
- Spring Data JPA / Hibernate
- MySQL and H2 drivers in the Java build
- Maven wrapper (`mvnw` / `mvnw.cmd`)
- Static HTML, CSS, and JavaScript front-end files served by the Spring Boot application
- Netlify Functions (Node.js), `mysql2`, and Netlify Blobs for the Netlify deployment

## Prerequisites

Before running the application, make sure you have:

- Java 17 or newer installed
- Node.js 20 or newer and npm for Netlify Function development and tests (not required to publish the static preview)
- A MySQL-compatible database with the existing CareerWeg schema
- A browser available for the front-end pages

## Installation and setup

1. Clone the repository.
2. Open the project root.
3. Configure the `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` environment variables for your local MySQL instance.
4. Ensure the project root has write access for uploaded files under `uploads/` when running the Java backend locally.

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

## Deploying the static preview to Netlify

The root `netlify.toml` publishes `back-end/src/main/resources/static` as a static site. It deliberately does not configure or deploy Netlify Functions. Publishing this preview does not access or modify your local MySQL database, and no database or session environment variables are needed.

1. Push this repository to a GitHub, GitLab, or Bitbucket account that Netlify can access.
2. Sign in to Netlify and choose **Add new site** / **Add a new project**, then import the repository from your Git provider.
3. Keep the repository root as the base directory. Use the settings from the checked-in `netlify.toml`: publish directory `back-end/src/main/resources/static`; no build command is needed.
4. Start the deploy. Netlify will publish the static files and provide a `*.netlify.app` preview URL.
5. Open that URL. The static root `index.html` redirects to the public CareerWeg homepage.

Do not configure the local MySQL credentials in Netlify for this showcase. The repository retains API source under `netlify/function-source/` for reference and tests, outside Netlify's auto-discovered functions directory; it is not deployed by this static-only configuration.

## Features unavailable in the static preview

Without a running backend, pages can be displayed but API-backed actions cannot retrieve or save application data. In particular:

- Student/employer signup, login, sessions, and logout
- Loading, creating, or updating profiles and profile sections
- Loading jobs or employer job listings, posting jobs, applying, and viewing application or applicant details
- Employer contact/profile data that is loaded or saved through the API
- Course enrollment, loading in-progress or completed courses, and recording course completion
- Skill-file uploads and backend-dependent skill-test completion

These pages may show empty content, errors, or forms that cannot submit successfully. Static page navigation and content that does not require the API remain available. No database connection is attempted by the preview.

## How to use it

For the local full application, start the Java backend and open it at `http://localhost:8080`. For the Netlify static preview, open the deployed `*.netlify.app` address; backend-dependent features listed above will not work there.

1. Sign up as a student or employer.
2. Complete a profile, browse jobs, post jobs as an employer, or enroll in courses.
The project includes static pages for:

- `BeforeLogin/HomePageBeforeLogin/homePageBeforeLogin.html`
- `ProfileForm/WelcomePage/index.html`
- `Hire/Login/index.html`
- `AfterLogin/Dashboard/index.html`

The Java backend exposes API routes under `/api`. The Netlify static preview does not publish an API.

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
│   │   │       └── static/
│   │   └── test/
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   └── user-info-writing.png
├── netlify/
│   └── function-source/
│       └── api.mjs                 # Retained for tests; not deployed
├── test/
│   └── netlify-api.test.mjs
├── netlify.toml
├── package.json
├── package-lock.json
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
- `netlify.toml` — Netlify build, publish, and functions paths
- Netlify site environment variables — none required for the static preview

For the Java backend, configure `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` in the environment. The static Netlify preview needs no environment variables. If you separately configure the retained Netlify Function source for a future backend deployment, its database and signing settings are:

- `DB_HOST`
- `DB_PORT` (usually `3306`)
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_SSL` (enabled by default; set to `false` only for a trusted local connection)
- `DB_SSL_CA` (optional database CA certificate, if required by the provider)
- `SESSION_SECRET` (at least 32 characters; generate a unique random value)

Generate a signing secret locally with Node.js, then copy its output directly into Netlify's environment-variable settings:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

The Netlify Function does not use Spring's JPA schema auto-update. It expects the existing MySQL table and column names from the provided schema. It uses `job_application` and `enrolledcourse` for the current application's job and course flows; it leaves the separate legacy tables untouched.

## Screenshots

The repository includes an image file at `back-end/user-info-writing.png`.

![Project screenshot](back-end/user-info-writing.png)

The main UI is built as static HTML pages under `back-end/src/main/resources/static`, so screenshots can also be captured from the app once it is running locally.

## Contributing

Contributions are welcome for bug fixes, feature improvements, and UI refinements. For an effective contribution:

1. Keep changes scoped and easy to review.
2. Update the relevant backend or static front-end files.
3. Run `npm test` for Netlify Function changes.
4. Verify the Spring Boot application still starts cleanly with Maven when Java backend files change.
5. Document important configuration changes.

This repository does not currently include a dedicated contribution policy or CI workflow file.

## License

No explicit license file is present in the repository, so the project does not currently declare a license. If this project is intended for public distribution or reuse, add a license file before publishing it externally.
