# GraphQL

   ### System requirement ###
   Node Version 14 or +\
    Mysql 8 or +
   
   ### Steps to Install ###

```
git clone https://github.com/pramod784/graphqlcurd.git
```

```
npm install
```

### Setup environment ###
Rename sample.env to .env\
Windows
```
copy .env.example .env
```
Linux
```
cp sample.env .env
```
Update .env variables accordingly
```
npx sequelize-cli db:migrate
```
```
npm install --save-dev nodemon
```
```
nodemon npm start
```
Access Project using <URL>/graphql\
Queries as follows
### Register User ###
`
  mutation {
  registerUser(data: {employee_id:"ram090",first_name:"Ram",last_name:"tiwari",email:"ram@gmail0.com",password:"123456",organization_name:"KaleidoSolutech Pvt Ltd"}) {
    id
    employee_id
    first_name
    last_name
    email
    status
    organization_name
  }
}
`
### Login User ###
`mutation {
  usersLogin(data: {email: "ram@gmail0.com", password: "123456"}) {
    id
    employee_id
    accesstoken
  }
}`

### Get User Detail ###
Users List\
Secured API : Need to pass bearer token in header\
   `{usersList(searchKey: "first_name", searchValue: "pra",page_no:1,sort:[{column:"first_name",order:"ASC"}]) {
    rows {
      id
      email
      status
      first_name
      last_name
      employee_id
      organization_name
    }
    total_rows
}}`
  
### Get User Detail ###
This is open api (without authentication) just for testing\
   `query{findUser(id:27){
  id
  employee_id
  first_name
  last_name
  organization_name
  status
}}`
   
   
