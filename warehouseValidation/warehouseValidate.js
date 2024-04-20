const { WHouse } = require("../modules/warehouse");
const Employe = require("../modules/Employees");
const bill = require("../modules/Bills");
const Product = require("../modules/Product");
const {storeProduct} = require("../modules/warehouse");

const { ObjectId } = require("mongodb");

//invoicer Access

// post invoice rout checker
async function PostInvoice(req, res, next) {
  try {
    await Employe.findOne({ Signature: req.body.signatureUrl }).then((user) => {
      if (ObjectId.isValid(user._id)) {
        if (user.jobTittle === "Invoicer") {
          next();
        } else {
          throw new Error(
            "You do not have necessary access right to perform restricted actions."
          );
        }
      } else {
        throw new Error("Could not fetch initiator");
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// post invoice rout checker
async function AccountantViewAccess(req, res, next) {
  try {
    await Employe.findById(req.params.id).then((user) => {
      if (ObjectId.isValid(user._id)) {
        if (user.Department === "Accounting" || user.role === "Admin") {
          next();
        } else {
          throw new Error(
            "you lack necessary Access right to perform this Operation.please contact Administrator"
          );
        }
      } else {
        throw new Error("Could not fetch initiator");
      }
    });
  } catch (error) {
    error ? res.redirect("/api/v1/404") : "";
  }
}

// get ware house middleware
async function ValidStockTransfer(req, res, next) {
  if (ObjectId.isValid(req.params.id)) {
    user = await Employe.findById(new ObjectId(req.params.id));

    if (user.role === "Admin" || user.jobTittle === "Invoicer") {
      next();
    } else if (user) {
      const WHouses = [];
      await WHouse.findById(new ObjectId(user.workLocation)).then((warehouse) =>
        WHouses.push(warehouse)
      );
      res.status(200).render("warehouse", { title: "Warehouse", WHouses });
    }
  }
}

// warehouse setup  for route protection
async function adminWareHouseSetUp(req, res, next) {
  if (ObjectId.isValid(req.params.ADMINID)) {
    user = await Employe.findById(new ObjectId(req.params.ADMINID));
    if (user.role === "Admin") {
      next();
    } else {
      res.redirect("/api/v1/404");
    }
  }
}

async function removeStock(req, res, next) {
  await bill.create(req.body).then(async (data) => {
    const wh = await WHouse.findById(new ObjectId(data.whId));
    //remove product from warehouse
    data.orders.forEach(async (order) => {
      const todeduct  = await storeProduct.findById(order.storeProductId)
          // check for carton and remove
       if (order.scale === "Carton") {
          // deduct cartorn
          await storeProduct.updateOne( { _id: order.storeProductId },
            { $set: { currentQty: todeduct.currentQty - order.Qty }})
            .then(async (acknowledge) => {
              if(acknowledge){
                 // product sales count
            await Product.findById(order.item._id).then(
              (productSold) => {
                currentTotalSale = productSold.TotalSale;
                productSold.TotalSale =
                  currentTotalSale + order.Qty;
                productSold.save();
              }
            );
              }


            })
       }else if (order.scale === "Roll") {
        //deduct and action carton removal and rolls
        const RemoveRolls = async (order) => {
          const rollProduct = await storeProduct.findById(
            order.storeProductId
          );
          const defaultRolls = await Product.findById(
            rollProduct.productId
          );
          if (order.Qty > rollProduct.Rolls) {
            await storeProduct
              .findById(order.storeProductId)
              .then((product) => {
                product.currentQty = product.currentQty - 1;
                product.Rolls =
                  product.Rolls + defaultRolls.Rolls;
                product.Rolls = product.Rolls - order.Qty;
                product.save();
              });
          } else {
            await storeProduct
              .findById(order.storeProductId)
              .then((product) => {
                product.Rolls = product.Rolls - order.Qty;
                product.save();
              });
          }
        };
        RemoveRolls(order);
       }

    });
    data.status = "Approved";
    data.save()
  })
 next();
}

module.exports = {
  ValidStockTransfer,
  adminWareHouseSetUp,
  PostInvoice,
  AccountantViewAccess,
  removeStock,
};
