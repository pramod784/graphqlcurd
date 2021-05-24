const http = require("http");
const express = require("express");
var { graphqlHTTP } = require("express-graphql");
const routes = require("./src/routes");
var middleware = require("./src/middleware/checkAuth");
var graphQlSchema = require("./src/helpers/graphqlSchemaHelper");
var graphQlResolvers = require("./src/helpers/graphqlResolverHelper");
require("dotenv").config();

const app = express();
app.use(routes);

app.use(middleware);
app.get("/", (_req, res) => res.send("Welcome!"));

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true,
  })
);
const port = parseInt(process.env.APP_PORT, 10) || 8080;
app.set("port", port);

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server now running on ${port} port`);
});
