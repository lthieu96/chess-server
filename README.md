## Pre-requisites

- Node.js
- Yarn
- PostgreSQL (local or cloud)
- Google OAuth 2.0 credentials

## Installation

1. Clone the repository

   ```bash
   git clone https://github.com/lthieu96/chess-server.git
   cd chess-server
   ```

2. Environment Variables

   - Duplicate the file `.env.example` and rename to `.env`
   - Update the values of the environment variables

3. Install dependencies

   ```bash
   yarn install
   ```

4. Setup Database

   ```bash
   yarn db:migrate
   ```

- (Optional) Open the database studio

  ```bash
  yarn db:studio
  ```

5. Run the application

   ```bash
   yarn start:dev
   ```

6. Create a admin user (for admin dashboard)

- Run app in repl mode

  ```bash
  yarn start:dev --entryFile repl
  ```

- Create a admin user

  ```bash
  $(AuthService).createAdmin({ username: 'admin', email: 'admin@example.com', password: 'password123' })
  ```
