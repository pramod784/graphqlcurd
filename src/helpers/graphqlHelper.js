var http = require("http");
const express = require("express");
var { graphqlHTTP } = require("express-graphql");
const sequelize = require("sequelize");
const Op = require("sequelize").Op;
var md5 = require("md5");

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");

const sort_order_const = ["ASC", "DESC"];
const SortObj = new GraphQLInputObjectType({
  name: "SortData",
  description: "We need to provide sorting logic here",
  fields: () => ({
    column: { type: GraphQLNonNull(GraphQLString) },
    order: {
      type: GraphQLNonNull(GraphQLString),
      description: "Only value ASC Or DESE allowed else ignored",
    },
    /* order: { type: GraphQLNonNull(GraphQLString) }, */
  }),
});
const UsersList = new GraphQLObjectType({
  name: "GetUsers",
  description: "",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    employee_id: { type: GraphQLNonNull(GraphQLString) },
    first_name: { type: GraphQLNonNull(GraphQLString) },
    last_name: { type: GraphQLString },
    email: { type: GraphQLNonNull(GraphQLString) },
    status: { type: GraphQLInt },
    organization_name: { type: GraphQLString },
  }),
});
const UsersListWithPagination = new GraphQLObjectType({
  name: "GetUsersPagination",
  description: "List with total count!",
  fields: () => ({
    total_rows: { type: GraphQLInt },
    rows: {
      type: new GraphQLList(UsersList),
    },
  }),
});
const search_key_const = ["first_name", "last_name", "employee_id"];
const sort_column_const = [
  "first_name",
  "last_name",
  "email",
  "employee_id",
  "organization_name",
];
const loginResponse = new GraphQLObjectType({
  name: "LoginUser",
  description: "",
  fields: () => ({
    accesstoken: { type: GraphQLNonNull(GraphQLString) },
  }),
});
module.exports = {
  sort_order_const,
  SortObj,
  UsersList,
  UsersListWithPagination,
  search_key_const,
  sort_column_const,
  loginResponse,
};
