## Environment Variables

- duplicate the file `.env.example` and rename to `.env`
- update the values of the environment variables

## Install dependencies

```bash
yarn install
```

## Setup Database

```bash
yarn db:migrate
```

- Open the database studio

```bash
yarn db:studio
```

## Run the application

```bash
yarn start:dev
```

## Create a admin user

- Run app in repl mode

```bash
yarn start:dev --entryFile repl
```

- Create a user

```bash
$(AuthService).createAdmin({ username: 'admin', email: 'admin@example.com', password: 'password123' })
```

## Seed the database
