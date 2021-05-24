const Models = require("./../models");
const sequelize = require("sequelize");
const Op = require("sequelize").Op;
const md5 = require("md5");
const {sign} = require("jsonwebtoken");

require("dotenv").config();
const sort_order_const = ["ASC", "DESC"];
const search_key_const = ["first_name", "last_name", "employee_id"];
const sort_column_const = [
  "first_name",
  "last_name",
  "email",
  "employee_id",
  "organization_name",
];
module.exports = {
  findUser: async ({ id }) => {
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
          [sequelize.col("employees.organization_name"), "organization_name"],
        ],
        where: { id: id },
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
      throw new Error("No user exists with id " + id);
    }
    return usersData;
  },
  usersList: async (input, req) => {
    if (!req.isAuthenticated) {
      throw new Error("Unauthenticated!");
    }
    let page_no =
      input.page_no == undefined || input.page_no < 1 ? 1 : input.page_no;
    let searchKey = input.searchKey;
    let searchValue = input.searchValue;
    let sort = input.sort;
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
    if (input?.searchKey && !search_key_const.includes(searchKey)) {
      // throw error
      throw new Error("Search key '" + searchKey + "' is not allowed!");
    }
    if (input?.sort) {
      sort.forEach((element) => {
        if (!sort_order_const.includes(element.order)) {
          // throw error
          throw new Error("Sort order '" + element.order + "' is not allowed!");
        }
        if (!sort_column_const.includes(element.column)) {
          // throw error
          throw new Error(
            "Sort column '" + element.column + "' is not allowed!"
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
          [sequelize.col("employees.organization_name"), "organization_name"],
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
  registerUser: async (input) => {
    console.log("asdasbdkj", input);
    let employee_id = input.data.employee_id;
    let first_name = input.data.first_name;
    let last_name = input.data.last_name;
    let email = input.data.email;
    let password = input.data.password;
    let organization_name = input.data.organization_name;
    let insertUser = {
      employee_id: employee_id,
      first_name: first_name,
      last_name: last_name,
      email: email,
      password: md5(password),
      status: 1,
    };
    let usersData = "";
    /* check is email id is used */
    usersData = await Models.user
      .findOne({ where: { email: email } })
      .then((res) => {
        return res;
      })
      .catch((e) => {
        return false;
      });
    if (usersData) {
      throw new Error(`Email id '${email}' is already used!`);
    }
    /* check is email id is used */
    /* check is employee id is used */
    usersData = await Models.user
      .findOne({ where: { employee_id: employee_id } })
      .then((res) => {
        return res;
      })
      .catch((e) => {
        return false;
      });
    if (usersData) {
      throw new Error(`Employee id '${employee_id}' is already used!`);
    }
    /* check is employee id is used */
    try {
      const inserted_data = await Models.sequelize.transaction(async (t) => {
        const user_res = await Models.user.create(insertUser, {
          transaction: t,
        });
        let insert_employees = {
          user_id: user_res.id,
          organization_name: organization_name,
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
  usersLogin: async (input) => {
    let email = input.data.email;
    let password = md5(input.data.password);
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
    let response = {
      id: usersData.id,
      employee_id: usersData.employee_id,
      accesstoken: accesstoken,
    };
    console.log("accesstoken", response);
    return response;
  },
};
