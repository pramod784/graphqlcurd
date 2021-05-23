const { buildSchema } = require("graphql");

module.exports = buildSchema(`
input RegisterUserInput {
  employee_id: String!,
  first_name: String!,
  last_name: String,
  email: String!
  password:String!
  organization_name:String,
}
input sortObj {
  column:String,
  order:String
}
input login {
  email:String!,
  password:String!
}
type userData {
  id: Int,
  employee_id: String,
  first_name: String,
  last_name: String,
  email: String,
  status: String,
  organization_name:String
}
type searchResult {
  total_rows: Int,
  rows:[userData]
}
type loginResponse{
  id: Int,
  employee_id:String,
  accesstoken:String!
}
type Query {
  findUser(id: ID!): userData,
  usersList(searchKey:String, searchValue:String, page_no:Int, sort:[sortObj]):searchResult 
}
type Mutation {
  registerUser(data:RegisterUserInput):userData
  usersLogin(data:login):loginResponse
}
`);
