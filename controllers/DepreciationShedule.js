const { ObjectId } = require("mongodb");
var moment = require("moment");
const Employe = require("../modules/Employees");
const Emails = require("../modules/Email");
const Vendor = require("../modules/Vendors");
const BeamCard = require("../modules/BeamCard");
const Assets = require("../modules/Assets");
const Events = require("../modules/Events");
const Location = require("../modules/Location");
const Customers = require("../modules/customers");
const KPI = require("../modules/kpi");
const {jobTittle,Department} = require("../modules/departments");
const mongoose = require("mongoose");
const { WHouse } = require("../modules/warehouse");
const birthdayTemplates = require("../EmailTemplates/birthdatTemplate");
const { PASSWORD, EMAIL, ERPSmtpName } = require("../.env");
const nodemailer = require("nodemailer");
const companyRegister = require("../modules/company");
const Helpdesk = require("../modules/Tickets");
const LiveChatLink = require("../Functions/ContactFormResponse")

//get all asset
module.exports.asset_get = async (req, res, next) => {
  const assets = await Assets.find();
  res.status(200).render("./AssetViews/asset", { assets ,name: "BADE"});
};

module.exports.assetCreate_get = async (req, res, next) => {
  const Employees = await Employe.find({$and: [
    { status: "active" }]})
  res.status(200).render("./AssetViews/assetForm", { Employees ,name: "BADE"});
};

