const stripe = require("stripe")(process.env.STRIPE_KEY);
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc      Make payment
// @route     POST /api/v1/order/make-payment
// @access    Private
exports.addPayment = asyncHandler(async (req, res, next) => {

  stripe.customers.create({ 
    email: req.body.stripeEmail, 
    source: req.body.stripeToken, 
    name: req.body.name, 
    address: req.body.address
}) 
.then((customer) => { 
    return stripe.charges.create({ 
        amount: req.body.amount,
        description: req.body.description, 
        currency: 'USD', 
        customer: customer.id 
    }, (stripeErr, stripeRes) => {
      if (stripeErr) {
        res.status(500).json(stripeErr);
      } else {
        res.status(200).json(stripeRes);
      }
    }
    ); 
}) 
}) 