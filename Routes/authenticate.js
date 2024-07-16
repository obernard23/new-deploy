const { Router } = require('express');
// Import dependencies
const YAML = require("js-yaml");
const multer = require("multer");
const product = require('../modules/Product');
const authController = require('../controllers/authControllers')
const DepreciationController = require('../controllers/DepreciationShedule')
const {requireAuth,checkUser} = require('../middleware/authmidddleware')
const {deductLeaveDays} = require('../middleware/TimeoffMiddleware')
const {PostInvoice,ValidStockTransfer,adminWareHouseSetUp,createVendor,AccountantViewAccess,removeStock,RefundCustomer,updateStockCount} = require('../warehouseValidation/warehouseValidate')
const {checkResetUser,checkLoginUser} = require('../middleware/checkUser')
const {checkUserRole,ManagerAccess} = require("../middleware/userRole");
const bills = require('../modules/Bills');
const NotifyManagerPayment = require('../Functions/NotifyManager');
const restPassword = require("../Functions/resetPasword");
const fs = require('fs');
const sendQuot = require("../Functions/sendQuot");
const pdf = require("pdf-creator-node");
const { ObjectId } = require('mongodb');
const NotifyAccountant = require('../Functions/NotifyAccountant');
const employe = require('../modules/Employees')
const customer = require('../modules/customers')
const NotifyScrap = require('../Functions/NotifyScrap')
const NotifyWhTovir = require('../Functions/NotifyWhTovir')
const NotifyCFORetruns = require("../Functions/NotifyCFORetruns");//for cfo
const WelcomeMessageHandler = require('../Functions/WelcomeMessageHandler')
const NotifyAccountantPR = require("../Functions/NotifyAccountantPR");//for Accountant
const NotifyCFOTransfer = require("../Functions/NotifyCFOTransfer");//for Accountant
const ScrapResponse = require('../Functions/ScrapResponse')
const NotifyCustomerIncentive = require('../Functions/NotifyCustomerIncentive');
const NotifyCFOPriceChange = require("../Functions/PriceChangrNootification");//for Accountant
const XLSX = require('xlsx');

const router = Router()

router.get('*',checkUser)
router.get('/signup',requireAuth,authController.signup_get);
router.get('/SignIn',authController.signin_get);
router.get('/Cart',authController.cart_get);
router.get('/index',authController.index_get);//check this out
router.get('/contact_form',DepreciationController.contact_form_get);
router.post('/contact_form_submit',DepreciationController.contact_form_post)
router.get('/Livechat/Link/:chatId',DepreciationController.Livechat_get)//get single link for support ticket from mail
router.get('/livechat/updates/:chatId',DepreciationController.chatUpdate_get)//for update on dom
router.put('/chat/:chatId',DepreciationController.chat)//to add chat to livechat
router.get('/Helpdesk',requireAuth,DepreciationController.TicketView_get)///internal user view 
router.get('/Ticket',requireAuth,DepreciationController.SingleTicket)//get single ticket
router.patch('/TicketId',requireAuth,DepreciationController.TicketId_patch)//edit single ticket
router.get('/Support',requireAuth, DepreciationController.SupportDepartment)
router.get('/Marketing',requireAuth,DepreciationController.Marketing_get);//productivity
router.post('/Productivity/sendMarketing',requireAuth,DepreciationController.Marketing_post);
router.get('/Notification/:WHID',requireAuth,authController.Notification_get);
router.get('/Notifications/:employeeId',requireAuth,DepreciationController.UserNotification_get);
router.get('/Reset',authController.Reset_get);
router.get('/logout/:USERID',requireAuth,authController.logout_get);
router.get('/employee',requireAuth,authController.OnboardEmployee_get)
router.get('/Appraisal/:id',requireAuth,authController.Appraisal_get)//GET SINGLE EMPLOYEE FOR APPRAISAL
router.post('/Appraiasl/Employee/Apraisal',authController.Appraisal_post)
router.get('/Appraisals/Management/:id',authController.AppraisalsManagement_get)//for top management view    

