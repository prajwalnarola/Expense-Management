const usersController = require("../controller/users.controller");
const multer = require("multer");

var express = require("express");

var router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null,"./uploadProfileImage");
    },
    filename: (req, file, cb)=>{
        cb(null, Date.now()+ '-' +file.fieldname+'-'+file.originalname);
    }
})

const upload = multer({storage,
    fileFilter: (req, file, cb) => {
        // const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
        const allowedMimes = ['image/jpeg', 'image/png'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true); // Accept the file
        } else {
          cb(new Error('Invalid file type. Only JPEG, PNG files are allowed.'), false); // Reject the file
        }
      },
});



router.post("/register", upload.single('profileImage') ,usersController.register);
router.post("/login", usersController.login);
router.post("/forgot-password", usersController.forgotPassword);
router.get("/transactions", usersController.transactions);
router.post("/add-Wallet-balance", usersController.addWalletBalance);
router.post("/expenses", usersController.expenses);
router.get("/current-balance", usersController.currentBalance);


module.exports = router;
