# Traders Lab

> **A professional trading journal and performance analytics platform built for traders who want to plan, track, review, and improve their trading.**

Traders Lab is a trading-performance SaaS prototype focused on helping traders build consistency through structured journaling, performance tracking, and data-driven review.

The V1 release is built entirely on the frontend with browser-based storage, allowing users to create accounts, maintain isolated trading journals, analyze their performance, and export their records.

---

## Product Philosophy

Traders Lab is built around a simple cycle:

**Plan → Trade → Journal → Review → Analyze → Improve**

The goal isn't to overwhelm traders with unnecessary tools.

Instead, Traders Lab focuses on helping traders answer important questions:

* Am I actually profitable?
* Which pairs perform best for me?
* Which setups produce my best results?
* What is my win rate?
* How consistent am I?
* How does my risk management affect my results?
* Am I improving over time?

---

## Features

### Authentication

* User registration
* User login
* Session management
* Protected application pages
* Logout
* User-specific identity across the application
* Multi-user data isolation

### Trading Journal

* Add trades
* Edit trades
* Delete trades
* Trade validation
* Trade outcomes
* Risk/result tracking in R
* Setup tracking
* Pair tracking
* Direction tracking
* Trade screenshots
* Screenshot preview
* Screenshot lightbox
* Persistent journal storage

### Journal Management

* Today
* Yesterday
* This week
* Last week
* This month
* Last month
* All trades

### Data Export & Import

* JSON backup
* JSON restore
* CSV export
* PDF journal reports
* Settings-based journal export/import

### Dashboard

* Overall trading performance
* Win rate
* Total trades
* Net R
* Average R
* Recent trades
* Pair performance
* Daily performance calendar
* Trading Pulse
* Performance period comparison

### Performance Analytics

* Performance overview
* Trade analysis
* Trading rhythm
* Pair performance
* Setup performance
* Direction analysis
* Timing analysis
* Weekday analysis
* Risk analysis
* Period-based performance analysis

### Settings

* Profile information
* Account & security
* Trading preferences
* Journal preferences
* Data management
* PDF export
* Journal import
* Clear journal data
* Product information

### Team

The Team area is intentionally presented as **Coming Soon** in V1.

Real team collaboration, shared workspaces, backend synchronization, and other collaborative functionality are planned for V2.

---

## Tech Stack

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript

### Browser APIs

* LocalStorage
* File API
* FormData
* Fetch API
* Print API
* Web Crypto API (`crypto.randomUUID()`)

### External Services

* Web3Forms — contact form email delivery

---

## Architecture

Traders Lab V1 uses a lightweight frontend architecture.

```text
Traders Lab
│
├── Public Landing Page
│
├── Authentication
│   ├── Sign Up
│   ├── Login
│   └── Session
│
└── Application
    ├── Dashboard
    ├── Journal
    ├── Performance
    ├── Analytics
    ├── Team
    └── Settings
```

### User Data Isolation

Each user's journal is stored under a user-specific LocalStorage key:

```text
tradersLabTrades_<userId>
```

This allows multiple accounts to use the same browser while keeping their journal data separated within the V1 prototype.

User accounts and sessions are stored separately:

```text
tradersLabUsers
tradersLabSession
```

---

## Project Structure

```text
traders-lab/
│
├── index.html
├── login.html
├── signup.html
├── dashboard.html
├── journal.html
├── performance.html
├── analytics.html
├── team.html
├── settings.html
│
├── css/
│   ├── style.css
│   ├── auth.css
│   ├── dashboard.css
│   ├── journal.css
│   ├── performance.css
│   ├── analytics.css
│   └── settings.css
│
├── js/
│   ├── main.js
│   ├── auth.js
│   ├── dashboard.js
│   ├── journal.js
│   ├── performance.js
│   ├── analytics.js
│   ├── settings.js
│   ├── contact.js
│   └── pdf-export.js
│
└── assets/
    └── ...
```

*The exact file structure may vary depending on the current deployment.*

---