router.post('/register/employee',authController.Register_post);//to create new employee but not activated
router.get('/employee/:EmployeeId/user',requireAuth, authController.getSingleEmployee_get)
router.post('/SignIn',checkLoginUser,authController.signin_post);
router.get('/Reset/account/:EmailTOreset',authController.ResetEmail_get,restPassword);
router.post('/Register-lead',requireAuth,authController.Lead_post);
router.patch('/Reset-password/:id/Security',authController.ResetId_patch);
router.patch('/employee/Onboard/:EmployeeId',requireAuth,authController.OnboardEmployee_patch)//patch request for employee login

router.get('/employee/:employeeId',requireAuth,async(req,res)=>{//get json for all employees
    const employee = await employe.findById(new ObjectId(req.params.employeeId))
    res.status(200).json(employee)
})
//for erp pls cut out when done 

router.post('/Product/Create-new',requireAuth,authController.ProductCreate_post);
router.get(`/product/:ACDcode/bill/:WHID`,requireAuth,authController.productFind_get);//get store product id with json format for quotation purposes
router.get('/product/:ACDcode/bill',requireAuth,authController.productFindNodIde_get)//get product  with json format for quotation purposes
router.get('/StoreProductFindNodIde/:ACDcode/:to/:from',requireAuth,authController.StoreProductFindNodIde_get)//FOR WAREHOUSE PRODUCT TRANSFER 
router.get('/Products',requireAuth,authController.Product_get);
router.patch('/:id/BuyingPrice_change',requireAuth,authController.BuyingPrice_change,NotifyCFOPriceChange);//buying price change
router.patch('/Products/:id/edit',requireAuth,authController.Product_patch);
router.patch('/Products/:id/return',requireAuth,authController.ProductReturn_patch,NotifyWhTovir)//return product to virtual and logs message 
router.get('/Product/:id',requireAuth,authController.SingleProduct_get)
router.get('/Product/search/:referenceNo',requireAuth,authController.SingleProductAdc_get) //for search
router.get('/Clone/Product/:PRODUCTID',requireAuth,authController.SingleProductClone)
router.get('/StoreProduct/:PRODUCTID/edit',requireAuth,authController.StoreProductUpdate)

router.get('/Ecommerce/Customers',requireAuth,authController.Customer_get);
router.post('/Sales/Register-customer',requireAuth,authController.CustomerRegister_post)
router.get('/customer/:id/search',requireAuth,authController.CustomerFind_get);
router.get(`/customer/:id/edit`,requireAuth,authController.customer_get);
router.patch(`/customer/update/:id`,requireAuth,authController.customerEdit_patch)

router.get('/VIRTUAL/Vendors/:ADMINID',requireAuth,adminWareHouseSetUp,authController.Vendors_get);
router.post('/Sales/Register-Vendor/:ADMINID',requireAuth,createVendor,authController.VendorCreate_post);

//for payment 
router.get('/Sales/Payment/Home/:id',requireAuth,AccountantViewAccess,authController.paymentLanging_get)
router.get('/Register/bill/:id/:billId',requireAuth,authController.RegisterPayment_get)//acountatnt is and bill id
router.patch('/bill/register/:id',requireAuth,authController.RegisterPayment_patch,NotifyManagerPayment)//register bill 
router.get('/Pay_Vendor/:id',requireAuth,AccountantViewAccess,authController.VendorPayment_get)
router.post('/Pay_Vendor_incentive/:id',requireAuth,AccountantViewAccess,authController.INCENTIVEPayment_post,NotifyCustomerIncentive)
router.patch('/vendor_balance/:id',requireAuth,AccountantViewAccess,authController.VendorBalance_patch)//register vendor balance
router.patch('/Reverse/Balance/:id/:paymentId',requireAuth,AccountantViewAccess,authController.VendorPayment_Patch)//reverse custormer balance and update vendor balance

