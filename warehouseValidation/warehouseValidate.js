const { WHouse } = require("../modules/warehouse");
const Employe = require("../modules/Employees");
const bill = require("../modules/Bills");
const Product = require("../modules/Product");
const Customer = require("../modules/customers");
const {storeProduct} = require("../modules/warehouse");
const Returns = require("../modules/Returns");
const CustomerReport = require("../modules/customerReport");
var moment = require("moment");

const { ObjectId } = require("mongodb");

//invoicer Access

// post invoice rout checker
async function PostInvoice(req, res, next) {
  try {
    await Employe.findOne({ Signature: req.body.signatureUrl }).then((user) => {
      if (ObjectId.isValid(user._id)) {
        if (user.raiseInvoice || user.isAdmin) {
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
        if (user.isAccountant || user.isAdmin || user.isCFO) {
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

    if (user.isAdmin || user.raiseInvoice) {
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
    if (user.isAdmin) {
      next();
    } else {
      res.redirect("/api/v1/404");
    }
  }
}

// warehouse setup  for route protection
async function createVendor(req, res, next) {
  if (ObjectId.isValid(req.params.ADMINID)) {
    user = await Employe.findById(new ObjectId(req.params.ADMINID));
    if (user.createVendor || user.isAdmin) {
      next();
    } else {
      res.redirect("/api/v1/404");
    }
  }
}

let CRTNS






async function removeStock(req, res, next) {
//remove product from warehouse
await bill.create(req.body).then(async (data) => {
  const wh = await WHouse.findById(new ObjectId(data.whId));
  //remove product from warehouse
  
  for (let index = 0; index < data.orders.length; index++) {
    
    const element = data.orders[index];
    const defaultRolls = element.item.Rolls
    const product = await storeProduct.findById(element.storeProductId);
    let CRTN = product.currentQty - element.Qty;
    const roll =  product.Rolls 
    
    
    //remove rolls and return new value
    const Roll = ()=>{//arguements are current carton qty ,current roll and requested deduction
    
      let updatedRll

      if(element.ROLQTY > roll && CRTN > 0){
        // open new cartorn qty
        CRTN = CRTN - 1
        
        //deduct rolls from new value
        updatedRll = (defaultRolls + roll) - element.ROLQTY ;
        
        
      }else{
        updatedRll = (roll - element.ROLQTY )
      }

      return parseInt(updatedRll)
    }

    await storeProduct.updateOne(
      { _id: ObjectId(element.storeProductId) },
      {
        $set: {
          Rolls: Roll(), 
          currentQty:CRTN,
        },
      }
    ).then(async (acknowledge)=>{
      if(acknowledge.modifiedCount > 0){
        // for tracebility
        await bill.updateOne(
          {
            _id: ObjectId(data._id),
            "orders.storeproductId": element.storeproductId
          },
          {
            $set: {
              "orders.$.returnId": 'WH/OUT'
            }
          },
        )
        // increase sales count
        await Product.findById(element.item._id).then(productCount =>{
          productCount.TotalSale = productCount.TotalSale + element.Qty
          productCount.save();
        })
      }
    });

    
  }
  data.status = "Approved";
  data.save()
})
next();
}


// this function is for returns
async function RefundCustomer(req,res,next){

 await Returns.findById(req.body.id).then(async(returnedBill)=>{
    const Bill = await bill.findById(returnedBill.BillId)
    const customer = await Customer.findById(Bill.customer)

     await Customer.findById(Bill.customer)
    .then(async()=>{
      customer.Debt = customer.Debt - Bill.grandTotal;
      if (customer.Debt - Bill.grandTotal <= 0) {
        customer.lastPayDate = "";
      }
      customer.save();

      //generate report for customer
      await CustomerReport.create({
        ReferenceNo: `RMA-${Bill.billReferenceNo}`,
        CreditAmount: Bill.grandTotal,
        Date: moment().format("l"),
        customerId: customer._id,
        Balance: customer.Debt,
        cr: true,
        DebitAmount: 0,
        dr: false,
      });
      returnedBill.status = "Approved";
      returnedBill.save();

      res.status(200).json({ message: "Return successfully completed" });
    })
    
  })
}

const updateStockCount = async (req,res,next)=>{
  try {
    if (ObjectId.isValid(req.query.userId)) {

      await WHouse.findById(req.body.WHID)
      .then(wh =>{
        if(wh.StoreKeeper._id === req.query.userId ){
          next()
        }else{
          throw new Error('USER ACCES DENIED CONTACT ADMINISTRATOR')
        }
      })
      
      }
  } catch (error) {
    res.status(500).json({error:error.message})
  }
}

//usernotification push
const usernotification =  async ({Title,url,userId}) =>{
  //find the user bt id 
  await Employe.findById(ObjectId(userId))
  .then(user =>{
    if(user){
      //push notification to user
      user.Notification.unshift({
        Title,
        url,
        status:'Unseen',
      })
      user.save()
    }
  })

}

module.exports = {
  ValidStockTransfer,
  adminWareHouseSetUp,
  PostInvoice,
  AccountantViewAccess,
  removeStock,
  RefundCustomer,
  updateStockCount,
  usernotification,
  createVendor
};
