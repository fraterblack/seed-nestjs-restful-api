const dotenv = require('dotenv');

const result = dotenv.config({
  path: process.env.APP_ENV === 'test' ? '.env.testing' : '.env',
});

if (result.error) {
  throw result.error;
}

module.exports = {
  development: {
    ...getConfig(),
    ssl: false,
    models: [
      __dirname + '/../../modules/**/*.model{.ts,.js}',
    ],
    modelMatch: (filename, member) => {
      const sanitizedFilename = filename.replace(/-/g, '');
      const modelStripped = sanitizedFilename.substring(0, sanitizedFilename.indexOf('.model'));

      return modelStripped === member.toLowerCase();
    },
    seederStorage: 'sequelize'
  },
  production: {
    ...getConfig(),
    ssl: true,
  }
};

function getConfig() {
  return {
    dialect: 'postgres',

    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    logging: process.env.ORM_DEBUG ? console.log : false,
  };
}
