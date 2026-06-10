# YOURCRM
> A modern CRM dashboard for managing leads, deals, and customer relationships.
> Built by Vishal — Full Stack Internship Assignment

### Tech Stack
- MongoDB Atlas, Express.js, React.js (Vite), Node.js
- JWT Authentication, Mongoose ODM, Tailwind CSS, Recharts

### Features
- JWT login/register with protected routes
- Contact management with notes and reminders
- Kanban deal pipeline with drag and drop
- Activity logging
- Dark/light theme
- Deployment ready (Vercel + Render + MongoDB Atlas)

### Setup
1. Clone the repo
2. Run: `npm run install:all`
3. Add `.env` to `/server` (copy from `.env.example`)
4. Add `.env` to `/client` (copy from `.env.example`)
5. (Optional) Run `npm run seed` to populate local MongoDB with mock contacts, deals, and activities (Default user: `vishal@yourcrm.com` / `password123`)
6. Run: `npm run dev`

### API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| **POST** | `/api/auth/register` | Register a new user | No |
| **POST** | `/api/auth/login` | Login user and return token | No |
| **GET** | `/api/contacts` | Retrieve contacts (optional `status` query filter) | Yes |
| **POST** | `/api/contacts` | Create a new contact | Yes |
| **PUT** | `/api/contacts/:id` | Update contact | Yes |
| **DELETE**| `/api/contacts/:id` | Delete contact | Yes |
| **POST** | `/api/contacts/:id/notes` | Add a note to a contact | Yes |
| **PUT** | `/api/contacts/:id/reminder` | Set or update reminder for a contact | Yes |
| **GET** | `/api/deals` | Retrieve all deals | Yes |
| **POST** | `/api/deals` | Create a new deal | Yes |
| **PUT** | `/api/deals/:id` | Update a deal (stage, etc.) | Yes |
| **DELETE**| `/api/deals/:id` | Delete a deal | Yes |
| **GET** | `/api/activities` | Retrieve all logged activities | Yes |
| **POST** | `/api/activities` | Log a new activity | Yes |
| **GET** | `/api/stats` | Retrieve aggregate metrics for the dashboard | Yes |

### Scalability Notes
- Replace JWT with refresh token rotation for production
- Add role-based access control (admin/member)
- Add pagination on all list endpoints
- MongoDB Atlas scales horizontally — no migration needed
- Add Redis for session caching at scale

### Screenshots
[Add screenshots here]
