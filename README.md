# Seed Example Services

## CollectorService

## Installation

```bash
$ yarn install

```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## Sequelize

```bash
# create a new migration
$ npx sequelize migration:generate --name=<MigrationName>

# run migrations
$ npx sequelize db:migrate

# revert migrations
$ npx sequelize db:migrate:undo

```

Check other commands in [Sequelize site](https://github.com/sequelize/cli)

## Swagger
Locally visit http://localhost:3003/api

## This project is based on NestJs

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)
