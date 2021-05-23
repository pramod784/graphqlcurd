var http = require("http");
const express = require("express");
var { graphqlHTTP } = require("express-graphql");
const routes = require("./src/routes");
const Models = require("./src/models");
const sequelize = require("sequelize");
const Op = require("sequelize").Op;
var md5 = require("md5");
var { sign } = require("jsonwebtoken");
var bodyParser = require("body-parser");
var {
  sort_order_const,
  SortObj,
  UsersList,
  UsersListWithPagination,
  search_key_const,
  sort_column_const,
  loginResponse,
} = require("./src/helpers/graphqlHelper");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");

require("dotenv").config();

const RootQueryType = new GraphQLObjectType({
  name: "GetUsersdata",
  description: "Root Query",
  fields: () => ({
    GetUsersData: {
      type: UsersList,
      description: "This api will fetch single user by his primary key",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: async (parent, args) => {
        let usersData = await Models.user
          .findOne({
            attributes: [
              "user.id",
              "user.employee_id",
              "user.first_name",
              "user.last_name",
              "user.email",
              "user.status",
              "user.created_at",
              [sequelize.col("employees.user_id"), "user_id"],
              [
                sequelize.col("employees.organization_name"),
                "organization_name",
              ],
            ],
            where: { id: args.id },
            include: [
              {
                model: Models.employees,
                required: false,
              },
            ],
            raw: true,
          })
          .then((res) => {
            //console.log("res =>=>=>=>=>=>=>", res);
            return res;
          })
          .catch((e) => {
            return false;
          });
        if (!usersData) {
          throw new Error("No user exists with id " + args.id);
        }
        return usersData;
      },
    },
    UsersList: {
      /* type: UsersList, */
      type: UsersListWithPagination,
      /* type: new GraphQLList(UsersList), */
      description:
        "This api will search users from system. \n Search Keys will be first_name / last_name / employee_id. \n Where employee_id should be exact match and other fields having wildcard search.",
      args: {
        sort: { type: new GraphQLList(SortObj) },
        searchKey: { type: GraphQLString },
        searchValue: { type: GraphQLString },
        page_no: {
          type: GraphQLInt,
          description: "10 records per page. Default value will be 1",
        },
      },
      resolve: async (parent, args) => {
        let searchKey = args.searchKey;
        let searchValue = args.searchValue;
        let page_no =
          args.page_no == undefined || args.page_no < 1 ? 1 : args.page_no;
        let limit = 10;
        let offset = (page_no - 1) * limit;
        if (
          (searchKey == undefined && searchValue != undefined) ||
          (searchKey != undefined && searchValue == undefined)
        ) {
          // throw error
          throw new Error(
            "While searching searchKey & searchValue both required else remove both"
          );
        }
        let sort = args.sort;
        if (args?.searchKey && !search_key_const.includes(args.searchKey)) {
          // throw error
          throw new Error("Search key " + searchKey + " is not allowed!");
        }
        if (args?.sort) {
          sort.forEach((element) => {
            if (!sort_order_const.includes(element.order)) {
              // throw error
              throw new Error(
                "Sort order " + element.order + " is not allowed!"
              );
            }
            if (!sort_column_const.includes(element.column)) {
              // throw error
              throw new Error(
                "Sort column " + element.column + " is not allowed!"
              );
            }
          });
        }
        let order_by_user = [];
        let order_by = [];
        if (sort) {
          sort.forEach((element) => {
            let temp = [];
            if (element.column == "organization_name") {
              temp.push("employees");
            }
            temp.push(element.column);
            temp.push(element.order);
            order_by.push(temp);
          });
        }
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
          .findAndCountAll({
            attributes: [
              "user.id",
              "user.employee_id",
              "user.first_name",
              "user.last_name",
              "user.email",
              "user.status",
              "user.created_at",
              [sequelize.col("employees.user_id"), "user_id"],
              [
                sequelize.col("employees.organization_name"),
                "organization_name",
              ],
            ],
            where: where_array,
            include: [
              {
                model: Models.employees,
                required: false,
              },
            ],
            order: order_by,
            limit: limit,
            offset: offset,
            subQuery: false,
            raw: true,
          })
          .then((res) => {
            //console.log("res =>=>=>=>=>=>=>", res);
            res.total_rows = res.count;
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
    },
  }),
});
const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Register User",
  fields: () => ({
    RegisterUser: {
      type: UsersList,
      description: "Register User",
      args: {
        employee_id: { type: GraphQLNonNull(GraphQLString) },
        first_name: { type: GraphQLNonNull(GraphQLString) },
        last_name: { type: GraphQLString },
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
        status: { type: GraphQLInt },
        organization_name: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        let insertUser = {
          employee_id: args.employee_id,
          first_name: args.first_name,
          last_name: args.last_name,
          email: args.email,
          password: md5(args.password),
          status: 1,
        };
        let usersData = "";
        /* check is email id is used */
        usersData = await Models.user
          .findOne({ where: { email: args.email } })
          .then((res) => {
            return res;
          })
          .catch((e) => {
            return false;
          });
        if (usersData) {
          throw new Error(`Email id '${args.email}' is already used!`);
        }
        /* check is email id is used */
        /* check is employee id is used */
        usersData = await Models.user
          .findOne({ where: { employee_id: args.employee_id } })
          .then((res) => {
            return res;
          })
          .catch((e) => {
            return false;
          });
        if (usersData) {
          throw new Error(`Employee id '${args.employee_id}' is already used!`);
        }
        /* check is employee id is used */

        try {
          const inserted_data = await Models.sequelize.transaction(
            async (t) => {
              const user_res = await Models.user.create(insertUser, {
                transaction: t,
              });
              let insert_employees = {
                user_id: user_res.id,
                organization_name: args.organization_name,
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
            }
          );
          return inserted_data;
        } catch (error) {
          throw new Error(`Error occured! Transaction is not successfull`);
        }
      },
    },
    UsersLogin: {
      type: loginResponse,
      description: "This api will validates user using email and password",
      args: {
        email: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        let email = args.email;
        let password = md5(args.password);
        let usersData = await Models.user
          .findOne({
            attributes: ["user.id", "user.employee_id"],
            where: { email: email, password: password },
            raw: true,
          })
          .then((resd) => {
            console.log("logged user data =>=>=>=>=>=>=>", resd);
            return resd;
          })
          .catch((e) => {
            return false;
          });
        if (!usersData) {
          throw new Error("No user found with provided credential ");
        }
        let accesstoken = sign(
          {
            data: { user_id: usersData.id },
          },
          process.env.JWT_TOKEN_SECRET,
          { expiresIn: 60 * 60 }
        );
        //res.cookie("Pramod Testing");
        console.log("accesstoken", accesstoken);
        return { accesstoken: accesstoken };
      },
    },
  }),
});
const app = express();
app.use(routes);

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});
app.get("/", (_req, res) => res.send("Welcome!"));

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

const port = parseInt(process.env.APP_PORT, 10) || 8080;
app.set("port", port);

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server now running on ${port} port`);
});
