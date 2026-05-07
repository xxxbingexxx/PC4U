# PC4U

> Submit your PC specs, get personalized upgrade recommendations, price comparisons, and a future upgrade plan — all in one place.

**Team:** Zhibin Wang · Pengyu Wang · Mayeeduz Zaman · ~~Kenny Nguyen~~ *(former)*

---

## Table of Contents

- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)
- [How to Run Locally](#how-to-run-locally)
- [How to Test](#how-to-test)
- [How to Deploy](#how-to-deploy)
- [Making Changes](#making-changes)
- [Integrations](#integrations)

---

## Project Overview

PC4U is a web application designed to help everyday users figure out how to upgrade their PCs, without needing to be a tech expert. Users submit their current computer specifications, and the site analyzes them to recommend exactly what to upgrade, where to get it at an affordable price, and when to think about upgrading again in the future.

The project was built as a class assignment, but is designed and developed with real-world quality in mind. The target audience is casual to mid-level PC users (particularly gamers) who want personalized hardware recommendations without the guesswork.

Core features include spec-based upgrade recommendations, price discovery, and forward-looking upgrade planning.

---

## Project Structure

```
mission-vision-and-success/
├── source/                        # All source code lives here
│   ├── index.html                 # Main entry point / homepage
│   ├── layout.css                 # Global layout styles
│   ├── .env.local                 # Local environment variables (API keys — do NOT commit to GitHub)
│   │
│   ├── about/                     # About page
│   │   ├── about.html
│   │   └── layout.css
│   │
│   ├── builds/                    # Builds/products page
│   │   ├── builds.html
│   │   └── layout.css
│   │
│   ├── discussion/                # Community discussion board
│   │   ├── discussion.html        # Discussion listing page
│   │   ├── discussion.css
│   │   ├── create_post.html       # New post form
│   │   └── post.html              # Individual post view
│   │
│   ├── help/                      # Help/FAQ page
│   │   ├── help.html
│   │   └── layout.css
│   │
│   ├── login/                     # Login page
│   │   ├── login.html
│   │   └── layout.css
│   │
│   ├── question/                  # Question/quiz page
│   │   ├── question.html
│   │   └── layout.css
│   │
│   ├── results/                   # Results page
│   │   └── results.html
│   │
│   ├── js/                        # All JavaScript logic
│   │   ├── app-config.js          # Environment toggle (local vs. Netlify) — do NOT modify
│   │   ├── app.js                 # Main app initialization
│   │   ├── main.js                # Shared entry logic
│   │   ├── login-common.js        # Auth0 login/logout shared logic
│   │   ├── supabase-client.js     # Supabase client initialization
│   │   ├── discussion.js          # Discussion board logic
│   │   ├── create-post.js         # Post creation logic
│   │   ├── post-detail.js         # Single post view logic
│   │   ├── posts-common.js        # Shared post utilities
│   │   └── results.js             # Results page logic
│   │
│   ├── images/                    # All image assets (logos, profile photos, etc.)
│   │
│   └── public/
│       └── auth_config.json       # Auth0 configuration
│
├── biography/                     # Team member bio text files (internal)
├── package.json                   # Project metadata and dependency list
├── vite.config.js                 # Vite build configuration
├── netlify.toml                   # Netlify deployment configuration
└── README.md
```

---

## Dependencies

| Package | Type | Purpose |
|---|---|---|
| `@auth0/auth0-spa-js` ^2.8.0 | Runtime | User authentication (login/logout) |
| `@supabase/supabase-js` ^2.84.0 | Runtime | Database and backend integration |
| `vite` ^7.3.1 | Dev only | Local dev server and production build tool |
| Node.js | Tool | Required to run npm and Vite |

Install all dependencies with:

```bash
npm install
```

---

## How to Run Locally

### 1. Clone the Repository

```bash
git clone https://gitlab.cci.drexel.edu/cid/2526/fw1023/a6/mission-vision-and-success.git
cd mission-vision-and-success
```

> You can find the repo URL on the GitLab repository page under the **"Clone"** button.

---

### 2. Install Node.js

If you don't have Node.js installed:

1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS version** (recommended)
3. Run the installer and follow the prompts
4. Verify installation by opening a terminal and running:

```bash
node -v
npm -v
```

Both commands should print a version number.

---

### 3. Open the Project in an IDE

Open **Visual Studio Code** (or any editor of your choice):

- In VS Code: `File → Open Folder` → select the project folder
- Or from the terminal: `code .`

---

### 4. Install Project Dependencies

Open a terminal inside the project folder and run:

```bash
npm install
```

#### ⚠️ Windows: Script Execution Error

If you see this error on Windows:

```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running
scripts is disabled on this system.
```

This is a PowerShell execution policy issue. Fix it with one of these options:

**Option A — Fix PowerShell execution policy (recommended, one-time fix):**

1. Open **PowerShell as Administrator** (search "PowerShell" → right-click → "Run as administrator")
2. Run:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```
3. Type `Y` and press Enter to confirm
4. Close and reopen your terminal, then retry `npm install`

**Option B — Use Command Prompt (cmd) instead of PowerShell:**

1. In VS Code, open the terminal dropdown (`▾` next to `+` in the terminal panel)
2. Select **Command Prompt**
3. Run `npm install` again

---

### 5. Start the Development Server

```bash
npm run dev
```

The project should now be running locally. Open your browser and go to the URL shown in the terminal (typically `http://localhost:5173` or `http://localhost:3000`).

---

## How to Test

There are no automated tests in this project. Testing is done manually using one of two approaches:

**Option A — Live coding on the local dev server (recommended):**

Run `npm run dev` and open the local URL in your browser. Changes to source files will hot-reload automatically via Vite, so you can see updates in real time without restarting.

**Option B — Build and preview before deploying:**

```bash
npm run build
npm run preview
```

This compiles the project into the `/dist` folder and serves it locally so you can verify the production build behaves as expected before pushing.

---

## How to Deploy

This project is deployed via **Netlify**, connected to a mirrored GitHub repository ([xxxbingexxx/PC4U](https://github.com/xxxbingexxx/PC4U)) since GitLab is not directly supported by Netlify. Any changes pushed to that GitHub repo are **automatically** deployed to Netlify.

### Deployment Workflow

1. Make and test your changes locally (see [How to Test](#how-to-test))
2. Push changes to the GitLab repo as normal (this is where all active development happens)
3. Once per week, a designated team member (usually **Zhibin Wang**) syncs the latest changes from GitLab to the GitHub mirror repo (`xxxbingexxx/PC4U`)
4. Netlify will automatically detect the push to GitHub and redeploy

> **Why weekly?** Netlify free accounts have build limits, so we batch updates to avoid hitting them unnecessarily. Do not push directly to the GitHub mirror repo unless you are the designated person for that week.

### ⚠️ Important: Environment Variables & Config

**`.env.local` file:**
- This file exists **only in the GitLab repo** for local development
- It contains sensitive API keys (Vite environment variables) and should **never be committed to the GitHub repo or shared publicly**
- On Netlify, these keys are configured as secret environment variables in the Netlify dashboard — no action needed on your part

**`app-config.js`:**

```js
export const APP_CONFIG = {
  USE_LOCAL_AUTH: true,
};
```

- This flag controls whether the app uses the local `.env.local` file or Netlify's environment variables
- **Do not change this value.** It is pre-configured to work correctly in both local and deployed environments automatically

---

## Making Changes

### Creating a Branch

Create a new branch each week for your work. Never commit directly to `main`.

```bash
git checkout -b YourName_Week4
git push -u origin YourName_Week4
```

### Branch Naming

Branch naming is not strictly enforced, but the recommended convention is `Name_Identifier` where the identifier can be a week number, feature name, or ticket reference. For example: `ZhibinWang_Week4` or `Pengyu_DiscussionFeature`.

### Committing Changes

To preserve the integrity of `main`, all changes should be committed to your local branch first and reviewed by another team member before merging — unless the change is very minor (e.g., a typo fix).

**Commit message format: `#TicketNumber: Ticket Title`**

```
#75: Finding Discussion Posts - Enable "Enter" Button
```

### Merging to Main

Merging can be handled in one of two ways:

**Option A — Merge Request (preferred for larger changes):**
Submit a merge request on GitLab targeting `main`. A teammate reviews and approves it before the merge goes through.

**Option B — Reviewer merges directly:**
If no formal merge request is opened, the person who reviewed the code can merge the branch into `main` themselves after approving the changes.

---

## Integrations

| Service | Purpose |
|---|---|
| **Auth0** | Handles user authentication via `@auth0/auth0-spa-js`. Manages login, logout, and session tokens. |
| **Supabase** | Backend-as-a-service via `@supabase/supabase-js`. Used for database storage and queries. |

Both Auth0 and Supabase require configuration through their respective web dashboards. The accounts are owned by **Zhibin Wang**. Please reach out to him for any configuration changes, access, or credential issues.

---

_Last updated: 02/21/2026 by Zhibin Wang | Maintained by PC4U Team_