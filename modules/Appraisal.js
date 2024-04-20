const mongoose = require('mongoose')

var kpis = new mongoose.Schema ( {  
    score : Number, 
    innovation : Number ,
    Measures: Number ,
    Perspective: String ,
    Objectives: String ,
    AprasalDate:String ,
  });  
  
  var Appraisal = new mongoose.Schema ( {  
    Employe:{
      type: mongoose.Types.ObjectId ,
      required: true
    }, 
    title : String  , 
    date : Date  , 
    kpi : [kpis]  ,
    MdComment :String , 
    HrCommnet :String ,
    ManagerComment :String ,
    employeComment :String ,
    generalRating :String ,
    status:{
      type:String,
      default:"pending",
      required: true
    },
  },{timestamps:true},);  
  
 const Appraisals = mongoose.model ('Appraisal', Appraisal);

 module.exports = Appraisals;