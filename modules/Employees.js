const { Timestamp } = require('mongodb');
const mongoose = require('mongoose');
const { isEmail} = require('validator');




const EmployeSchema = new  mongoose.Schema({

firstName:{
  type:String,
  required:true,
  lowercase: true,
},
lastName:{
  type:String,
  required:true,
  lowercase: true,
},
Email:{
 type:String,
 required:[true,'Provide an valid email address'],
 lowercase: true,
 unique:[true,'This email is already registerd.'],
 validate:[isEmail,'please eneter a valid Email']
},
telephone:{
type:String,
required:false,
unique:true,
},
workLocation:{
type:mongoose.Types.ObjectId,
ref:'WHouse',
},
Equiptment:{
type:Array
},
HomeAddress:{
type:String,
},
workTelephone:{
type:String,
},
contract:{
type:String,
default:''
},
DOB:{
type:String,
},
StateOfOringin:{
type:String                    
},
EmaergencyContact:{
type:String
},
NIN:{
type:String
},
BVN:{type:String},
AccountNumber:{type:String},
EmploymentStaus:{type:String},
StartDate:{type:String},
EndDate:{type:String},
LGA:{type:String},
staffId:{type:String},
role:{
type:String
},
Manager:{
type:Object,
},
nextOfKin:{
type:Object
},
Signature:{type:String},
opsCode:{
type:String,
minlength:4,
},
image:{type:String},
Leave:{
type:Array,
},
password:{
  type:String,
  minlength:6,
},
workEmail:{type:String},
Department:{type:String},
Gender:{type:String},
status:{
  type:String,
  default:'suspended',
},
jobTittle:{
  type:String,
},
EndDate:{type:String},
firstTimeOnboard:{type:Boolean, default:false},
EmaergencyContactNumber:{type:String},
NOK:String,
BankName:String,
lastSeen:{
  type:String,
  default:'Offline',
},
BirthdayMailsent:{
  type:Boolean,
  default:false,
},
AnnivaryMailsent:{
  type:Boolean,
  default:false,
},
Deadline:String,
Sales_Target:{
  type:Number,
  default:0
},
Target_Start:String,
Notification:[],
Appraisal:String,
Leave:[],
raiseLpo:{
  default:false,
  type:Boolean
},
raiseInvoice:{
  default:false,
  type:Boolean
},
isAccountant:{
  default:false,
  type:Boolean
},
postPayment:{
  default:false,
  type:Boolean
},
editSalesPrice:{
  default:false,
  type:Boolean
},
editPromoPrice:{
  default:false,
  type:Boolean
},
isAdmin:{
  default:false,
  type:Boolean
},
isManager:{
  default:false,
  type:Boolean
},

createProduct:{
  default:false,
  type:Boolean
},
createCustomer:{
  default:false,
  type:Boolean
},
createVendor:{
  default:false,
  type:Boolean
},
payVendor:{
  default:false,
  type:Boolean
},
editPurchasePrice:{
  default:false,
  type:Boolean
},
isCFO:{
  default:false,
  type:Boolean
},
creditOfficer:{
  default:false,
  type:Boolean
},
cancelInvoice:{
  default:false,
  type:Boolean
},
DeactivateWareHouse:{
  default:false,
  type:Boolean
},
accountCreation:{
  default:false,
  type:Boolean
},

reportsUser:{
  default:false,
  type:Boolean
},
// expense
expenseUser:{
  default:false,
  type:Boolean
},
expenseApprover:{
  default:false,
  type:Boolean
},
expenseManager:{
  default:false,
  type:Boolean
},
requestLeave:{
  default:false,
  type:Boolean
},
// inventory
notifySalesOrder:{
  default:false,
  type:Boolean
},
wareHouseManager:{
  default:false,
  type:Boolean
},
allowInternalTransfers:{
  default:false,
  type:Boolean
},
AppraisalUser:{
  default:false,
  type:Boolean
},
selfService:{
  default:true,
  type:Boolean
},
AnualLeave:{
  type:Number,
  default:0
},
SickLeave:{
  type:Number,
  default:0
},
STudyLeave:{
  type:Number,
  default:0
},
MaternityLeave:{
  type:Number,
  default:0
},
isHOD:{
  type:Boolean,
  default:false
}


},{timestamps:true})

const  EMPLOYEES = mongoose.model(' EMPLOYEES',EmployeSchema);

module.exports = EMPLOYEES;