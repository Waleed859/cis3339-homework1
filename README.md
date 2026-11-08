# CIS 3339 Homework 1

A Vue 3 student, course, and enrollment manager backed by a local MongoDB database.

## Requirements

- Node.js 20.19+ and npm
- MongoDB Community Edition running locally on port 27017

On Windows, start MongoDB from **Services** if it was installed as a service. Otherwise, start `mongod` using the data directory you configured when installing MongoDB. No database creation, migration, or seed command is needed.

The included real `.env` file contains:

```text
MONGODB_URI=mongodb://127.0.0.1:27017/cis3339_homework1
```

MongoDB creates the database when data is first saved. Mongoose creates the unique indexes during normal server startup.

## Install, build, and run

From the `cis3339-homework1` folder in PowerShell:

```powershell
npm run install:all
npm run build
npm start
```

Use `npm run install:all` for this project; there is no `npm run install` script. The install command uses npm in both `backend` and `frontend`.

Open **http://localhost:3000**. Express serves the production Vue build and its API on that same address. Refreshing `/students`, `/courses`, or `/enrollments` works.

The `npm run build` command builds the frontend. Rebuild after frontend changes. For frontend development, run `npm run dev --prefix frontend`; the production workflow above is the one to use for grading.

## Features

- **Students:** Add a student with name, ID, phone, and ZIP; search by name; view records; delete a student and their enrollments.
- **Courses:** Add, list, and delete courses. Deleting a course removes its enrollments.
- **Enrollments:** Choose an existing student and course, enroll once, and select a course to see its student roster.

Vue 3 Composition API drives all pages, Vue Router handles the three URLs, and a Pinia store shares current student and course lists between pages. Express provides JSON REST routes under `/api`. Mongoose stores all records in MongoDB. Unique indexes reject duplicate student IDs, course IDs, and student/course pairs.

If startup reports a MongoDB connection error, make sure the local MongoDB service is running and that the URI in `.env` points to it.
