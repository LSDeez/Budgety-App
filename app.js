//BUDGET CONTROLLER
var  budgetController = (function(){
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0){
            this.percentage  = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    // Created a private function that sums the totals of each data type's arrray (inc and exp)
    var  calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }

    //This is the data structure for the budgety app
    var data = {
        allItems: {
            exp:[],
            inc:[]
        },
        totals: {
            exp:0,
            inc:0
        },
        // Created two new properties in the data structure (budget and percentage) these will be used in the budget calculations
        budget: 0,
        // Use -1 in the percentage to represent that it is non existent
        percentage: -1
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            // create new ID
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            } else {
                ID = 0;
            }
            
            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp'){
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        // Created a delete item method that will delete the item from the data structure. The parameters in deleteItem are going to be "type" and "ID". The reason "ID" is capitalized is to not confuse it when we call the id property of the "current" parameter in the array.map method. 
        deleteItem: function(type, ID) {
            var ids, index;

            // Stores the new current array in a variable called ids
            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            // Finds the index of the ID within the new array we just created and stores that value in the "index" variable
            index = ids.indexOf(ID);

            // Set this up so we dont run this method if there is no id in the DOM structure. Also we are removing the data from the data structure by using the Array.splice method. 
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        // Created a public method that creates the budget calculations for the budgety app
        calculateBudget: function() {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },


        
        // Returns these values as an object so we can use these values later on
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        }
    };

})();



// UI CONTROLLER
var UIController = (function(){
    // Private data not accessible outside this IIFE
    var DOMstrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputVal: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNumber = function(num, type){
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length -3, 3); 
        }

        dec = numSplit[1];

        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;

    };

    // Creates a for loop function that I can use to loop through the array of items under the class name .item__percentage.The first two arguments are the array and the callback function.
    var nodeListForEach = function(list, callback){
        for (var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getinput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, 
                description: document.querySelector(DOMstrings.inputDesc).value, 
                value: parseFloat(document.querySelector(DOMstrings.inputVal).value)
            };
        }, 
        // Making DOMstrings object public to the other controllers
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc'){
                element = DOMstrings.incomeContainer;
                // Changed the id "income-" to "inc-" to make it easier to grab the data.
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp'){
                element = DOMstrings.expensesContainer;
                // Changed the id "expense-" to "exp-" to make it easier to grab the data.
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

            },

            deleteListItem: function(selectorID) {
                
                var el =  document.getElementById(selectorID);
                el.parentNode.removeChild(el);
            },

            clearFields: function() {
                var fields, fieldsArr;
                // This returns a list instead of an array. We need to convert this into an array.
                fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputVal);
                // Array is the function contructor for all arrays. meaning that all the array methods are stored in here. 
                fieldsArr = Array.prototype.slice.call(fields);
                // Loops through all the items and sets the HTML of these fields back to nothing.
                fieldsArr.forEach(function(current, index, array) {
                    current.value = "";
                });
                // Sets the focus back on the descritpion input field.
                fieldsArr[0].focus();
            },
            
            // Displays the results onto the HTML webpage by creating a function that targets the HTML class names and sets the text content to the values that were returned as an object from the Budget Controller Module
            displayBudget: function(obj){
                var type;
                obj.budget > 0 ? type = 'inc' : type = 'exp';

                document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
                document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
                document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
                

                if (obj.percentage > 0) {
                    document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
                } else {
                    document.querySelector(DOMstrings.percentageLabel).textContent = '---';
                }

            },

            displayPercentages: function(percentages) {
                // creates an array called NodeList that is a part of the HTML DOM structure
                var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
                
                // Calling the function
                nodeListForEach(fields, function(current, index){
                    // This is the callback function with our own code written in it. 
                    if (percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                    } else {
                        current.textContent = '---';
                    }
                });
            },

            displayMonth: function() {
                var now, year, months, month;
                now = new Date();

                months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                month = months[now.getMonth()];
                year = now.getFullYear();

                document.querySelector(DOMstrings.dateLabel).textContent = month + ' ' + year;
            },

            changedType: function(){

                var fields = document.querySelectorAll(
                    DOMstrings.inputType + ',' +
                    DOMstrings.inputDesc + ',' +
                    DOMstrings.inputVal);

                nodeListForEach(fields, function(cur){
                    cur.classList.toggle('red-focus');
                });

                document.querySelector.toggle(DOMstrings.inputBtn).classList.toggle('red');

            },
            
            // Allows the 'DOMstrings object' to become public to use in the Global App Controller by calling this method inside the UI Controller 
            getDOMstrings: function() {
                return DOMstrings;
            }  
        };    
})();

// The Global App Controller is used to combine modules so they can interact with each other.

// GLOBAL APP CONTROLLER
var  controller = (function(budgetCtrl, UICtrl){
    // This function sets up the initialization that will start the budgety app
    var setupEventListeners = function() {

        // Grabs the 'DOMstrings object from the UI Controller
        var DOM = UICtrl.getDOMstrings();

        // Targets the '.add__btn' class and adds an event listener
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // Adds another event listener when hitting the 'return' key to add item to the UI and Budget controllers
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        // Added and event listener to the container where all the income and expenses will be contained in. This is to set up event delegation
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)

    };

    var updateBudget = function() {
        // 1. Calculate the Budget
        // Calculates the budget so it can be returned into a variable later on
        budgetCtrl.calculateBudget();

        // 2.return the budget
        // This retrieves the calculations made in the Budget Controller and stores them into a variable we can use to update the Budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        // Takes the data that we stored in budget and shows it in the HTML page. We are using the displayBudget method from the UI Controller
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        
        //1 .Calculate the percentages
        budgetCtrl.calculatePercentages();

        //2. Read the percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    }
    
    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get the fied input data
        input = UICtrl.getinput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0){
        // 2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        // 3. add the item to the UI
        UICtrl.addListItem(newItem, input.type);

        // 4. clear the fields
        UICtrl.clearFields();

        // 5. Calculate and update budget
        updateBudget();

        // 6. Calculate the new percentages
        updatePercentages();
        }
    };

    // I am passing the event as the parameter because we are going to being using this inside an event handler
    var  ctrlDeleteItem = function(event){
        // Set up the stage to delete the items from the budget UI
        var itemID, splitID, type, ID;

        // DOM traverses to the parent node that has the inc or exp id
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            //
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }

    }
    // This makes the init function public so we can call it. 
    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            
            // Initializing the UI so when we start the application everything is set to zero. 
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

// We pass in the two controllers when we invoke this function expression
})(budgetController, UIController);

// Before this next line of code runs keep in mind that all these IIFE's will already have been invoked. However, nothing will seem like anything is changed because all of the functions inside the modules are either just function declarations or function expressions. Nothing will run until we invoke the function from the controller which initiates everything. That is what this next line of code is for. 
controller.init();

// Modules Pattern: Do not invoke any function within the modules pattern unless you are absolutely certain you need that function to be invoked. Javascript works line by line and have an execution stack hierarchy.

// Remember essentially everything that is not a primitive in javascript is an object. and every object will have access to prototype. 

