import { getStore } from "@netlify/blobs";
import mysql from "mysql2/promise";
import {
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = "careerweg_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024;
const PASSWORD_HASH_PREFIX = "scrypt";
let pool;

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });

const text = (body, status = 200, headers = {}) =>
  new Response(body, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", ...headers },
  });

const redirect = (location, headers = {}) =>
  new Response(null, { status: 303, headers: { location, ...headers } });

function getPool() {
  if (pool) return pool;

  const required = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(`Missing database configuration: ${missing.join(", ")}`);
  }

  const ssl = process.env.DB_SSL !== "false"
    ? {
        rejectUnauthorized: true,
        ...(process.env.DB_SSL_CA ? { ca: process.env.DB_SSL_CA } : {}),
      }
    : undefined;

  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl,
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0,
    enableKeepAlive: true,
    decimalNumbers: true,
  });
  return pool;
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters");
  }
  return secret;
}

function signPayload(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getSessionSecret())
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${signature}`;
}

function verifyPayload(token) {
  if (!token || typeof token !== "string") return null;
  const [encoded, suppliedSignature, extra] = token.split(".");
  if (!encoded || !suppliedSignature || extra) return null;

  const expectedSignature = createHmac("sha256", getSessionSecret())
    .update(encoded)
    .digest();
  let actualSignature;
  try {
    actualSignature = Buffer.from(suppliedSignature, "base64url");
  } catch {
    return null;
  }
  if (
    expectedSignature.length !== actualSignature.length ||
    !timingSafeEqual(expectedSignature, actualSignature)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (
      !Number.isSafeInteger(payload.id) ||
      !Number.isSafeInteger(payload.exp) ||
      payload.exp <= Date.now() / 1000
    ) {
      return null;
    }
    return { id: payload.id, role: payload.role };
  } catch {
    return null;
  }
}

function readCookie(request, name) {
  const cookies = request.headers.get("cookie") || "";
  for (const part of cookies.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === name) {
      try {
        return decodeURIComponent(part.slice(separator + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

function sessionCookie(user) {
  const value = signPayload({
    id: Number(user.id),
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  });
  const secure = process.env.NETLIFY ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
}

function clearSessionCookie() {
  const secure = process.env.NETLIFY ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

function getSession(request) {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  try {
    return verifyPayload(token);
  } catch {
    return null;
  }
}

async function parseBody(request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    return request.formData();
  }
  if (contentType.includes("application/json")) {
    return request.json();
  }
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(await request.text()));
  }
  return {};
}

function field(data, name, fallback = "") {
  const value = data instanceof FormData ? data.get(name) : data?.[name];
  return value == null ? fallback : String(value);
}

function fields(data, name) {
  if (data instanceof FormData) return data.getAll(name).map(String);
  const value = data?.[name];
  if (Array.isArray(value)) return value.map(String);
  return value == null ? [] : [String(value)];
}

function safeUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    contactEmail: row.contact_email,
    phoneNumber: row.phone_number,
    address: row.address,
    city: row.city,
    country: row.country,
    role: row.role,
    profileTitle: row.profile_title,
    profileDescription: row.profile_description,
    skills: row.skills,
    portfolioLink: row.portfolio_link,
  };
}

async function currentUser(request, requiredRole) {
  const session = getSession(request);
  if (!session) return null;
  if (requiredRole && session.role !== requiredRole) return null;
  const [rows] = await getPool().execute(
    `SELECT id, name, first_name, last_name, email, contact_email,
            phone_number, address, city, country, role, profile_title,
            profile_description, skills, portfolio_link
       FROM users
      WHERE id = ?
      LIMIT 1`,
    [session.id],
  );
  return safeUser(rows[0]);
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `${PASSWORD_HASH_PREFIX}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

