var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,

	user: "root",
	password: "Jun1p3r",
	database: "bamazon"
});

//establishing connection with mysql database
connection.connect(function(error){
	if(error){
		console.log(error);
	}
	console.log("You are connected as ID " + connection.threadId);
	queryAll();
	
});

//displays all available products to the user along with their price and id
function queryAll(){
	connection.query("SELECT * FROM products", function(error, response){
		if(error){
			console.log(error);
		}
		
		console.log("ITEMS FOR SALE ON BAMAZON:" + "\n");		
		for (var i = 0; i < response.length; i++){
			console.log("ITEM: ", response[i].name);
			console.log("PRICE: ", response[i].price);
			console.log("ID: ", response[i].id);
			console.log("Quantity: ", response[i].quantity);			
			console.log("----------------------------------------");			
		}

		chooseItem();
	});

};

//inquirer prompts to find out what the user wants
function chooseItem(){

	inquirer.prompt([
{
	type:"input",
	message: "Enter the ID of the item you wish to purchase.",
	name: "idToBuy"
},

{
	type: "input",
	message: "How many units would you like to buy?",
	name: "units"
}
	]).then(function(answer){
		console.log(answer);		
		var query = "SELECT * FROM products WHERE ?";
		connection.query(query, {id: answer.idToBuy}, function(error, results){			
			var unitsRemaining;
			var unitPrice;
			for (var i = 0; i < results.length; i++){				
				unitsRemaining = results[i].quantity;
				unitPrice = results[i].price;
				
			}
			
			//if there is enough stock, subtract requested units from that item's remaining stock
			if(answer.units <= unitsRemaining){				
				var query = "UPDATE products SET ? WHERE ?";
				connection.query(
					query,
					[
						{
						 	quantity: unitsRemaining-answer.units
						},
						{
							 id: answer.idToBuy
						}
					],
					function(error){
						if(error){
							console.log(error);
							
						}
						console.log("Thank you for shopping with Bamazon. Your order has been placed.");
						console.log("The total for your purchase is: " + (unitPrice*answer.units).toFixed(2));
					}

					);
			//if there is not enough stock, let the user know
			} else {
				console.log("Sorry, we do not currently have enough stock to place your order.");
				chooseItem();
			}
		});
	});
};