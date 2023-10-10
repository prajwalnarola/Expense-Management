const db = require("../config/db.config");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");

exports.register = (data, callback) => {
  db.query(
    "SELECT * FROM user WHERE email = ?",
    [data.email],

    (error, results, fields) => {
      if (error) {
        return callback(error);
      }
      console.log(results);
      if (results.length < 1) {
        if (data.password.length > 0) {
          bcrypt.hash(data.password, 10, (hashError, hashPassword) => {
            if (hashError) {
              return callback(hashError);
            }
            db.query(
              "INSERT INTO user (firstName, lastName, email, password, profileImage, isTestData) VALUES (?, ?, ?, ?, ?, ?)",
              [
                data.firstName,
                data.lastName,
                data.email,
                hashPassword,
                data.profileImage,
                data.isTestData,
              ],

              (insertError, insertResults, insertFields) => {
                if (insertError) {
                  return callback(insertError);
                }
                console.log(insertResults);
                return callback(null);
              }
            );
          });
        } else {
          return callback(null, "Empty password");
        }
      } else {
        console.log(results);
        return callback(null, "User already exists");
      }
    }
  );
};

exports.login = (data, callback) => {
  db.query(
    "SELECT * FROM user WHERE email = ?",
    [data.email],

    (error, results, fields) => {
      if (error) {
        return callback(error);
      }
      const isMatch = bcrypt.compare(data.password, results[0].password);
      if (!isMatch) {
        return callback("Error");
      }
      delete results[0].password
      return callback(null, results[0]);
    }
  );
};

exports.forgotPassword = (data, callback) => {
  console.log(data);
  db.query(
    "SELECT * FROM user where email = ?",
    [data.email],

    (error, results, fields) => {
      if (error) {
        return callback(error);
      }
      console.log(results);
      if (results.length > 0) {
        const user = results[0];
        const newPassword = randomstring.generate(10);

        try {
          updatePassword(user.id, newPassword);

          const emailResult = sendPasswordResetEmail(data.email, newPassword);

          if (!emailResult) {
            return callback("Email sending error", null);
          }

          return callback(null);
        } catch (error) {
          console.error("Service error:", error);
          return callback("Internal Server Error", null);
        }
      } else {
        console.log(results);
        return callback(null, "User not exist");
      }
    }
  );
};

exports.transactions = (data, callBack) => {
  db.query(
    "SELECT * FROM user where id = ?",
    [data.userId],

    (error, results, fields) => {
      if (error) {
        return callBack(error);
      }
      console.log(results);
      if (results.length > 0) {
        db.query(
          "select * from transactionHistory where userId = ?",
          [data.userId],

          (error, results, fields) => {
            if (error) {
              return callBack(error);
            }
            console.log(results);
            return callBack(null, results);
          }
        );
      } else {
        console.log(results);
        return callBack(null, "User does not exist");
      }
    }
  );
};