##  Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/traders-lab.git
```

### 2. Open the project

```bash
cd traders-lab
```

### 3. Run locally

Because Traders Lab is a frontend application, it can be run using a simple local development server.

For example, with VS Code and Live Server:

```text
Right click index.html
→ Open with Live Server
```

Or use any static web server of your choice.

---

## Environment

Traders Lab V1 does not require a backend or database.

The application currently stores data in the browser using LocalStorage.

This makes V1 simple to deploy and test while providing the foundation for the future backend architecture.

---

## V1 Security Notice

Traders Lab V1 is a **frontend prototype** and is not intended to handle production-sensitive authentication data.

For the V1 prototype:

* User accounts are stored in LocalStorage.
* Passwords are stored client-side.
* Sessions are stored in LocalStorage.
* Journal data is stored locally in the browser.

This architecture is intentionally temporary.

### V2 Security Architecture

The planned V2 architecture will introduce:

* Backend authentication
* Password hashing
* Secure sessions/tokens
* Database storage
* Server-side authorization
* Cloud data synchronization
* Secure user data isolation
* Production-grade security

**Do not use sensitive or real production credentials with the current V1 authentication system.**

---

## V1 Scope

Traders Lab V1 intentionally focuses on the core trading journal and performance experience.

### Included

* Authentication
* Journal
* Dashboard
* Performance
* Analytics
* Settings
* Data export/import
* User-specific local data
* Responsive interface

### Deferred to V2

* Backend
* Database
* Cloud synchronization
* Real team collaboration
* Shared workspaces
* Production authentication
* Server-side security
* Advanced account management
* Additional SaaS infrastructure

---

## Design Direction

Traders Lab was designed around a premium SaaS aesthetic rather than a traditional trading dashboard.

The interface focuses on:

* Clear typography
* Strong visual hierarchy
* Generous spacing
* Subtle depth
* Restrained motion
* Meaningful data visualization
* Responsive layouts
* Professional interactions

The design intentionally avoids the typical:

* Neon trading-dashboard aesthetic
* Excessive gradients
* Crypto-bro visuals
* Overloaded dashboards
* Artificial AI-generated appearance

The goal is to make Traders Lab feel like a **real financial productivity product**.

---

## Responsive Design

Traders Lab is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile devices

Mobile testing is part of the final V1 quality-assurance process.

---

## Current Status

**Traders Lab V1 — Complete**

The current V1 has completed its core development and functional testing.

### Status

* ✅ Public landing page
* ✅ Authentication
* ✅ User identity
* ✅ Multi-user journal isolation
* ✅ Trading journal
* ✅ Dashboard
* ✅ Performance analytics
* ✅ Advanced analytics
* ✅ Settings
* ✅ Data export/import
* ✅ Contact form
* ✅ Responsive styling
* ✅ Functional QA
* 🔄 Final mobile QA
* ⏳ V2 backend development

---

## ✦ Roadmap

### V1 — Foundation

**Completed**

A complete frontend trading journal and analytics experience.

### V2 — Backend

Planned:

```text
Frontend
    ↓
Backend API
    ↓
Authentication
    ↓
Database
    ↓
Cloud Storage
```

V2 will transform Traders Lab from a browser-based prototype into a real multi-user SaaS platform.

Future functionality may include:

* Cloud-synced journals
* Secure authentication
* User profiles
* Team workspaces
* Trader collaboration
* Accountability systems
* Shared performance analytics
* Advanced reporting
* Persistent cloud backups

---

## Why Traders Lab?

Most trading platforms focus heavily on charts, indicators, and execution.

Traders Lab focuses on something different:

**the trader's process.**

The platform is designed to help traders move from simply taking trades to understanding their performance.

Because improvement requires more than finding setups.

It requires collecting data, reviewing decisions, identifying patterns, and continuously improving the process.

---

## Author

**Enummanuel**

Trader • Software Developer • Founder of Traders Lab

Traders Lab was created from the perspective of an active trader who wanted a cleaner and more structured way to track, analyze, and improve trading performance.

---

## License

This project is currently a private/personal project.

All rights reserved unless otherwise stated.