//warehouseops
router.get('/warehouse/:id/employeeLocation',requireAuth,ValidStockTransfer,authController.warehouse_get);
router.post('/warehouse/create-new',requireAuth,authController.wareHouse_post);
router.get('/Location/:id',requireAuth,authController.warehouseDelivery_get);//id refrences user id
router.get('/deliveryExcel/:WHID',requireAuth,authController.deliveryExcel_get);//get all delivery in excel
router.get('/Delivery/Excel/:DeliveryId',requireAuth,authController.SingleDeliveryExcel_get)
router.get('/wHBills/Excel/:WHID',requireAuth,authController.wareHouseBillExcel_get)//for ware house 
router.get('/XLSX/Report/:WHID',requireAuth,authController.InventoryReport_get)//for excell
router.get('/warehouse/:id/Invoices/new',requireAuth,authController.Invoice_get);
router.get('/stock-move',requireAuth,authController.stock_get);//for inventory move
router.get('/VirtualstorageProduct',requireAuth,authController.VirtualstorageProduct_get)//add url to frontend today
router.patch('/warehouse/:ADMINID/:WHID/edit',requireAuth,adminWareHouseSetUp,authController.Edit_patch);//edith ware house 
router.patch('/outbound/:ADMINID/:WHID/:PRODID/:STOREID/edit',requireAuth,adminWareHouseSetUp,authController.Inventory_patch);
router.post(`/wareHouseToTransfer/:WHID`,requireAuth,authController.WareHouseStoreage_post);//here to register new product toWareHouse
router.post(`/wareHouseToTransfer/toRecive`,requireAuth,authController.WareHouseStock_post);//use this for deliveries
router.post('/wareHouse/Bill',requireAuth,PostInvoice,authController.WareHouseBill_post,removeStock,NotifyAccountant);//to post bill
router.get(`/warehouse/:id/Bills`,requireAuth,authController.WareHouseBill_get);//GET BILL BY WAREHOUSE ID
router.get(`/bill/:id`,requireAuth,authController.WareHouseSingleBill_get);//get single bill
router.patch(`/bill/:id/approved`,requireAuth,authController.approveBill_patch);//to approve bills for manager to cfo
router.get('/warehouse/Product/:whId',requireAuth,authController.WareHouseStoreage_get);//get products for specific ware house
router.patch('/warehouse/Product/:whId',requireAuth,authController.WareHouseStoreage_patch);
router.get('/Sub/:ADMINID/WareHouse/Location',requireAuth,adminWareHouseSetUp,DepreciationController.SubLocation_get)//locaton page get
router.post('/Location/create',requireAuth,DepreciationController.LocationCreate)//post api or location
router.post('/KPI/create',requireAuth,DepreciationController.KPICreate)//post api or KPI
router.get('/:id/Appraisal/',requireAuth,authController.SingleAppraisal_get)//get single appraisal
router.patch('/:id/Appraisal/',requireAuth,authController.SingleAppraisal_patch)//edit appraisal
router.get('/workContracts/',requireAuth,authController.WorkContract_get)//hr stuff
router.post('/workContracts/',requireAuth,authController.workContract_post)
router.get('/TimeOFF/:userId',requireAuth,authController.TimeOFF_get)//hr stuff
router.get('/TimeOFF',requireAuth,authController.SingleTimeOff)//get single time off
router.post('/leaveRequests',requireAuth,authController.leaveRequests_post)
router.patch('/leaveRequest',requireAuth,authController.leaveRequests_patch,deductLeaveDays)//add payroll here
router.get('/Calendar',requireAuth,DepreciationController.Calendar_get)//for event 
router.post('/New/Event/',requireAuth,DepreciationController.EventCreate)//create events

// Setup Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Set the destination where the files should be stored on disk
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        // Set the file name on the file in the uploads folder
        cb(null, file.fieldname + ".xlsx" ) ;
    },
    
  });
  

const upload = multer({ storage: storage }); // { destination: "uploads/"}

