//BUDGET CONTROLLER
var  budgetController = (function(){
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    //This is the data structure for the budgety app
    var data = {
        allItems: {
            exp:[],
            inc:[]
        },
        totals: {
            exp:0,
            inc:0
        }
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
        expensesContainer: '.expenses__list'
    }

    return {
        getinput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, 
                description: document.querySelector(DOMstrings.inputDesc).value, 
                value: document.querySelector(DOMstrings.inputVal).value
            };
        }, 
        // Making DOMstrings object public to the other controllers
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

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
    };

    // This function gets called in the setupEventListeners function, which is actually called in the init method that is called at the bottom of this code. 
    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get the fied input data
        input = UICtrl.getinput();
        console.log(input);

        // 2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        // 3. add the item to the UI
        UICtrl.addListItem(newItem, input.type);

        // 4. clear the fields
        UICtrl.clearFields();

        // 5. Calculate the budget

        // 6. Display the budget on the UI
    };
    // This makes the init function public so we can call it. 
    return {
        init: function() {
            console.log('Application has started.');
            setupEventListeners();
        }
    }

// We pass in the two controllers when we invoke this function expression
})(budgetController, UIController);

// Before this next line of code runs keep in mind that all these IIFE's will already have been invoked. However, nothing will seem like anything is changed because all of the functions inside the modules are either just function declarations or function expressions. Nothing will run until we invoke the function from the controller which initiates everything. That is what this next line of code is for. 
controller.init();

// Modules Pattern: Do not invoke any function within the modules pattern unless you are absolutely certain you need that function to be invoked. Javascript works line by line and have an execution stack hierarchy.

// Remember essentially everything that is not a primitive in javascript is an object. and every object will have access to prototype. 

