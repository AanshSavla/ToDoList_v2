const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv").config();
// const items = [];
// const workItems = [];

const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI);

const itemSchema = new mongoose.Schema({
  item:String
});

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  item:"Hello! Welcome to the to-do list."
});

const item2 = new Item({
  item:"Type the task and click on + to add in the list."
});

const item3 = new Item({
  item:"<-- Click here to remove the item from the list."
});

const defaultItem = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name:String,
  items:[itemSchema]
});

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  //const day = date.getDate();
  const day = "Today";
  Item.find().exec().then(function(itemList){
    if(itemList.length === 0){
      Item.insertMany(defaultItem);
      res.redirect("/");
    }
    res.render("list",{listTitle:day,newItemList:itemList})
  }).catch(function(err){
    console.log(err);
  });


});

app.post("/",function(req,res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  //console.log(itemName);
  itemNew = new Item({
    item:itemName,
  });
  if(listName === "Today"){
    itemNew.save().then(function(r){
      res.redirect("/");
    }).catch(function(err){
      console.log(err);
    });

  }
  else{
    List.findOne({name:listName}).exec().then(function(foundList){
      foundList.items.push(itemNew);
      foundList.save().then(function(r){
        res.redirect("/"+listName)
      }).catch(function(err){
        console.log(err);
      });

    }).catch(function(err){
      console.log(err);
    });
  }

  // if(req.body.button === "Work"){
  //   workItems.push(item);
  //   res.redirect("/work");
  // }else{
  //   items.push(item);
  //   res.redirect("/");
  // }


});

app.post("/delete",function(req,res){
  const itemDelete = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove({_id:itemDelete}).exec().then(function(r){
      res.redirect("/");
    }).catch(function(err){
      console.log(err);
    });

  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemDelete}}}).exec().then(function(r){
      res.redirect("/"+listName);
    }).catch(function(err){
      console.log(err);
    });
  }

});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
    if(customListName != "Favicon.ico"){
      List.findOne({name:customListName}).exec().then(function(result){
        if(!result){
          const list = new List({
            name:customListName,
            items:defaultItem
          });
          list.save().then(function(r){
            res.redirect("/"+customListName);
          }).catch(function(err){
            console.log(err);
          })

        }
        else{
          res.render("list",{listTitle:result.name,newItemList:result.items});
        }

      }).catch(function(err){
        console.log(err);
      });
    }


});

// app.get("/work",function(req,res){
//   res.render("list",{listTitle:"Work List",newItemList:workItems});
// });
//
// app.get("/about",function(req,res){
//   res.render("about");
// });


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started");
});
