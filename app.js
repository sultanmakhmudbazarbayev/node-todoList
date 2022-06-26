//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

// to use body-parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var todoListDB = mongoose.connect("mongodb+srv://admin-sula:Naruto123@cluster0.n3a3c.mongodb.net/todoListDB");

const itemSchema = new mongoose.Schema({
    task: {
        type: String,
        required: true,
    },

});

const Item = mongoose.model("Task", itemSchema);



// let items = ["Buy Food", "Cook food", "Eat food"];
// let workItems = [];

// for ejs
app.set('view engine', 'ejs');

const item1 = Item({
    task: "Welcome to your todoList!"
});
const item2 = Item({
    task: "Write task and hit + button to add it!"
});
const item3 = Item({
    task: "<--- Hit this to delete an item!"
});

const defaultItems = [item1, item2, item3];

const listSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    tasks: [itemSchema], 
});

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
    

    Item.find({}, function(err, foundItems){
        if(foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err){
                if(err) {
                    console.log(err);
                } else {
                    console.log("Successfully inserted!");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {listTitle: "Today", items : foundItems});
        }
    });

});


app.post("/", function(req, res) {
    
    const taskName = req.body.newItem;
    const listName = req.body.List;

    const newItem = Item({
        task: taskName,
    });

    if(listName === "Today") {
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList) {
            foundList.tasks.push(newItem);
            foundList.save();
            res.redirect("/"+listName);
        })
    }


});

app.post("/delete", function(req, res) {
    
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    console.log(checkedItemId);
    console.log(listName);

    if(listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function(err) {
            if(!err) {
                res.redirect("/");
            }
        });
    } 
    else {
        List.findOneAndUpdate({name: listName}, {
            $pull: {tasks: {_id: checkedItemId}}
        }, function(err, foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        });
        
    }

    

    
});

app.get("/:listName", function(req, res) {
    const listName = _.capitalize(req.params.listName);

    const list = new List({
        name: listName,
        tasks: defaultItems,
    })

    List.findOne({name: listName}, function(err, foundList){
        if(!err) {
            if(foundList) {
                
                // show an existing list
                res.render("list", {listTitle: foundList.name, items : foundList.tasks});
                
            } else {
                
                // create a new list

                const list = new List({
                    name: listName,
                    tasks: defaultItems,
                });
                list.save();

                res.redirect("/"+listName);
            }
        }
    });



    
}); 

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port);


app.listen(port, function() {
    console.log("Server has started successfully!");
});