router.post("/uploadbulk",requireAuth,upload.single("data"), (req, res) => {
    try {
        // Read the workbook
        const workbook = XLSX.readFile('./uploads/data.xlsx');
        
        // Get the sheet names
        const sheetNames = workbook.SheetNames;
        
        // Get the data from the first sheet (assuming it's named "Sheet1")
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
        
        // Process the data (for example, log each person's name and age)
        data.forEach(async products => {
          await product.create({
            Name:products.SKU_Name,
            ACDcode:products.PRODUCT_CODE,
            category: products.CATEGORY,
            TotalSale: 0,
            Van_Price:products.VAN_PRICE,
            Market_Price:products.SUPER_MARKET_PRICE,
            WareHouse_Price:products.WAREHOUSE_PRICE,
            Rolls:products.ROLL_IN_CARTON,
            Pieces: 0,
            Sellable: true,
            Ecom_sale: false,
            VanPromo: 0,
            WholesalePromo: 0,
            MarketPromo: 0,
            Vendor: '65f65fa961130be9580e869b',
            vendor_Price:0
          } )
        });

        // Delete the file after we're done using it
        fs.unlinkSync(`./uploads/data.xlsx`);
        res.redirect('/api/v1/Products')
        
          } catch (error) {
            error ? res.redirect('/api/v1/404') : ''
          }
});//upload multiple documents


router.get('/Employee/:employeeId',requireAuth,authController.WareHouseManager_get)
router.get('/SetUp/:WHID/:ADMINID',requireAuth,adminWareHouseSetUp,authController.WareHouseSetup_get)

// delivery routes
router.get('/delivery/:deliveryId',requireAuth,authController.delivery_get);//sends json response for single bills
router.patch('/delivery/:deliveryId/:id',requireAuth,authController.delivery_patch);//update delivery status of bill
// GENERATE PDF FOR BILL
router.get('/invoice/:billId', requireAuth,async (req, res, next)=>{
    const bill = await bills.findById(new ObjectId(req.params.billId)).limit(1).lean()
    const customers = await customer.findById(new ObjectId(bill.customer)).limit(1).lean()
    res.status(200).json({bill,customers})
    
//     const template = fs.readFileSync("./quotationTemplate.html", "utf-8");
//    const option ={
//     format:'a5',
//     orientation:'portrait',
//     border:'5mm'
//    }

//    const document = {
//     html:template,
//     data: bill//uses template for handle bars
//     ,
//     path:`./invoice/INV${bill.billReferenceNo}.pdf`,
//    }
//    await pdf.create(document,option).then((pdf) => {
//     res.status(200).download(`./invoice/INV${bill.billReferenceNo}.pdf`)
//    })
//    .catch((err) => {
//     res.status(500).send({error: err.message})
//    })
} )




//get user signature
router.get(`/users/:userId/:opInput`,requireAuth,authController.Signature_get);


// send mail to  customer   account
router.get(`/sendmail/:id/:ActiveUserName`,requireAuth,authController.sendMail,sendQuot);


router.get("/Dashboard/:userid",requireAuth, authController.Dashboard_get);

router.get(`/vendor/:id/edit`,requireAuth,authController.vendor_get);
router.patch(`/vendor/update/:id`,requireAuth,authController.vendorEdit_patch);

//reporter routes
router.get('/Report', requireAuth,authController.Report_get);
router.get('/CashFlow/report',requireAuth,authController.CFR_get);
router.get('/Sale/Report',requireAuth,authController.SaleReprot_get);
router.get('/Getfulldb', requireAuth,authController.getFullDB);
router.get('/dispach/Report',requireAuth,authController.DispatchReprot_get);
router.get('/Debtor/Report',requireAuth,authController.DebtorReprot_get);
router.get('/LPO/Report',requireAuth,authController.LPOReprot_get);
router.get('/customer/report',requireAuth,authController.CustomerTransaction_get);
router.get('/StockReport',requireAuth,authController.StockReprot_get)
router.get('/Bank/Transaction',requireAuth,authController.BankTransaction_get);
router.get('/TGT/Achievement',requireAuth,authController.TGT_get);
router.get('/Expense/Report',requireAuth,authController.ExpenseReport_get);
router.get('/SalesDump/Report',requireAuth,authController.SalesDump_get);
router.get('/vendor/report',requireAuth,DepreciationController.vendorTransactionReport)
router.get('/VAT/Reprot',requireAuth,DepreciationController.VAT_REPORT)


