var http = require('http');
const express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');
require('dotenv').config()

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