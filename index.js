var http = require("http");
const express = require("express");
var { graphqlHTTP } = require("express-graphql");
const routes = require("./src/routes");
const Models = require("./src/models");
const sequelize = require("sequelize");
const Op = require("sequelize").Op;
var md5 = require("md5");

const {
  buildSchema,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");

require("dotenv").config();

var schema = buildSchema(`type Query {
    hellopramod: String
  }`);
// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  input RegisterUserInput {
    employee_id: String!,
    first_name: String!,
    last_name: String,
    email: String!
    organization_name:String!,
    password:String,
    status:Int
  }
  type userData {
    id: Int!,
    employee_id: String,
    first_name: String,
    last_name: String,
    email: String,
    status: String
  }
  type arrayResult {
    id: Int,
    employee_id: String,
    first_name: String,
    last_name: String,
    email: String,
    status: String,
    organization_name:String,
  }
  type Query {
    findUser(id: ID!): userData,
    searchUser(searchKey:String!,searchValue:String!): [arrayResult],
    findAllUsers:[arrayResult],
  }
  type Mutation {
    registerUser(input: RegisterUserInput): arrayResult
  }
`);

// If userData had any complex fields, we'd put them on this object.
class Userdata {
  constructor(id, { employee_id, first_name, last_name, email, status }) {
    this.id = id;
    this.employee_id = employee_id;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.status = status;
  }
}

var root = {
  findUser: async ({ id }) => {
    let usersData = await Models.user
      .findByPk(id)
      .then((res) => {
        return res;
      })
      .catch((e) => {
        return false;
      });
    if (!usersData) {
      throw new Error("No user exists with id " + id);
    }
    //console.log("usersData=============>", usersData);
    return new Message(id, usersData);
  },
  searchUser: async ({ searchKey, searchValue }) => {
    let where_array = {};
    if (searchKey == "first_name") {
      where_array = {
        first_name: {
          [Op.like]: `%${searchValue}%`,
        },
      };
    } else if (searchKey == "last_name") {
      where_array = {
        last_name: {
          [Op.like]: `%${searchValue}%`,
        },
      };
    } else if (searchKey == "employee_id") {
      where_array = {
        employee_id: searchValue,
      };
    }
    let usersData = await Models.user
      .findAll({
        attributes: [
          "user.id",
          "user.employee_id",
          "user.first_name",
          "user.last_name",
          "user.email",
          "user.status",
          "user.created_at",
          [sequelize.col("employees.user_id"), "user_id"],
          [sequelize.col("employees.organization_name"), "organization_name"],
        ],
        where: where_array,
        order: [["id", "DESC"]],
        include: [
          {
            model: Models.employees,
            required: false,
          },
        ],
        raw: true,
      })
      .then((res) => {
        console.log("res =>=>=>=>=>=>=>", res);
        return res;
      })
      .catch((e) => {
        return false;
      });
    if (!usersData) {
      throw new Error("No user exists with id " + id);
    }
    return usersData;
  },
  findAllUsers: async () => {
    /* if (!fakeDatabase[id]) {
      throw new Error("no message exists with id " + id);
    } */
    /* let async_start = async (id) => {
      return await Models.user.findOne({ id: id });
    }; */
    let allUsersData = await Models.user.findAll().then((res) => {
      return res;
    });
    console.log("allUsersData=============>", allUsersData);
    //return new Message(id, allUsersData);
    return allUsersData;
  },
  registerUser: async ({ input }) => {
    let insertUser = {
      employee_id: input.employee_id,
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      password: md5(input.password),
      status: 1,
    };
    let usersData = "";
    /* check is email id is used */
    usersData = await Models.user
      .findOne({ where: { email: input.email } })
      .then((res) => {
        return res;
      })
      .catch((e) => {
        return false;
      });
    if (usersData) {
      throw new Error(`Email id '${input.email}' is already used!`);
    }
    /* check is email id is used */
    /* check is employee id is used */
    usersData = await Models.user
      .findOne({ where: { employee_id: input.employee_id } })
      .then((res) => {
        return res;
      })
      .catch((e) => {
        return false;
      });
    if (usersData) {
      throw new Error(`Employee id '${input.employee_id}' is already used!`);
    }
    /* check is employee id is used */

    try {
      const inserted_data = await Models.sequelize.transaction(async (t) => {
        const user_res = await Models.user.create(insertUser, {
          transaction: t,
        });
        let insert_employees = {
          user_id: user_res.id,
          organization_name: input.organization_name,
        };
        const emp_data = await Models.employees.create(insert_employees, {
          transaction: t,
        });
        return {
          id: user_res.id,
          employee_id: user_res.employee_id,
          first_name: user_res.first_name,
          last_name: user_res.last_name,
          status: user_res.status,
          email: user_res.email,
          organization_name: emp_data.organization_name,
        };
      });
      return inserted_data;
    } catch (error) {
      throw new Error(`Error occured! Transaction is not successfull`);
    }
  },
};
/* const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This represents a book written by an author",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
  }),
}); */
const app = express();
app.use(routes);

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

/*app.use('/graphql', graphqlHTTP({
  schema: BookType,
  graphiql: true
}))*/

const port = parseInt(process.env.APP_PORT, 10) || 8080;
app.set("port", port);

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server now running on ${port} port`);
});