//getting work book to exce; for All bills
router.get('/bills/excel',requireAuth,authController.BillsWorkBook_get)
router.get('/ExcelProduct',requireAuth,authController.ExcelProduct_get)

//warehouse expense
// router.get('/Expense/:WHID',requireAuth,authController.expense_get)
router.post('/Expense/:id',requireAuth,authController.expense_post)//id is user id

//SCRAP API
router.get('/Scrap/:WHID',requireAuth,authController.scrap_get)
router.post('/Scrap/:WHMANAGER',requireAuth,ManagerAccess,authController.Scrap_post,NotifyScrap)

router.get('/Staff/:WHID',requireAuth,authController.staff_get)//get staff by the location 
router.get('/Replenish/:WHID/storeproduct',requireAuth,authController.replenish_storeproduct)
router.get('/warehouse/purchase/:WHID',requireAuth,authController.wareHouse_BeamCard)//for stock count
router.get('/stockCard/:id',requireAuth,DepreciationController.Singlecard_get)//get single stock card entery
router.post('/updateStockCount',requireAuth,updateStockCount,DepreciationController.updateStockCount)
router.get('/Returns/:WHID',requireAuth,authController.WareHouseReturns_get)


// virtual warehouse routes
router.get('/VIRTUAL/:ADMINID',requireAuth,authController.virtual_get)
router.get('/VIRTUAL/SCRAP/:ADMINID',requireAuth,adminWareHouseSetUp,authController.virtual_Scrap)
router.get('/scrap/single/:ID',requireAuth,authController.SingleScrap_get)
router.patch('/scrap/:ID',requireAuth,authController.SingleScrap_patch,ScrapResponse)
// router.get('/register/new/product',requireAuth,authController.CreateProduct_get);//create product
router.get('/Delete/:ProductId',requireAuth,authController.Product_delete);
router.get('/VIRTUAL/Purchase/:ADMINID',requireAuth,authController.PurchaseLanding_get)
//purchse routers
router.get('/Virtual/Purchase/Order/:ADMINID',requireAuth,authController.PurchaseRequestForm_get)//for accountant and lpo raiser
router.get('/vendor/:id',requireAuth,authController.vendorFind_get)// kept at mind cant find url
router.get(`/Vendorproduct/:vendorID`,requireAuth,authController.productsJson_get)//json to get product by vendorID
router.get("/Virtual/Purchase/Request/:ADMINID",requireAuth,authController.PurchaseRequest_get)
router.post('/Virtual/Purchase/Order/:ADMINID',requireAuth,PostInvoice,authController.PurchaseOrder_post)
router.get('/Purchase/bill/:billReferenceNo',requireAuth,authController.SinglePurchasebillReferenceNo_get)//single po
router.get('/Virtual/Product/TransferLogs/:ADMINID',requireAuth,authController.productTransferLogs_get)// for transfers to warehouse log
router.get('/Virtual/Product/TransferForm/:ADMINID',requireAuth,authController.ProductTransferForm_get)
router.post('/TransferForm/:ADMINID',requireAuth,PostInvoice,authController.ProductTransferForm_post,NotifyCFOTransfer)//transfer log to warehouse
router.patch('/Transfer/:id',requireAuth,authController.ProductTransferForm_patch);//transfer to warehouse
router.get('/warehouse/json/:WHID',requireAuth,authController.wareHouseJson_get)//SENDS WHID,STOREPRODUCT PER WHID,PRODUCT LIST for transfer
router.get('/Transfer/:TRANSFERREF',requireAuth,authController.SingleProductTransfer_get)//get single warehouse products transfer log
router.get('/Transfers/:WHNAME/:WHID',requireAuth,authController.WHProductTransfer_get)//get product by warehouse product transfer log
router.post('/Stocks/request',requireAuth,authController.StockRequest_post,NotifyAccountantPR)//ware house stock request post
router.get('/new/Return/:WHID',requireAuth,authController.ReturnsForm_get)//for returns
router.get('/bill/:billReferenceNo/:WHID',requireAuth,authController.Return_json)//for returns generic to ware house
router.post('/returns/:whid',requireAuth,authController.Returns_post,NotifyCFORetruns)
router.get('/LPO/:WHID', requireAuth,authController.WareHouseLPO_get)//get all lpo by warehouse
router.get('/PR/:whid', requireAuth,authController.purchaseRequest_get) //get all pR

