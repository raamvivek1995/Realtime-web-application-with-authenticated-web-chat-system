const express = require('express')
const app = express()
var port = process.env.PORT || 8080;
//app.use(express.static('static'))
const cors = require('cors')
app.use(express.urlencoded({extended: false}))
app.use(cors())
app.listen(port, () => 
    console.log('HTTP server with express js listening to port'+port )
)
app.get('/', (req, res) => {
    res.send("Microservice 2 by Vivek and Arun pravin, usage: host/bmi_calc?height=XX&weight=XX");
})
app.get('/bmi_calc', function(req, res) {
    var weight = req.query.weight
    var height = req.query.height
    var bmi = (weight/height/height)*10000
    if (bmi >= 25.0){
        var solution = "This is consider obese"
    }
    else{
        var solution = "The BMI shows that you are fit"
    }

    res.send(`Your weight is ${weight} kg and height is ${height} cm and your BMI is ${Math.round(bmi*100)/100}. (${solution})`);
   
});