exports.addWalletBalance = (data, callBack) => {
  db.query(
    "SELECT * FROM wallet where userId = ?",
    [data.userId],

    (error, results, fields) => {
      if (error) {
        return callBack(error);
      }
      console.log(results);
      if (results.length > 0) {
        db.query(
          "update wallet set balance = balance + ? where userId = ? ",
          [data.amount, data.userId],

          (error, results, fields) => {
            if (error) {
              return callBack(error);
            }
            db.query(
              "INSERT INTO transactionHistory(userId, transactionType	, amount, isTestdata) VALUES(?,?,?,?)",
              [data.userId, "deposit", data.amount, data.isTestData],

              (error, results, fields) => {
                if (error) {
                  return callBack(error);
                }

                console.log(results);
                if (results.affectedRows === 1) {
                  db.query(
                    "update currentBalance set balance = balance + ? where userId = ? ",
                    [data.amount, data.userId],

                    (error, results, fields) => {
                      if (error) {
                        return callBack(error);
                      }

                      console.log(results);
                      if (results.affectedRows === 1) {
                        return callBack(null);
                      } else {
                        return callBack(new Error("Invalid"));
                      }
                    }
                  );
                } else {
                  return callBack(new Error("Invalid"));
                }
              }
            );
          }
        );
      } else {
        db.query(
          "INSERT INTO wallet(userId, balance, isTestdata) VALUES(?,?,?)",
          [data.userId, data.amount, 1],

          (error, results, fields) => {
            if (error) {
              return callBack(error);
            }

            console.log(results);
            if (results.affectedRows === 1) {
              db.query(
                "INSERT INTO transactionHistory(userId, transactionType	, amount, isTestdata) VALUES(?,?,?,?)",
                [data.userId, "deposit", data.amount, 1],

                (error, results, fields) => {
                  if (error) {
                    return callBack(error);
                  }

                  console.log(results);
                  if (results.affectedRows === 1) {
                    db.query(
                      "INSERT INTO currentBalance(userId, balance, isTestdata) VALUES(?,?,?)",
                      [data.userId, data.amount, 1],

                      (error, results, fields) => {
                        if (error) {
                          return callBack(error);
                        }

                        console.log(results);
                        if (results.affectedRows === 1) {
                          return callBack(null);
                        } else {
                          return callBack(new Error("Invalid"));
                        }
                      }
                    );
                  } else {
                    return callBack(new Error("Invalid"));
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

exports.expenses = (data, callBack) => {
  db.query(
    "select * from wallet where userId = ?",
    [data.userId],

    (error, results, fields) => {
      if (error) {
        return callBack(error);
      }

      console.log(results[0]);
      if (results[0].balance >= data.amount && data.amount > 0) {
        db.query(
          "SELECT * FROM expense where userId = ?",
          [data.userId],

          (error, results, fields) => {
            if (error) {
              return callBack(error);
            }
            console.log(results);
            if (results.length > 0) {
              db.query(
                "update expense set amount = amount + ? where userId = ? ",
                [data.amount, data.userId],

                (error, results, fields) => {
                  if (error) {
                    return callBack(error);
                  }

                  db.query(
                    "INSERT INTO transactionHistory(userId, transactionType	, amount, isTestdata) VALUES(?,?,?,?)",
                    [data.userId, "expense", data.amount, 1],

                    (error, results, fields) => {
                      if (error) {
                        return callBack(error);
                      }

                      console.log(results);
                      if (results.affectedRows === 1) {
                        db.query(
                          "update currentBalance set balance = balance - ? where userId = ? ",
                          [data.amount, data.userId],

                          (error, results, fields) => {
                            if (error) {
                              return callBack(error);
                            }

                            console.log(results);
                            if (results.affectedRows === 1) {
                              return callBack(null);
                            } else {
                              return callBack(new Error("Invalid"));
                            }
                          }
                        );
                      } else {
                        return callBack(new Error("Invalid"));
                      }
                    }
                  );
                }
              );
            } else {
              db.query(
                "INSERT INTO expense(userId, typeId, amount, description, isTestdata) VALUES(?,?,?,?,?)",
                [
                  data.userId,
                  data.typeId,
                  data.amount,
                  data.description,
                  data.isTestData,
                ],

                (error, results, fields) => {
                  if (error) {
                    return callBack(error);
                  }

                  db.query(
                    "INSERT INTO transactionHistory(userId, transactionType	, amount, isTestdata) VALUES(?,?,?,?)",
                    [data.userId, "expense", data.amount, 1],

                    (error, results, fields) => {
                      if (error) {
                        return callBack(error);
                      }

                      console.log(results);
                      if (results.affectedRows === 1) {
                        db.query(
                          "update currentBalance set balance = balance - ? where userId = ? ",
                          [data.amount, data.userId],

                          (error, results, fields) => {
                            if (error) {
                              return callBack(error);
                            }

                            console.log(results);
                            if (results.affectedRows === 1) {
                              return callBack(null);
                            } else {
                              return callBack(new Error("Invalid"));
                            }
                          }
                        );
                      } else {
                        return callBack(new Error("Invalid"));
                      }
                    }
                  );
                }
              );
            }
          }
        );
      } else {
        console.log(results);
        return callBack(null, "insufficient balance");
      }
    }
  );
};

exports.currentBalance = (data, callBack) => {
  db.query(
    "SELECT * FROM currentBalance where userId = ?",
    [data.userId],

    (error, results, fields) => {
      if (error) {
        return callBack(error);
      }
      console.log(results);
      if (results.length > 0) {
        db.query(
          "select * from currentBalance where userId = ?",
          [data.userId],

          (error, results, fields) => {
            if (error) {
              return callBack(error);
            }
            console.log(results);
            return callBack(null, results);
          }
        );
      } else {
        console.log(results);
        return callBack(null, "User does not exist");
      }
    }
  );
};

function updatePassword(userId, newPassword) {
  return new Promise((resolve, reject) => {
    const updateQuery = "UPDATE user SET password = ? WHERE id = ?";
    db.query(updateQuery, [newPassword, userId], (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

function sendPasswordResetEmail(email, newPassword) {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "mobiletrainees2023@gmail.com",
        pass: "gxlfsykqhwtaqikp",
      },
    });

    const mailOptions = {
      from: "mobiletrainees2023@gmail.com",
      to: email,
      subject: "Password Reset Request",
      text: `Your new password is: ${newPassword}`,
    };

    const emailResult = transporter.sendMail(mailOptions);
    return emailResult;
  } catch (error) {
    console.error("Email sending error:", error);
    return null;
  }
}