async function passwordMatches(stored, supplied) {
  if (!stored) return false;
  if (!stored.startsWith(`${PASSWORD_HASH_PREFIX}$`)) {
    return stored === supplied ? "legacy" : false;
  }

  const [, saltHex, digestHex] = stored.split("$");
  if (!saltHex || !digestHex || !/^[0-9a-f]+$/i.test(saltHex + digestHex)) {
    return false;
  }
  const expected = Buffer.from(digestHex, "hex");
  const actual = await scrypt(supplied, Buffer.from(saltHex, "hex"), expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function getRelatedRows(table, userId) {
  const allowedTables = new Set(["educations", "work_experience", "language"]);
  if (!allowedTables.has(table)) throw new Error("Invalid related table");
  const [rows] = await getPool().execute(
    `SELECT * FROM \`${table}\` WHERE user_id = ? ORDER BY id`,
    [userId],
  );
  if (table === "educations") {
    return rows.map(({ user_id, ...row }) => ({
      ...row,
      userId: user_id,
    }));
  }
  if (table === "work_experience") {
    return rows.map((row) => ({
      id: row.id,
      jobTitle: row.job_title,
      company: row.company,
      fromDate: row.from_date,
      toDate: row.to_date,
      description: row.description,
    }));
  }
  return rows.map(({ user_id, ...row }) => ({ ...row, userId: user_id }));
}

async function fullProfile(user) {
  const [educations, experiences, languages] = await Promise.all([
    getRelatedRows("educations", user.id),
    getRelatedRows("work_experience", user.id),
    getRelatedRows("language", user.id),
  ]);
  return { user, educations, experiences, languages };
}

async function upsertProfileField(userId, column, value) {
  const allowedColumns = new Set([
    "profile_title",
    "profile_description",
    "skills",
    "portfolio_link",
    "first_name",
    "last_name",
    "address",
    "city",
    "country",
    "contact_email",
    "phone_number",
  ]);
  if (!allowedColumns.has(column)) throw new Error("Invalid profile field");
  await getPool().execute(`UPDATE users SET \`${column}\` = ? WHERE id = ?`, [
    value,
    userId,
  ]);
}

function mapJob(row) {
  return {
    id: row.id,
    jobTitle: row.job_title || row.title,
    title: row.title || row.job_title,
    skills: row.skills,
    category: row.category,
    minBudget: row.min_budget,
    maxBudget: row.max_budget,
    budgetType: row.budget_type,
    deadline: row.deadline,
    duration: row.duration,
    experience: row.experience,
    description: row.description,
    employerId: row.employer_id,
  };
}

async function readProfileEndpoint(path) {
  const match = path.match(/^\/api\/users\/(\d+)(?:\/(profile|languages|education|experience))?$/);
  if (!match) return null;
  const [, rawId, detail] = match;
  const userId = Number(rawId);
  const [rows] = await getPool().execute(
    `SELECT id, name, first_name, last_name, email, contact_email,
            phone_number, address, city, country, role, profile_title,
            profile_description, skills, portfolio_link
       FROM users WHERE id = ? LIMIT 1`,
    [userId],
  );
  const user = safeUser(rows[0]);
  if (!user) return json({ error: "User not found" }, 404);
  if (detail === "languages") return json(await getRelatedRows("language", userId));
  if (detail === "education") return json(await getRelatedRows("educations", userId));
  if (detail === "experience") return json(await getRelatedRows("work_experience", userId));
  if (detail === "profile") return json(user);
  return json(user);
}

async function handleSignup(data, role) {
  getSessionSecret();
  const name = field(data, "name").trim();
  const email = field(data, "email").trim().toLowerCase();
  const phone = field(data, "phoneNumber").trim();
  const password = field(data, "password");
  const confirmation = field(data, "confirmPassword");
  const signupPath = role === "employer" ? "/Hire/Signup/index.html" : "/signup/signup.html";

  if (!name || !email || !password) {
    return redirect(`${signupPath}?error=InvalidSignup`);
  }
  if (password !== confirmation) {
    return redirect(`${signupPath}?error=PasswordMismatch`);
  }

  try {
    const passwordHash = await hashPassword(password);
    const [result] = await getPool().execute(
      "INSERT INTO users (name, email, phone_number, password, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone || null, passwordHash, role],
    );
    const user = { id: result.insertId, role };
    const next = role === "employer"
      ? "/Hire/Contact/index.html"
      : "/ProfileForm/WelcomePage/index.html";
    return redirect(next, { "set-cookie": sessionCookie(user) });
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      return redirect(`${signupPath}?error=EmailExists`);
    }
    throw error;
  }
}

async function handleLogin(data, role) {
  getSessionSecret();
  const email = field(data, "email").trim().toLowerCase();
  const password = field(data, "password");
  const loginPath = role === "employer" ? "/Hire/Login/index.html" : "/login/login.html";
  const [rows] = await getPool().execute(
    "SELECT id, email, password, role FROM users WHERE email = ? LIMIT 1",
    [email],
  );
  const user = rows[0];
  const matches = user && (await passwordMatches(user.password, password));
  const roleMismatch = role === "employer"
    ? user?.role !== "employer"
    : user?.role === "employer";
  if (!matches || roleMismatch) {
    return redirect(`${loginPath}?error=InvalidCredentials`);
  }

  if (matches === "legacy") {
    await getPool().execute("UPDATE users SET password = ? WHERE id = ?", [
      await hashPassword(password),
      user.id,
    ]);
  }

  const next = role === "employer"
    ? "/Hire/employeedashboard/dashboard.html"
    : "/AfterLogin/Dashboard/index.html";
  return redirect(next, { "set-cookie": sessionCookie(user) });
}

async function handleUsers(request, path, method) {
  const data = method === "GET" ? {} : await parseBody(request);
  if (method === "POST" && path === "/api/users/signup") {
    return handleSignup(data, "student");
  }
  if (method === "POST" && path === "/api/users/signup-hire") {
    return handleSignup(data, "employer");
  }
  if (method === "POST" && path === "/api/users/login") {
    return handleLogin(data, "student");
  }
  if (method === "POST" && path === "/api/users/login-hire") {
    return handleLogin(data, "employer");
  }
  if (method === "GET" && path === "/api/users/logout") {
    return text("Logged out", 200, { "set-cookie": clearSessionCookie() });
  }
  if (method === "GET" && path === "/api/users/test-session") {
    const user = await currentUser(request);
    return user
      ? text(`User session found: ${user.email}`)
      : text("No user session found", 401);
  }
  if (method === "GET" && path === "/api/users/me") {
    const user = await currentUser(request);
    return user
      ? json({ firstName: user.firstName, lastName: user.lastName })
      : json({ error: "User not logged in" }, 401);
  }
  if (method === "GET" && path === "/api/users/full-profile") {
    const user = await currentUser(request);
    return user ? json(await fullProfile(user)) : json({ error: "Not logged in" }, 401);
  }
  if (method === "GET" && path === "/api/users/all-properties") {
    const user = await currentUser(request);
    if (!user) return json({ error: "User not logged in" }, 401);
    const details = await fullProfile(user);
    if (user.role === "employer") {
      const [contacts] = await getPool().execute(
        "SELECT id, first_name, last_name, address, city, country, email, phone FROM employer_contact_info WHERE user_id = ? LIMIT 1",
        [user.id],
      );
      details.employerContact = contacts[0] || null;
    }
    return json({ ...user, ...details });
  }
  if (method === "GET" && path === "/api/users") {
    const [rows] = await getPool().execute(
      `SELECT id, name, first_name, last_name, email, contact_email,
              phone_number, address, city, country, role, profile_title,
              profile_description, skills, portfolio_link
         FROM users ORDER BY id`,
    );
    return json(rows.map(safeUser));
  }

  const userDetail = await readProfileEndpoint(path);
  if (userDetail) return userDetail;

  if (method === "POST" && path === "/api/users") {
    if (!data || typeof data !== "object" || !data.email || !data.password) {
      return json({ error: "Email and password are required" }, 400);
    }
    const password = await hashPassword(String(data.password));
    const [result] = await getPool().execute(
      "INSERT INTO users (name, email, phone_number, password, role) VALUES (?, ?, ?, ?, ?)",
      [
        data.name || null,
        String(data.email).trim().toLowerCase(),
        data.phoneNumber || null,
        password,
        data.role || "student",
      ],
    );
    const [rows] = await getPool().execute(
      `SELECT id, name, first_name, last_name, email, contact_email,
              phone_number, address, city, country, role, profile_title,
              profile_description, skills, portfolio_link
         FROM users WHERE id = ?`,
      [result.insertId],
    );
    return json(safeUser(rows[0]), 201);
  }

  const user = await currentUser(request);
  if (!user) {
    if (method === "POST" && path.startsWith("/api/users/save-")) {
      return redirect(`/login/login.html?error=LoginRequired`);
    }
    return json({ error: "User not logged in" }, 401);
  }

  if (method === "POST" && path === "/api/users/save-profile-title") {
    await upsertProfileField(user.id, "profile_title", field(data, "profileTitle"));
    return redirect("/ProfileForm/WorkExperience/index.html");
  }
  if (method === "POST" && path === "/api/users/save-profile-description") {
    await upsertProfileField(user.id, "profile_description", field(data, "profileDescription"));
    return redirect("/ProfileForm/Portfolio/index.html");
  }
  if (method === "POST" && path === "/api/users/save-skills") {
    await upsertProfileField(user.id, "skills", field(data, "skills"));
    return redirect("/ProfileForm/ProfileDescription/index.html");
  }
  if (method === "POST" && path === "/api/users/save-portfolio-links") {
    const value = field(data, "noPortfolio") === "true"
      ? "No portfolio provided"
      : field(data, "portfolio1").trim() || "No portfolio provided";
    await upsertProfileField(user.id, "portfolio_link", value);
    return redirect("/ProfileForm/Contact/index.html");
  }
  if (method === "POST" && path === "/api/users/save-contact-info") {
    const columns = [
      ["first_name", "firstName"],
      ["last_name", "lastName"],
      ["address", "address"],
      ["city", "city"],
      ["country", "country"],
      ["contact_email", "email"],
      ["phone_number", "phoneNumber"],
    ];
    for (const [column, name] of columns) {
      await upsertProfileField(user.id, column, field(data, name));
    }
    return redirect("/ProfileForm/Submitted/index.html");
  }
  if (method === "POST" && path === "/api/users/save-educations") {
    if (!Array.isArray(data)) return json({ error: "Expected an array" }, 400);
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      for (const row of data) {
        await connection.execute(
          "INSERT INTO educations (degree, institution, `year`, user_id) VALUES (?, ?, ?, ?)",
          [row.degree || null, row.institution || null, row.year || null, user.id],
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return text("Educations saved successfully");
  }
  if (method === "POST" && path === "/api/users/save-work-experiences") {
    if (!Array.isArray(data)) return json({ error: "Expected an array" }, 400);
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      for (const row of data) {
        await connection.execute(
          `INSERT INTO work_experience
             (job_title, company, from_date, to_date, description, user_id)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            row.jobTitle || null,
            row.company || null,
            row.fromDate || null,
            row.toDate || null,
            row.description || null,
            user.id,
          ],
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return text("Work experiences saved successfully");
  }
  if (method === "POST" && path === "/api/users/save-languages") {
    if (!Array.isArray(data)) return json({ error: "Expected an array" }, 400);
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      for (const row of data) {
        await connection.execute(
          "INSERT INTO language (name, proficiency, user_id) VALUES (?, ?, ?)",
          [row.name || null, row.proficiency || null, user.id],
        );
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    return text("Languages saved successfully");
  }
  if (method === "POST" && path === "/api/users/save-employer-contact") {
    if (user.role !== "employer") return json({ error: "Unauthorized" }, 403);
    await getPool().execute(
      `INSERT INTO employer_contact_info
         (user_id, first_name, last_name, address, city, country, email, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         first_name = VALUES(first_name), last_name = VALUES(last_name),
         address = VALUES(address), city = VALUES(city), country = VALUES(country),
         email = VALUES(email), phone = VALUES(phone)`,
      [
        user.id,
        data.firstName || null,
        data.lastName || null,
        data.address || null,
        data.city || null,
        data.country || null,
        data.email || null,
        data.phoneNumber || data.phone || null,
      ],
    );
    return json({ message: "Employer contact info saved successfully" });
  }
  if (method === "GET" && path === "/api/users/employer-contact") {
    if (user.role !== "employer") return json({ error: "Unauthorized" }, 403);
    const [rows] = await getPool().execute(
      `SELECT id, first_name AS firstName, last_name AS lastName,
              address, city, country, email, phone
         FROM employer_contact_info WHERE user_id = ? LIMIT 1`,
      [user.id],
    );
    return json(rows[0] || null);
  }
  if (method === "POST" && path === "/api/users/update-profile") {
    const columns = [
      ["first_name", "firstName"],
      ["last_name", "lastName"],
      ["address", "address"],
      ["city", "city"],
      ["country", "country"],
      ["contact_email", "email"],
      ["phone_number", "phoneNumber"],
    ];
    for (const [column, name] of columns) {
      await upsertProfileField(user.id, column, data[name] || "");
    }
    return text("Profile updated");
  }

  return json({ error: "Not found" }, 404);
}

async function handleJobs(request, path, method) {
  if (method === "GET" && path === "/api/jobs/all") {
    const [rows] = await getPool().execute("SELECT * FROM jobs ORDER BY id DESC");
    return json(rows.map(mapJob));
  }

  const applicantsMatch = path.match(/^\/api\/jobs\/(\d+)\/applicants$/);
  if (method === "GET" && applicantsMatch) {
    const user = await currentUser(request, "employer");
    if (!user) return json({ error: "Unauthorized" }, 403);
    const jobId = Number(applicantsMatch[1]);
    const [owned] = await getPool().execute(
      "SELECT id FROM jobs WHERE id = ? AND employer_id = ? LIMIT 1",
      [jobId, user.id],
    );
    if (!owned.length) return json({ error: "Job not found" }, 404);
    const [rows] = await getPool().execute(
      `SELECT u.id, u.first_name, u.last_name, u.profile_title,
              ja.applied_at
         FROM job_application ja
         JOIN users u ON u.id = ja.applicant_id
        WHERE ja.jobs_id = ?
        ORDER BY ja.applied_at DESC`,
      [jobId],
    );
    return json(rows.map((row) => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      profileTitle: row.profile_title,
      appliedAt: row.applied_at,
    })));
  }

  const idMatch = path.match(/^\/api\/jobs\/(\d+)$/);
  if (method === "GET" && idMatch) {
    const [rows] = await getPool().execute("SELECT * FROM jobs WHERE id = ? LIMIT 1", [
      Number(idMatch[1]),
    ]);
    return rows[0] ? json(mapJob(rows[0])) : json({ error: "Job not found" }, 404);
  }
  if (method === "DELETE" && idMatch) {
    const user = await currentUser(request, "employer");
    if (!user) return new Response(null, { status: 403 });
    const [result] = await getPool().execute(
      "DELETE FROM jobs WHERE id = ? AND employer_id = ?",
      [Number(idMatch[1]), user.id],
    );
    return result.affectedRows ? new Response(null, { status: 204 }) : new Response(null, { status: 404 });
  }
  if (method === "GET" && path === "/api/jobs/employer-jobs") {
    const user = await currentUser(request, "employer");
    if (!user) return new Response(null, { status: 403 });
    const [rows] = await getPool().execute(
      "SELECT * FROM jobs WHERE employer_id = ? ORDER BY id DESC",
      [user.id],
    );
    return json(rows.map(mapJob));
  }
  if (method === "POST" && path === "/api/jobs/submit-job") {
    const user = await currentUser(request, "employer");
    if (!user) return redirect("/Hire/Login/index.html");
    const data = await parseBody(request);
    const jobTitle = field(data, "jobTitle", field(data, "title")).trim();
    const [result] = await getPool().execute(
      `INSERT INTO jobs
         (title, job_title, description, posted_by, eligible_path_id,
          budget_type, category, deadline, duration, experience,
          max_budget, min_budget, skills, employer_id)
       VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        jobTitle || null,
        jobTitle || null,
        field(data, "description") || null,
        user.id,
        field(data, "budgetType") || null,
        fields(data, "category").join(", ") || null,
        field(data, "deadline") || null,
        field(data, "duration") || null,
        field(data, "experience") || null,
        field(data, "maxBudget") || null,
        field(data, "minBudget") || null,
        field(data, "skills") || null,
        user.id,
      ],
    );
    return redirect(`/Hire/Submitted Job/job-posted.html?jobId=${result.insertId}`);
  }
  if (method === "POST" && path === "/api/jobs/apply-job") {
    const user = await currentUser(request);
    if (!user) return redirect("/login/login.html");
    const data = await parseBody(request);
    const jobId = Number(field(data, "jobId"));
    if (!Number.isSafeInteger(jobId) || jobId <= 0) {
      return json({ error: "A valid jobId is required" }, 400);
    }
    const [jobs] = await getPool().execute("SELECT id FROM jobs WHERE id = ? LIMIT 1", [jobId]);
    if (!jobs.length) return json({ error: "Job not found" }, 404);
    const [existing] = await getPool().execute(
      "SELECT id FROM job_application WHERE jobs_id = ? AND applicant_id = ? LIMIT 1",
      [jobId, user.id],
    );
    if (!existing.length) {
      await getPool().execute(
        "INSERT INTO job_application (jobs_id, applicant_id, applied_at) VALUES (?, ?, NOW(6))",
        [jobId, user.id],
      );
    }
    return redirect("/AfterLogin/Applied%20Job/index.html");
  }
  if (method === "GET" && path === "/api/jobs/applied-jobs") {
    const user = await currentUser(request);
    if (!user) return new Response(null, { status: 401 });
    const [rows] = await getPool().execute(
      `SELECT ja.applied_at, j.*
         FROM job_application ja
         JOIN jobs j ON j.id = ja.jobs_id
        WHERE ja.applicant_id = ?
        ORDER BY ja.applied_at DESC`,
      [user.id],
    );
    return json(rows.map((row) => ({
      appliedAt: row.applied_at,
      jobs: mapJob(row),
    })));
  }
  return json({ error: "Not found" }, 404);
}

async function handleEnrollments(request, path, method) {
  const user = await currentUser(request);
  if (!user) return json({ error: "User not logged in" }, 401);
  if (method === "GET" && path === "/api/enrollments/my-courses") {
    const [rows] = await getPool().execute(
      `SELECT id, course_name AS courseName, status, enrollment_date AS enrollmentDate
         FROM enrolledcourse WHERE user_id = ? ORDER BY id DESC`,
      [user.id],
    );
    return json(rows);
  }
  if (method === "POST" && path === "/api/enrollments/enroll") {
    const data = await parseBody(request);
    const courseName = field(data, "courseName").trim();
    if (!courseName) return text("COURSE_NAME_REQUIRED", 400);
    const [rows] = await getPool().execute(
      "SELECT id FROM enrolledcourse WHERE user_id = ? AND LOWER(course_name) = LOWER(?) LIMIT 1",
      [user.id, courseName],
    );
    if (rows.length) return text("ALREADY_ENROLLED");
    await getPool().execute(
      "INSERT INTO enrolledcourse (course_name, status, enrollment_date, user_id) VALUES (?, 'In Progress', CURRENT_DATE(), ?)",
      [courseName, user.id],
    );
    return text("ENROLLED");
  }
  if (method === "POST" && path === "/api/enrollments/complete-by-name") {
    const data = await parseBody(request);
    const courseName = field(data, "courseName");
    const [result] = await getPool().execute(
      "UPDATE enrolledcourse SET status = 'Complete' WHERE user_id = ? AND course_name LIKE ? LIMIT 1",
      [user.id, `%${courseName}%`],
    );
    return result.affectedRows
      ? text("Course marked as complete")
      : text("Course not found", 404);
  }
  if (method === "POST" && path === "/api/enrollments/complete") {
    const data = await parseBody(request);
    const courseId = Number(field(data, "courseId"));
    await getPool().execute(
      "UPDATE enrolledcourse SET status = 'Complete' WHERE id = ? AND user_id = ?",
      [courseId, user.id],
    );
    return redirect("/AfterLogin/My%20Courses%20In%20Progress/index.html");
  }
  return json({ error: "Not found" }, 404);
}

async function handleUpload(request) {
  const user = await currentUser(request);
  if (!user) return text("User not logged in", 401);
  const data = await request.formData();
  const file = data.get("file");
  if (!file || typeof file.arrayBuffer !== "function") return text("File is required", 400);
  if (file.size === 0) return text("File is empty", 400);
  if (file.size > MAX_UPLOAD_BYTES) {
    return text("File exceeds Netlify Functions' supported upload size", 413);
  }

  const originalName = String(file.name || "upload").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const key = `${user.id}/${Date.now()}-${randomBytes(8).toString("hex")}-${originalName}`;
  const store = getStore("careerweg-uploads");
  await store.set(key, await file.arrayBuffer(), {
    metadata: {
      contentType: file.type || "application/octet-stream",
      userId: String(user.id),
      fileName: originalName,
    },
  });
  return text(`File uploaded successfully: ${originalName}`);
}

function isUnsafeCrossSiteMutation(request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase())) return false;
  if (request.headers.get("sec-fetch-site") === "cross-site") return true;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== new URL(request.url).host;
  } catch {
    return true;
  }
}

export default async function handler(request) {
  if (isUnsafeCrossSiteMutation(request)) {
    return json({ error: "Cross-site request rejected" }, 403);
  }

  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();

  try {
    if (path === "/upload-skill-file" && method === "POST") {
      return await handleUpload(request);
    }
    if (path === "/session/user" && method === "GET") {
      const user = await currentUser(request);
      return json({ name: user?.name || "Guest" });
    }
    if (path.startsWith("/api/users")) return await handleUsers(request, path, method);
    if (path.startsWith("/api/jobs")) return await handleJobs(request, path, method);
    if (path.startsWith("/api/enrollments")) {
      return await handleEnrollments(request, path, method);
    }
    return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error("CareerWeg function request failed", error?.code || error?.name || "Error");
    return json({ error: "The request could not be completed" }, 500);
  }
}

export const config = {
  path: ["/api/*", "/session/*", "/upload-skill-file"],
};
