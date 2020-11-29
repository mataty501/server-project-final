const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const User = require("./models/user");
const Token = require("./models/token");
const Product = require("./models/product");
const Order = require("./models/order");
const Image = require("./models/image");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const fs = require("fs");
const fileUpload = require("express-fileupload");

/*upload*/
const path = require("path");
//const multer = require('multer');

const PORT = process.env.PORT || 5000;
const app = express();
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const db = mongoose.connection;
db.once("open", () => {
  console.log("connected to db");
});

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("tiny"));
app.use(helmet());

//app.use(cors());
//app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    createParentPath: true,
  })
);
/*
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'C:\\Users\\Mohamed\\Desktop\\Projet_FINAL\\final__project\\src\\server\\server\\uploads');
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, new Date().toISOString().replace(/:/g, '-') + ".jpeg");
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
const upload = multer({ storage: storage, fileFilter: fileFilter });

//Upload route
app.post('/upload', upload.single('image'), (req, res, next) => {
    try {
        return res.status(201).json({
            message: 'File uploded successfully'
        });
    } catch (error) {
        console.error(error);
    }
});

*/

/**************/

/*get products*/

app.get("/getProducts", async (req, res, next) => {
  try {
    const Data = await Product.find({});
    console.log(Data);

    res.status(200);
    res.send(Data);
  } catch (error) {
    res.status(400);
    res.send({
      message: error.message,
    });
  }
});

/*get users*/

app.get("/getUsers", async (req, res, next) => {
  try {
    const Data = await User.find({});
    console.log(Data);

    res.status(200);
    res.send(Data);
  } catch (error) {
    res.status(400);
    res.send({
      message: error.message,
    });
  }
});

/*make order*/

app.post("/makeOrder", async (req, res, next) => {
  const { name, address, phoneNumber, productID } = req.body;
  try {
    const order = new Order({
      name: name,
      address: address,
      phoneNumber: phoneNumber,
      productID,
    });
    await order.save();
    res.send(order);
    res.status(200);
  } catch (error) {
    res.status(400);
    res.send({
      message: error.message,
    });
  }
});

/*get Product Name*/

app.get("/getProductName/:id", async (req, res, next) => {
  const { id } = req.params;

  const data = await Product.findById(id);
  console.log(data);

  if (data !== null) {
    res.send({
      message: data,
    });
  } else {
    res.send({
      message: "user doesn't exists",
    });
  }
});

/*Is Admin*/

app.get("/isAdmin", async (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  try {
    const { username } = jwt.verify(token, process.env.PRIVATE_KEY);
    if (username == "walid501@hotmail.com") {
      res.send({
        message: "is admin",
      });
    } else {
      res.send({
        message: "isn't admin",
      });
    }
  } catch (error) {}
});

/*show orders*/

app.get("/showOrders", async (req, res, next) => {
  try {
    const Data = await Order.find({});
    //console.log(Data);
    const orders = Data.map(async (elem) => {
      const product = await Product.findById(elem.productID);
	  
	  /*
      return {
        ...elem._doc,
        productID: product.title,
      };*/
	  
	  if(product===null){
		  return {
        ...elem._doc,
        productID: 'deleted product',
      };
	  }
	  else {
		   return {
        ...elem._doc,
        productID: product.title,
      };
	  }
	  
	  
    });
    const newOrder = await Promise.all(orders);
    res.status(200);
    res.send(newOrder);
  } catch (error) {
    res.status(400);
    res.send({
      message: error.message,
    });
  }
});

/*sign in */

app.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ email: username });
    if (!user) {
      throw new Error("User doesn't exist");
    }
    const samePassword = await bcrypt.compare(password, user.password);
    if (samePassword) {
      const token = jwt.sign(
        {
          username: user.email,
        },
        process.env.PRIVATE_KEY,
        {
          expiresIn: "1h",
        }
      );
      const refreshToken = jwt.sign(
        {
          username: user.email,
        },
        process.env.REFRESH_KEY,
        {
          expiresIn: "7d",
        }
      );
      res.status(200);
      const newToken = new Token({
        token: refreshToken,
      });
      await newToken.save();
      res.send({
        token: token,
        refreshToken: refreshToken,
      });
    } else {
      throw new Error("Bad credentials");
    }
  } catch (error) {
    res.status(400);
    res.send({
      message: error.message,
    });
  }
});

/*sign up*/

app.post("/signup", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      email: username,
      password: passwordHash,
    });
    await user.save();
    res.status(200);
    res.send(user);
  } catch (error) {
    res.status(400);
    res.send({
      message: error.message,
    });
  }
});

/*Delete product*/

app.delete("/deleteProduct/:id", async (req, res, next) => {
  const { id } = req.params;

  const data = await Product.findByIdAndDelete(id);
  console.log(data);

  if (data !== null) {
    res.send({
      message: "user deleted",
    });
  } else {
    res.send({
      message: "user doesn't exists",
    });
  }
});

/*Delete order*/

app.delete("/deleteOrder/:id", async (req, res, next) => {
  const { id } = req.params;

  const data = await Order.findByIdAndDelete(id);
  console.log(data);

  if (data !== null) {
    res.send({
      message: "user deleted",
    });
  } else {
    res.send({
      message: "user doesn't exists",
    });
  }
});

/*AddProduct*/

app.post("/addProduct", async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No files",
      });
    } else {
      const { picture, picture2, picture3 } = req.files;
      const { name, description, price, newProduct, gender } = req.body;
      console.log(picture);
      console.log(picture2);
      console.log(picture3);
      const picture_name = Date.now() + picture.name;
      const picture_name2 = Date.now() + picture2.name;
      const picture_name3 = Date.now() + picture3.name;
      const pictureUrlArray = [picture_name, picture_name2, picture_name3];
      picture.mv("./uploads/" + picture_name);
      picture2.mv("./uploads/" + picture_name2);
      picture3.mv("./uploads/" + picture_name3);

      const product = new Product({
        title: name,
        price: price,
        description: description,
        pictureUrl: picture_name,
        pictureUrlArray: pictureUrlArray,
        newProduct: newProduct,
        gender: gender,
      });
      await product.save();

      res.send({
		  picture:picture,
		  picture2:picture2,
		  picture3:picture3,
		  name:name,
		  description:description,
		  price:price,
		  newProduct:newProduct,
		  gender:gender,
        status: true,
        message: "File is uploaded",
      });
    }
  } catch (e) {
    res.status(500).send(e);
  }
});

app.get("/images/:name", (req, res, next) => {
  const { name } = req.params;
  console.log(name);
  res.download("./uploads/" + name);
  //res.send({message : "hello"})
});

/*Token*/
app.get("/token", (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (Token.findOne({ token: token })) {
    const user = jwt.verify(token, process.env.REFRESH_KEY);
    const newToken = jwt.sign(
      {
        username: user.email,
      },
      process.env.PRIVATE_KEY,
      {
        expiresIn: "1h",
      }
    );
    res.status(200);
    res.send({
      token: newToken,
    });
  } else {
    res.status(400);
    res.send({
      message: "Invalid token",
    });
  }
});

app.use((err, req, res, next) => {
  res.send({
    message: err.message,
  });
});
/*
const PORT = 2000;
*/
app.listen(PORT, () => {
  console.log(`listening on port http://localhost:${PORT}`);
});
