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
Access Project using <URL>/graphql
Queries as follows\
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