module.exports.asset_post_create = async (req, res, next) => {
  try {
    await Assets.create(req.body).then((asset) => {
      if (asset) {
        res.status(200).json({ message: "Asset created successfully" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get single asset
module.exports.SingleAsset = async (req, res) => {
  if (ObjectId.isValid(req.params.AssetId)) {
    try {
      await Assets.findById(req.params.AssetId)
        .limit(1)
        .then(async (asset) => {
          const Employees = await Employe.find({$and: [
            { status: "active" }]})
          if (asset) {
            res
              .status(200)
              .render("./AssetViews/SingleAsset", { asset, Employees,name: "BADE" });
          } else {
            throw new Error("Could find this asset");
          }
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.redirect("/api/v1/404");
  }
};


// patch for edit on asset 
module.exports.Asset_Patch = async (req, res) => {
  if (ObjectId.isValid(req.params.AssetId)) {
    try {
      await Assets.updateOne(
        { _id: ObjectId(req.params.AssetId) },
        { $set: req.body }
      ).then((acknowledged)=>{
        acknowledged ? res.status(200).json({message:'Asset updated Successfully'}) : res.status(500).json({error:'Error updating'})
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.redirect("/api/v1/404");
  }
};

module.exports.BirthdayMessage = async (req, res) => {
  // for birthdat notifications
  const birth = moment().format();

  // send  birthday mail automatically
  const data = await Employe.find({$and: [
    { status: "active" }]})
  const birthdayPerson = data.filter((person) => {
    return person.DOB.toString().substring(5, 10) === birth.substring(5, 10);
  });

  let config = {
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
    tls: { rejectUnauthorized: false }, //always add this to stop error in console
  };

  let transporter = nodemailer.createTransport(config);

  //send mail to each email
  birthdayPerson.forEach((person) => {
    if (person) {
      let message = {
        from: EMAIL,
        to: person.Email, //employee email
        subject: `Bade Team wishes ${person.firstName} a Happy Birthday `,
        html: birthdayTemplates(person),
      };

      transporter
        .sendMail(message)
        .then(() => {
          res
            .status(200)
            .json({
              message: `birthday message sent to ${birthdayPerson.length} person`,
            });
        })
        .catch((error) => {
          res.status(500).json({ error: error.message });
        });
    }
  });
};

// vendor transaction report
module.exports.vendorTransactionReport = async (req, res, next) => {
  const vendors = await Vendor.find();
  res.status(200).render("vendorTransaction", { vendors ,name: "BADE"});
};

// ..for vat report
module.exports.VAT_REPORT = async (req, res, next) => {
  const wareHouse = await WHouse.find();
  res.status(200).render("VatReport", { wareHouse,name: "BADE" });
};

// for task management
module.exports.taskManager = async (req, res, next) => {};


// create warehouse location get route
module.exports.SubLocation_get = async(req,res,next) =>{

  const loaction = await Location.find()
  res.status(200).render("LocationPage",{loaction})

}

// calender get
module.exports.Calendar_get = async (req,res,next) =>{
  
  res.status(200).render("Calendar", { name: "BADE" });
}

// create events
module.exports.EventCreate = async (req,res,next) =>{
 try {
  await Events.create(req.body).then((event)=>{
    if(event){
      res.status(200).json({message:'Event Registered successfully'})
    }else{
      throw new Error('Something went Wrong')
    }
  })
 } catch (error) {
    res.stautus(500).json({error:error.message})
 }
}


// post request for location 
module.exports.LocationCreate = async (req,res,next)=>{
  try{
    await Location.create(req.body).then((loc)=>{
      if(loc){
        res.status(200).json({message:'New Location Added Sucessfully'})
      }else{
        throw new Error('Something went Wrong')
      }
    })
  }catch(err){
    res.status(500).json({error:err.message})
  }
}

// POST REQ FOR KPI 
module.exports.KPICreate = async (req,res,next)=>{
  try{
    await KPI.create(req.body).then((Kpi)=>{
      if(Kpi){
        res.status(200).json({message:'New KPI Added Sucessfully'})
      }else{
        throw new Error('Something went Wrong')
      }
    })
  }catch(err){
    res.status(500).json({error:err.message})
  }
}


// for creating job tittle
module.exports.jobtittle_post = async (req, res, next) => {
  try {
    await jobTittle.create(req.body).then((asset) => {
      if (jobTittle) {
        res.status(200).json({ message: "New job tittle added successfully" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// create departments
module.exports.Department_post = async (req, res, next) => {
  try {
    await Department.create(req.body).then((asset) => {
      if (Department) {
        res.status(200).json({ message: "New Department added successfully" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateStockCount = async (req, res, next) => {
 try {
    await BeamCard.create(req.body).then(entry =>{
      if(entry){
        res.status(200).json({message:'Stock card Entry submited sucessfully'})
      }else{
        throw new Error('Something went Wrong')
      }
    })
 } catch (error) {
    res.status(500).json({error:error.message})
 }
};

module.exports.Singlecard_get = async (req,res)=>{
    try {
      if (ObjectId.isValid(req.params.id)) {
        await BeamCard.findById(req.params.id).then(async card =>{
          const Whouse = await WHouse.findById(card.WHID);
          res.status(200).render('singleStockCard',{card,name:'BADE',Whouse})
        })
      }else{
        res.redirect('/api/v1/404')
      }
    } catch (error) {
      res.redirect('/api/v1/404')
    }
}

module.exports.UserNotification_get = async (req, res, next) => {
  // const data = await Employe.find({$and: [
  //   { status: "active" }]})
  res.status(200).render('userNotification', { name:'BADE'})
}

module.exports.contact_form_get = async (req,res,next) =>{
  const Business = await companyRegister.findOne();
  res.status(200).render('ContactForm', {Business, name:'BADE'})
}

//submit contact form
module.exports.contact_form_post = async (req,res,next) => {
 try {
  await Helpdesk.create(req.body).then(ticket => {
    if(ticket){
      LiveChatLink(ticket)
      res.status(200).json({message:'Support ticket registered successfully, You can also use the link sent to your Email to follow up with a Support person'})
    }else{
      throw new Error('Something went Wrong')
    }
   })
 } catch (error) {
  res.status(200).json({error:error.message})
 }
}

//get Livechat_get
module.exports.Livechat_get = async (req,res,next)=>{
  try {
    if (ObjectId.isValid(req.params.chatId)) {
      const Business = await companyRegister.findOne();
      await Helpdesk.findById(req.params.chatId).then(SingleLead => {
        res.status(200).render('livechat', { SingleLead,Business, name: 'BADE' });
      });
    }else{
      res.redirect('/api/v1/404');
    }
  } catch (error) {
    
  }
}


module.exports.chat = async (req, res) => {
  const {messageBody,senderId,author} = req.body
 
  try {
    const updatedStory = await Helpdesk.findByIdAndUpdate(
      req.params.chatId,
      {
          $push: {
            conversation: {
              messageBody,
              senderId,
              author,
            },
          },
      },
      { new: true } // Return the updated document
  );

  res.status(200).json(updatedStory)

  } catch (error) {
    console.log(error.message)
    res.status(500).json({error:'Something went wrong. Message did not deliver '})
  }
};

// display for customer chat
module.exports.CustomerLivechatLink = async (req,res)=>{
 try {
  const SingleLead = await Helpdesk.findById(req.params.chatId)
  res.status(200).render('customerChat',{SingleLead})
 } catch (error) {
  console.log(error.message)
 }
}

module.exports.chatUpdate_get = async (req, res)=>{
  try {
    const SingleLead = await Helpdesk.findById(req.params.chatId)
    res.status(200).json({response:SingleLead})
  } catch (error) {
    
  }
}

// get all help desk ticket
module.exports.TicketView_get = async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const result = {};
  result.Helpdesk = await Helpdesk.find().sort({status:-1})
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex)
    .exec();

  if (endIndex < (await Helpdesk.find().countDocuments().exec())) {
    result.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    result.Previous = {
      page: page - 1,
      limit: limit,
    };
  }

  const searchAllHelpdesk = await Helpdesk.find().sort({status:-1});
  res.status(200).render("TicketView", { name: "BADE" ,result,searchAllHelpdesk});
};


//FOR INTERNAL USERS ONLY
module.exports.SingleTicket = async (req, res) => {
 const admin = await Department.find()
  await Helpdesk.findById(req.query.id)
  .then((SingleLead)=>{
    if(SingleLead){
      res.status(200).render('SingleTicketInt',{SingleLead,admin, name:'BADE'})
    }
  })
}

//actioning tickets 
module.exports.TicketId_patch = async(req,res,next)=>{
  await Helpdesk.updateOne({_id:req.query.TicketId},{ $set: req.body }).then(async(acknowledged)=>{
    if(acknowledged){
      // send mail notification to the department Hod 
      const Tks = await Helpdesk.findById(req.query.TicketId)
      if(Tks.internalUnitId === ''){
        res.status(200).json({message:'Your action has been Updated successfully'})
      }else{
        //either send mail or handle notification on app
        //note no next fuction added yet
        next()
      }
    }
  })
}

//get departments for support requests
module.exports.getDepartments = async (req, res) => {
  const Departments = await Department.find()
  const Hod = await Employe.find()
  res.status(200).render('DepartmentList',{Departments,Hod})
}

module.exports.SupportDepartment = async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const result = {};
  result.Departments = await Department.findById(req.query.department)
  result.Helpdesk = await Helpdesk.find({internalUnitId:req.query.department}).sort({status:-1})
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex)
    .exec();

  if (endIndex < (await Helpdesk.find().countDocuments().exec())) {
    result.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    result.Previous = {
      page: page - 1,
      limit: limit,
    };
  }

  res.status(200).render('SupportDepartment',{result})
}


module.exports.Marketing_get = async  (req, res) => {
  const Email = await Emails.find()
  const customerList = await Customers.find({NewsFeedSubscription:true,blocked:false}).sort({Email:1})
  res.render("Marketing", { Email,customerList, name: "BADE" });
};

module.exports.Marketing_post = async (req, res,next) => {
 try {
  await Emails.create(req.body).then(mail =>{
    if(mail){
      // sent mails in next function
     res.status(200).json({message:'Email Entry created successfully.'});
    }else{
      throw new Error('Couldn\'t create email entry ')
    }
 })
 } catch (error) {
  res.status(500).json({error:error.message});
 }
};