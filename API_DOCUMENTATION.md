# Job Platform API Documentation

This document provides a comprehensive overview of all API endpoints available in the Job Platform backend. It details the expected requests (headers, parameters, and bodies) and the responses returned by each endpoint.

## Base URL
All routes are prefixed with their respective router paths as defined in `server.js`. The default port is `5000`.
Assuming local development, the base URL is: `http://localhost:5000`

---

## Authentication & Authorization

Protected routes require an Authorization header with a Bearer token:
`Authorization: Bearer <your_jwt_token>`

Some routes are restricted to specific roles: `admin`, `manager`, or `client`.

---

## 1. Auth Routes (`/auth`)
Handles user registration and login. No authentication required.

### 1.1 Register User
- **Endpoint:** `POST /auth/register`
- **Description:** Registers a new user. If the role is `manager`, it also automatically creates an associated company profile.
- **Request Body (JSON):**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword",
    "role": "client" // or "manager"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "message": "User registered successfully"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{ "message": "User already exists" }`

### 1.2 Login User
- **Endpoint:** `POST /auth/login`
- **Description:** Authenticates a user and returns a JWT token. The role provided must match the user's registered role.
- **Request Body (JSON):**
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword",
    "role": "client" // or "manager", "admin"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "client"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{ "message": "Invalid credentials" }`

---

## 2. Jobs Routes (`/jobs`)
Handles job postings.

