# 🎟️ QuickTicket

QuickTicket is a full-stack event ticketing platform where Hosts can create events and Customers can log in, request tickets, and receive a secure QR code. Each ticket can only be used once, and authentication is role-based with secure cookie-based JWT.

## 🚀 Live Links

- 🌐 Frontend: [https://quickticket.netlify.app](https://quickticket.netlify.app)
- 🛠️ Backend: [https://quickticket-api.onrender.com](https://quickticket-api.onrender.com)

> ⚠️ **IMPORTANT:** If using the frontend, please **visit the backend URL once manually** to wake up the Render server.
>
> Wait **~60 seconds** before using the frontend, as Render free-tier instances may take time to start.

---

## 🧠 Features

- 🔐 **Authentication** via JWT and HTTP-only cookies
- 📬 **OTP-based password recovery** through email
- 👤 Role-based access: `Host` and `Customer`
- 📅 Hosts can create events with capacity, price, and time
- 🎫 Customers get **unique QR-coded tickets**
- 📷 Hosts can **scan and validate tickets** — one-time use only
- 🎨 Beautiful, responsive UI with Tailwind CSS & DaisyUI

---

## 🛠️ Tech Stack

| Frontend        | Backend       | Database    | Deployment      |
|----------------|---------------|-------------|-----------------|
| React, Axios, DaisyUI, Vite | Express, Node.js | PostgreSQL (AWS RDS) | Netlify (FE), Render (BE) |

---

## 📂 Project Structure

### 🔧 Backend (`/backend`)
- `/routes` – Auth, Event, Ticket routes
- `/middleware` – Auth protection, role checking
- `/utils` – JWT, Email OTP service
- `/db.js` – PostgreSQL pool

### 💻 Frontend (`/frontend`)
- `AuthContext.jsx` – Global auth state
- `LoginPage.jsx`, `SignupPage.jsx` – Auth pages
- `EventCreatePage.jsx`, `TicketPage.jsx` – Core functionality
- `SettingsPage.jsx` – Profile update, change password, delete account
- DaisyUI + Tailwind for styling

---

## ⚙️ Getting Started Locally

1. **Clone the repo**:
   ```bash
   git clone https://github.com/yourusername/quickticket.git
   cd quickticket