//API for all storeproduct per warehouse
router.get('/api/product/bill/:WHID',requireAuth, authController.StoreProduct_get)

// SET UP COMPANY details



router.get('/Company/Register/:ADMINID',requireAuth,adminWareHouseSetUp,authController.companyRegister_get)
router.post('/company/register/:ADMINID',requireAuth,adminWareHouseSetUp,authController.companyRegister_post,WelcomeMessageHandler);
// expense routes
router.get('/CFO/EXPENSE/:id',requireAuth,AccountantViewAccess,authController.CFexpense_get)
router.patch('/Expense/edit/:EXPID/:CFOID',requireAuth,authController.SingleExpense_patch)
router.get('/CFO/Returns/:id',requireAuth,AccountantViewAccess,authController.CFOReturns_get)
router.get('/:RETURNID/Returns',requireAuth,authController.SingleReturns_get)
router.patch('/SingleReturn/:SingleReturnId',requireAuth,authController.SingleReturns_patch,RefundCustomer)
router.patch('/Vendor/Bill/:BillId',requireAuth,authController.CFOVendorBill_patch)// for lpo
router.get('/EXP/:id',requireAuth,authController.SingleExpense_get)
router.get('/AccountSettingLanding/:id',requireAuth,AccountantViewAccess,authController.AccountSettingLanding_get)
router.get('/:id/:name/:Account',requireAuth,AccountantViewAccess,authController.SingleAccount_get)
router.post('/Bank/Account/create',requireAuth,authController.BankAccount_post)
router.patch('/Bank/:Account/BalanceTransfer',requireAuth,authController.BankAccount_patch)

// accountant routes
router.get('/Credit/customers/:id/payment',requireAuth,AccountantViewAccess,authController.CreditCustomers_get)//register payment
router.get('/payments/:id',requireAuth,authController.singlePayment_get)//get single payment
// payment reversal routs
router.patch('/payment/revoke/:paymentId',requireAuth, authController.paymentRevoke_patch)
router.post('/CREDIT/log',requireAuth,authController.registerCustomerPayment_post)
router.get('/Profit&lost/:id',requireAuth,authController.pnl_get)

// category route
router.post('/Category/create',requireAuth,authController.productCategory)
router.post('/umo/create',requireAuth,authController.umo)
router.post('/expense/Category/create',requireAuth,authController.ExpenseCategory)
router.get('/expenseCategory/delete',requireAuth,authController.ExpenseCategory_delete)
router.get('/Category/delete/:CATID',requireAuth,authController.deleteProductCategory)

//for searching 
router.get('/query/:query',authController.query_get)
//try invoicing


// asset Register routes
router.get('/asset/:id',requireAuth,AccountantViewAccess,DepreciationController.asset_get)
router.get('/asset/new_asset/:id',requireAuth,AccountantViewAccess,DepreciationController.assetCreate_get)
router.post('/createAsset',requireAuth,DepreciationController.asset_post_create)
router.get('/SingleAsset/:AssetId/:name/:id',requireAuth,DepreciationController.SingleAsset)
router.patch('/assets/:AssetId/edit',requireAuth,DepreciationController.Asset_Patch)
router.get('/Birthday/messages',requireAuth,DepreciationController.BirthdayMessage)
router.post('/newjobtitle',requireAuth,DepreciationController.jobtittle_post)//create job title
router.post('/departmentforms',requireAuth,DepreciationController.Department_post)//create department
router.get('/Departments',requireAuth,DepreciationController.getDepartments)//get all departments


//404
router.get('/404',async (req, res, next)=>{
res.render('404')
})
module.exports = router;
