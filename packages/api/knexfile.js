module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: 'dev.sqlite3',
    },
    useNullAsDefault: true
  },
  production: {
    client: "postgresql",
    connection: {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE
    },
    pool: {
      min: 2,
      max: 10
    }
  }
};