### 2.1 Get All Jobs
- **Endpoint:** `GET /jobs`
- **Description:** Retrieves a list of all jobs.
- **Authentication:** Not required.
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "title": "Software Engineer",
      "company_id": 2,
      ...other_job_fields
    }
  ]
  ```

### 2.2 Get Job by ID
- **Endpoint:** `GET /jobs/:id`
- **Description:** Retrieves a specific job by its ID.
- **Authentication:** Not required.
- **Success Response (200 OK):**
  ```json
  {
    "id": 1,
    "title": "Software Engineer",
    ...other_job_fields
  }
  ```

### 2.3 Create Job
- **Endpoint:** `POST /jobs`
- **Description:** Creates a new job posting associated with the manager's company.
- **Authentication:** Required (Role: `manager`)
- **Request Body (JSON):**
  ```json
  {
    "title": "Software Engineer",
    "description": "Job description here...",
    "location": "New York, NY",
    "salary": "100000"
    // ...other job details
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "message": "Job created successfully",
    "jobId": 1
  }
  ```

### 2.4 Update Job
- **Endpoint:** `PUT /jobs/:id`
- **Description:** Updates an existing job. Only the manager of the company that posted the job can update it.
- **Authentication:** Required (Role: `manager`)
- **Request Body (JSON):** Any fields needing update.
- **Success Response (200 OK):**
  ```json
  {
    "message": "Job updated successfully"
  }
  ```

### 2.5 Delete Job
- **Endpoint:** `DELETE /jobs/:id`
- **Description:** Deletes a job. Only the manager of the company that posted the job can delete it.
- **Authentication:** Required (Role: `manager`)
- **Success Response (200 OK):**
  ```json
  {
    "message": "Job deleted successfully"
  }
  ```

---

## 3. Application Routes (`/applications`)
Handles applying for jobs and managing applications.

### 3.1 Apply for a Job
- **Endpoint:** `POST /applications`
- **Description:** Submits a job application. Uploads an optional resume via `multipart/form-data`.
- **Authentication:** Required (Role: `client`)
- **Request Format:** `multipart/form-data`
- **Form Data Fields:**
  - `job_id`: Number/String (Required)
  - `cover_letter`: String (Optional)
  - `resume`: File (Optional - Uploaded to Cloudinary)
- **Success Response (201 Created):**
  ```json
  {
    "message": "Application submitted successfully",
    "applicationId": 12
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{ "message": "Already applied for this job" }`

### 3.2 Get My Applications
- **Endpoint:** `GET /applications/my`
- **Description:** Retrieves all applications submitted by the logged-in client.
- **Authentication:** Required (Role: `client`)
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": 12,
      "job_id": 1,
      "status": "pending",
      "cover_letter": "...",
      "resume_url": "https://res.cloudinary.com/..."
    }
  ]
  ```

### 3.3 Get Applications for a Job
- **Endpoint:** `GET /applications/job/:id`
- **Description:** Retrieves all applications for a specific job. Only accessible by the manager whose company posted the job.
- **Authentication:** Required (Role: `manager`)
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": 12,
      "user_id": 3,
      "cover_letter": "...",
      ...
    }
  ]
  ```

### 3.4 Update Application Status
- **Endpoint:** `PUT /applications/:id`
- **Description:** Updates the status of an application (e.g., to "accepted", "rejected") and sends an email notification to the user.
- **Authentication:** Required (Role: `manager`)
- **Request Body (JSON):**
  ```json
  {
    "status": "accepted"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Application status updated successfully"
  }
  ```

---

## 4. User Routes (`/users`)
Handles client profile management.

### 4.1 Get Profile
- **Endpoint:** `GET /users/profile`
- **Description:** Retrieves the profile of the currently logged-in client.
- **Authentication:** Required (Role: `client`)
- **Success Response (200 OK):**
  ```json
  {
    "id": 3,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "resume_url": "https://..."
  }
  ```

### 4.2 Update Profile
- **Endpoint:** `PUT /users/profile`
- **Description:** Updates the user's profile. Can handle resume uploads.
- **Authentication:** Required (Role: `client`)
- **Request Format:** `multipart/form-data`
- **Form Data Fields:**
  - `name`: String
  - `resume`: File (Optional - Uploaded to Cloudinary)
- **Success Response (200 OK):**
  ```json
  {
    "message": "Profile updated successfully"
  }
  ```

---

## 5. Company Routes (`/company`)
Handles company profile management for managers.

### 5.1 Get Profile
- **Endpoint:** `GET /company/profile`
- **Description:** Retrieves the profile of the company associated with the logged-in manager.
- **Authentication:** Required (Role: `manager`)
- **Success Response (200 OK):**
  ```json
  {
    "id": 1,
    "name": "Tech Corp",
    "logo_url": "https://...",
    ...
  }
  ```

### 5.2 Update Profile
- **Endpoint:** `PUT /company/profile`
- **Description:** Updates the company's profile. Can handle company logo uploads.
- **Authentication:** Required (Role: `manager`)
- **Request Format:** `multipart/form-data`
- **Form Data Fields:**
  - `name`: String
  - `description`: String
  - `logo`: File (Optional - Uploaded to Cloudinary)
- **Success Response (200 OK):**
  ```json
  {
    "message": "Company profile updated successfully"
  }
  ```

---

## 6. Admin Routes (`/admin`)
Platform-wide administration capabilities.

### 6.1 Get All Companies
- **Endpoint:** `GET /admin/companies`
- **Description:** Retrieves all companies on the platform.
- **Authentication:** Required (Role: `admin`)
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "name": "Tech Corp",
      ...
    }
  ]
  ```

### 6.2 Get Platform Revenue
- **Endpoint:** `GET /admin/revenue`
- **Description:** Retrieves platform revenue metrics. Currently uses mock data.
- **Authentication:** Required (Role: `admin`)
- **Success Response (200 OK):**
  ```json
  [
    {
      "company_id": 1,
      "company_name": "Tech Corp",
      "revenue": 5000
    }
  ]
  ```

### 6.3 Approve Company
- **Endpoint:** `PUT /admin/companies/:id/approve`
- **Description:** Approves a company to operate on the platform.
- **Authentication:** Required (Role: `admin`)
- **Success Response (200 OK):**
  ```json
  {
    "message": "Company approved successfully"
  }
  ```
