const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');
const {PASSWORD,EMAIL,ERPSmtpName,url} = require('../.env');
const Employee = require('../modules/Employees');
const Bills = require('../modules/Bills');


// this function sends mail to ware house manager 
const NotifyAccountant = async (req,res,next) => {
   const bill =  await Bills.findOne({billReferenceNo:req.body.billReferenceNo}).limit(1)//find bill 
   let date = new Date()
   await Employee.find({jobTittle:'Accountant'})
    .then((Accontant) => {
        Accontant.forEach( person => {
            let config = {
                service : 'gmail',
                auth : {
                    user: EMAIL,
                    pass: PASSWORD
                },
                tls : { rejectUnauthorized: false }//always add this to stop error in console   
            }
        
            let transporter = nodemailer.createTransport(config);
        
            let MailGenerator = new Mailgen({
                theme: "salted",
                product : {
                    name: 'BADE',
                    link : 'https://mailgen.js/',
                    logo: 'bade.jpg',
                    copyright: `© ${date.getFullYear()} BADE.`,
                }
            })
        
            let response = {
                body: {
                name : `Accountant ${person.firstName}`,
                intro: `New Sales order Raised for ${req.body.customerName}  with REF NO ${req.body.billReferenceNo}/${req.body.invoicelocation}`,
                action: [
                    {
                        instructions: ``,
                        button: {
                            color: '#22BC66',
                            text: `ORDER/${req.body.billReferenceNo}/${req.body.invoicelocation}`,
                            link: `${url}/api/v1/bill/${bill._id}`
                        }
                    }
                ]
            },
                outro: "kind Regards"
            }
            
            let mail = MailGenerator.generate(response)
            
            let message = {
                from : EMAIL,
                to : person.Email,//accountant email address
                subject: `${ERPSmtpName} Operations`,
                html: mail
            }
            
            transporter.sendMail(message).then(() => {
                res.status(200).json({
                    message: `New Bill successfully Registered. Inventory adjusted, product has been removed from warehouse.`,
                  });
            }).catch(error => {
                res.status(500).json({
                    message:`New Bill successfully Registered. Inventory adjusted, product has been removed from warehouse.`,
                  });
            })
        });
    })
    
};

module.exports = NotifyAccountant
