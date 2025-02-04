<p align="center">
  <a href="https://trustmedis.com" target="blank"><img src="https://trustmedis.com/wp-content/uploads/2020/03/Brand-Guideline-trustmedis-1.png.webp" width="200" alt="Trustmedis Logo" /></a>
</p>

# Trusmedis Sign(E-SIGN)

This repository contain the codebase for Trustmedis Sign Apps with codename E-Sign. Which will become module or complementary product for the main HIS product. E-sign build to provide better document management, and manage document authenticity and security through digital signature that integrate HIS data to [PERURI](https://www.peruri.co.id/).

## Table of Contents

- [Project Setup](#setup)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#configuration)
- [Changelog](#changelog)

## Setup

### Prerequisites

- [bun](https://bun.sh/):
- [docker](https://www.docker.com/) (optional, for containerized setup)
- [OrbStack](https://orbstack.dev/) (optional): Alternative to Docker desktop to manage your docker image, container, volume, etc.
- [PostgreSQL](https://www.postgresql.org/) (version 15): Main database for e-sign

### Setup Instructions

1. Clone the repository:

```bash
git clone https://gitlab.trustmedis.com/trustmedis/engineering/esign.git
cd esign
```

2. Install dependencies:

```bash
bun install
```

3. Set up environment variables: Fill in the necessary variables as mentioned in [Configuration](#configuration)

```bash
cp .env.example .env
```

## Usage

To start the development server, run:

```bash
bun dev
```

This will start the Remix dev server and open the app at `http://localhost:5173`

### Build for production:

```bash
bun build
```

### What's in the stack

- Styling with [Tailwind](https://tailwindcss.com/)
- Linting with [ESLint](https://eslint.org)
- Static Types with [TypeScript](https://typescriptlang.org)
- Enable file or directory based routing in remix with [remix-flat-routes](https://github.com/kiliman/remix-flat-routes)
- Production ready and one of the most complete UI library for react [Mantine UI](https://mantine.dev/)
- Database ORM with [Prisma](https://www.prisma.io/)
- Reliable and robust database systems with [PostgreSQL](https://www.postgresql.org/)

## Configuration

The following environment variables are required for the project. Add them to a `.env` file in the root directory:

| Key              | Description                   | Default     | Required | Deprecated |
| ---------------- | ----------------------------- | ----------- | -------- | ---------- |
| `SESSION_SECRET` | Secret key to encrypt session | SUPERSECRET | &check;  |            |

## Contributing

**1. Branch Naming Convention**

- Use task code as branch names.
- Format: `{type}/{task-code}-{name/description}` (e.g., `feat/ESIGN-001`).
  Below are type of branch

| Type   | Description                                                                                                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| feat   | Use for ticket or task that introduce new feature or change to existing featu                                                                    |
| fix    | Use for bug ticket, tech debt, or fixing that are not urgently needed to deploy to p                                                             |
| hotfix | Use for bug ticket or fixing that are urgently needed to deploy to                                                                               |
| chore  | Use this when we are just doing some minor lib update, delete, or removing something unnecessary without impacting main functionality or feature |
| docs   | Use when updating project documentation that doesn't impacting apps functionality                                                                |

**2. Commit Messages:**

- Use clear, concise messages that describe the change.
- add prefix to indicate type of the change just like the branch
- add task code to indicate the change belong to which task
- Example:
  - `feat(esign-007): Add validation for employee email`
  - `feat(esign-007):Create migration file to create employees table`

**3. Update the changelog**

- Update any update in sprint week into unreleased tag.
- Try to make the changelog clear, or just copy from commit message.
- Add task number add link into task.

**4. Merge Requests:**

- Ensure all changes are made in feature branches.
- Create a merge request (MR) from your feature branch to the `develop` branch.
- Add a detail description of the changes (just make it same as changelog).

**5. Code Reviews:**

- Code reviews are optional for now. Due to lack of resource. Please be kind to your code and careful.

### Deployment

- All merge request must be merged into the `develop` branch before they can be deployed to the `staging` environment.
- Only the project lead that will have authority to merge into the `staging` & `main` branch after testing and approval from QA Engineer and Product Owner.
- Release into `staging` branch will do every week at Friday 23.59 by the lead tech.
- Except for the hotfix. Need to release ASAP. Max 3 hours from analysis of bug reports.

## Changelog

All changes and release notes can be found in the [CHANGELOG.md](CHANGELOG.md) file.

Note: This docs will be treat as a living document and will be update periodically in response to the project development result.
