var http = require('http');
const express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');
const { Sequelize } = require('sequelize');
require('dotenv').config()

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: process.env.DIALECT
});

try {
  sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

var schema = buildSchema(`
  type Query {
    hellopramod: String
  }
`);
 
var root = { hellopramod: () => 'Hello world!' };

const app = express();

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

const port = parseInt(process.env.APP_PORT, 10) || 8080;
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => {
    console.log(`Server now running on ${port} port`);
});