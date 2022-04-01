const axios = require('axios');
module.exports.chatbot_auto = (sender,message,callback)=>{
            if (message == "hi"){
                callback("Hello"+" "+sender)
            }
            else if(message.includes ("BMI") || (message.includes("bmi")))  {
                callback("Sure!! please provide me your weight in kgs and height in cms");
            }
            else if(message.includes ("water") || (message.includes("intake")))  {
                callback("Sure!! please provide me your weight in kgs to suggest the correct water consumption")
            }
            else if (message.includes("weight") && message.includes("height")){
                console.log("Message contains height and weight")
                let weight_fetch  = "weight is"
                let re = new RegExp(weight_fetch + "\\s*(\\d+)");
                let kg = message.match(re);
                console.log("the weight given in message is "+kg[1])
                let height_fetch  = "height is"
                let reg = new RegExp(height_fetch + "\\s*(\\d+)");
                let cm = message.match(reg);
                console.log("the height given in message is "+cm[1])
                axios.get("https://cca-cloud-microservices.herokuapp.com/bmi_calc?height="+cm[1]+"&weight="+kg[1])
                .then(function (response) {
                    console.log("Success for bmi microservice" +response.data);
                    callback(response.data)               
            })
            .catch(function (response) {
                console.log("error caught"+response.data);
            });
            }
            else if (message.includes("weight") && !message.includes("height")){
                console.log("Message contains only weight")
                let weight_fetch  = "weight is"
                let re = new RegExp(weight_fetch + "\\s*(\\d+)");
                let kg = message.match(re);
                console.log("the weight given in message is "+kg[1])
                axios.get("https://cca-sprint1-waterintake.azurewebsites.net/water_intake?weight="+kg[1])
                .then(function (response) {
                    console.log("Success for bmi microservice waterintake" +response.data);
                    callback(response.data)                
            })
            .catch(function (response) {
                console.log("error caught"+response.data);
            });
                
            }
            else if (message .includes ("how are you")){
                callback("i am doing good. Thanks for asking,"+ " " +sender.toUpperCase()+"!!!") 
            }
            else{
                callback("I DON'T HAVE ANY IDEA ON THAT!!")
            }
}