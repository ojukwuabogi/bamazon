var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,

	user: "root",
	password: "Jun1p3r",
	database: "bamazon"
});

connection.connect(function(error){
	if(error){
		console.log(error);
	}
	//console.log("You are connected as ID " + connection.threadId);
	managerAction();

});


//function to find out what action the manager wants to perform
function managerAction(){

	inquirer.prompt([
		{
			type: "list",
			name: "action",
			message: "What would you like to do?",
			choices: ["View products for sale", "View low inventory", "Add to inventory", "Add new product"],
			filter: function(val){
				if (val === "View products for sale"){
					return "viewAll";
				} else if (val === "View low inventory"){
					return "lowInventory";
				} else if (val === "Add to inventory"){
					return "addInventory";
				} else if (val === "Add new product"){
					return "addProduct";
				}

			}
		}
		]).then(function(answers){
			// console.log(answers);
			// console.log(JSON.stringify(answers));
			if(answers.action === "viewAll"){
				viewAllInventory();
			} else if (answers.action === "lowInventory"){
				viewLowInventory();
			} else if (answers.action === "addInventory"){
				addInventory();
			} else if (answers.action === "addProduct"){
				addNewProduct();
			}
		});
};


//function to view all inventory
function viewAllInventory(){
	console.log("Here are the products for sale");
	connection.query("SELECT * FROM products", function(error, response){
		if(error){
			console.log(error);
		}
		
		for(var i = 0; i < response.length; i++){
			console.log("ID: " + response[i].id + "\nITEM: " + response[i].name + "\nPrice: " + response[i].price + "\nQuantity: " + response[i].quantity + "\n------------------");
		}
		continueSearch();
	})
}

//function to view products that have fewer than five units in stock
function viewLowInventory(){
	console.log("Here is inventory with fewer than five units in stock.");
	connection.query("SELECT * FROM products WHERE quantity < 5", function(error, response){
		if(error){
			console.log(error);
		}
		console.log(response);
		for (var i = 0; i < response.length; i++){
			console.log("WARNING! There are fewer than 5 units in stock for these items!\nID: " + response[i].id + "\nItem: " + response[i].name);
		}

		continueSearch();
	})
}

//function to add inventory to an existing product
function addInventory(){
	inquirer.prompt([
		{
			type:"input",
			message: "Please enter the ID of the item whose quantity you want to increase",
			name: "item"
		},
		{
			type:"input",
			message: "How many units would you like to add?",
			name: "units"
		}
		]).then(function(answers){
			var itemToAdd = answers.item;
			var quantityToAdd = parseInt(answers.units);
			var currentStock;	
			var itemName = "";

			var query = "SELECT * FROM products WHERE ?";
			connection.query(query, {id: itemToAdd}, function(error, results){
				if(error){
					console.log(error);
				}
				
				for (var i = 0; i < results.length; i++){
					currentStock=parseInt(results[i].quantity);
					itemName=results[i].name;
					//console.log("Current Stock: " + currentStock);
					console.log("Adding " + quantityToAdd + " units of " + results[i].name + ".");
				}
				
				var updateQuery = "UPDATE products SET ? WHERE ?";
				connection.query(
					updateQuery,
					[
						{
							quantity: currentStock+quantityToAdd
						},
						{
							id: itemToAdd
						}

					],
					function(error){
						if(error){
							console.log(error);
						}
						console.log("Successfully added. You now have " + (currentStock+quantityToAdd) + " units of " + itemName + "in stock.");
					})
				continueSearch();
			})
		})
}

//function to add a brand new product to the database
function addNewProduct(){
	console.log("Add a new product");
	inquirer.prompt([
		{
			type: "input",
			message: "What is the name of the product ?",
			name: "product_name"
		},
		{
			type: "input",
			message: "Enter the department name of the product.",
			name: "department_name"
		},
		{
			type: "input",
			message: "What is the price of the product?",
			name: "price",
		},
		{
			type: "input",
			message: "How many units of the product would you like to add?",
			name: "stock_quantity"
		}
		]).then(function(answers){
			console.log(answers);

			var insertQuery = "INSERT INTO products SET ?";
			connection.query(
				insertQuery,
				{
					name: answers.product_name,
					department: answers.department_name,
					price: answers.price,
					quantity: answers.stock_quantity
				}, function(error, results){
					if(error){
						console.log(error);
					}
					console.log("Product successfully added.");
				})
			continueSearch();	
		})
}

//function to ask the manager if they would like to continue using the program and perform another action
function continueSearch(){
			inquirer.prompt([
			{
				type: "checkbox",
				message: "Would you anything else?",
				name: "continue",
				choices: ["Yes","No"]
			}
			]).then(function(answers){	
				
				if(answers.continue[0] === "Yes"){
					console.log("OK .");
					managerAction();
				}
				else{
					console.log("Have a Great Day!");
				}
			})
}