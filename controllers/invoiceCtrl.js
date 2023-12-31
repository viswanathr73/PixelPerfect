const asyncHandler=require('express-async-handler');
var easyinvoice = require('easyinvoice');
const { Readable } = require("stream");
const Order=require('../model/orderModel');
const { log } = require('console');
const User=require('../model/userModel')
const mongodb = require("mongodb");



//rendering the invoice page----------------------------------------->

const invoice=asyncHandler(async(req,res)=>{
    try {
        console.log('thsan is quirey >>>>>>',req.query);

        const user=await User.findById(req.session.user)
const order=await Order.findById(req.query.id)
console.log('this is order dtaa <<<<<',order,user);



if (order){
    res.render('invoice',{order,user})
}
        
    } catch (error) {
        console.log('Error hapence in invoice controller in the funtion invoice',error);
    }
})


//-------------making an invoice ----------------------------->

const invoices=async(req,res)=>{
    try {
            const id = req.query.id;
            const userId = req.session.user;
            const result = await Order.findById({ _id: id }); 
            const user = await User.findById({ _id: userId });      
            const address = result.address
            const order = {
              id: id,
              total: result.totalPrice,
              date: result.createdOn, // Use the formatted date
              paymentMethod: result.payment,
              orderStatus: result.status,
              name: address[0].fullName,
              number: address[0].number,
              house:address[0].addressLine,
              pincode: address[0].pinCode,
              town: address[0].townCity,
              state: address[0].state,
              product: result.product,
            };
            //set up the product
            let oid = new mongodb.ObjectId(id)
            let Pname =  result.product[0].title
                
            const products = order.product.map((product,i) => ({
                    quantity: parseInt(product.quantity),
                    description: product.title,
                    price: parseInt(product.price),
                    total: parseInt(result.totalPrice),
                    "tax-rate": 0,
                  }));
            
            
           
                  
            const isoDateString = order.date;
            const isoDate = new Date(isoDateString);
        
            const options = { year: "numeric", month: "long", day: "numeric" };
            const formattedDate = isoDate.toLocaleDateString("en-US", options);
            const data = {
              customize: {
                //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
              },
              images: {
                // The invoice background
                background: "",
              },
              // Your own data
              sender: {
                company: "PixelPerfect",
                address: "first floor-Centre Square Mall, Mahatma Gandhi Rd, Rajaji Junction, Kochi, Ernakulam, Kerala 682035",
                city: "Ernakulam",
                country: "India",
              },
              client: {
                company: "Customer Address",
                "zip": order.name,
                "city": order.house,
                "address": order.pincode,
                // "custom1": "custom value 1",
                // "custom2": "custom value 2",
                // "custom3": "custom value 3"
              },
              information: {
                number: "order" + order.id,
                date: formattedDate,
              },
              products: products,
              "bottom-notice": "Happy Shopping. Visit again",
            };
        let pdfResult = await easyinvoice.createInvoice(data);
            const pdfBuffer = Buffer.from(pdfResult.pdf, "base64");
        
            // Set HTTP headers for the PDF response
            res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
            res.setHeader("Content-Type", "application/pdf");
        
            // Create a readable stream from the PDF buffer and pipe it to the response
            const pdfStream = new Readable();
            pdfStream.push(pdfBuffer);
            pdfStream.push(null);
        
            pdfStream.pipe(res);
          } catch (error) {
            console.log(error);
            res.status(500).json({ error: error.message });
          }
  }
  






module.exports={
    invoice,
    invoices
}