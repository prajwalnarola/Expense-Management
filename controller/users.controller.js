const userServices = require("../services/users.services");

exports.register = (req, res, next) => {
  //validation area
  const data = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    profileImage: req.file.filename,
    isTestData: req.body.isTestData,
  };

  console.log(req.file)

  userServices.register(data, (error, result) => {
    if (error) {
      console.log(error);
      return res.status(400).send({ status: 0, data: "Bad request" });
    }
    return res.status(200).send({
      status: 1,
      message:"User registered successfully",
      data: result,
    });
  });
};

exports.login = (req, res, next) => {
  //validation area
  const data = {
    email: req.body.email,
    password: req.body.password,
  };

  userServices.login(data, (error, result) => {
    if (error) {
      console.log(error);
      return res.status(400).send({ status: 0, data: "Invalid credentials" });
    }
    return res.status(200).send({
      status: 1,
      message:"Login successfully",
      data: result,
    });
  });
};

exports.forgotPassword = (req, res, next) => {
  //validation area
  const data = {
    email: req.body.email,
  };

  userServices.forgotPassword(data, (error, result) => {
    if (error) {
      console.log(error);
      return res.status(400).send({ status: 0, data: "Bad request" });
    }
    return res.status(200).send({
      status: 1,
      message: "Password reset email sent",
      data: result,
    });
  });
};

exports.transactions = (req, res, next) => {
  //validation area
  const data = {
    userId: req.query.userId,
  };

  userServices.transactions(data, (error, result) => {
    if (error) {
      console.log(error);
      return res.status(400).send({ status: 0, data: "Bad request" });
    }
    return res.status(200).send({
      status: 1,
      message: "Data available",
      data: result,
    });
  });
};

exports.addWalletBalance = (req, res, next) => {
  //validation area
  const data = {
    userId: req.body.userId,
    amount: req.body.amount,
    isTestData: req.body.isTestData
  };

  userServices.addWalletBalance(data, (error, result) => {
    if (error) {
      console.log(error);
      return res.status(400).send({ status: 0, data: "Bad request" });
    }
    return res.status(200).send({
      status: 1,
      message: "amount added successfully",
      data: result,
    });
  });
};

exports.expenses = (req, res, next) => {
  //validation area
  const data = {
    userId: req.body.userId,
    typeId: req.body.typeId,
    amount: req.body.amount,
    description: req.body.description,
    isTestData: req.body.isTestData
  };

  userServices.expenses(data, (error, result) => {
    if (error) {
      console.log(error);
      return res.status(400).send({ status: 0, data: "Bad request" });
    }
    return res.status(200).send({
      status: 1,
      message: "expense added successfully",
      data: result,
    });
  });
};

exports.currentBalance = (req, res, next) => {
  //validation area
  const data = {
    userId: req.query.userId,
  };

  userServices.currentBalance(data, (error, result) => {
    if (error) {
      console.log(error);
      return res.status(400).send({ status: 0, data: "Bad request" });
    }
    return res.status(200).send({
      status: 1,
      message: "balance available",
      data: result,
    });
  });
};