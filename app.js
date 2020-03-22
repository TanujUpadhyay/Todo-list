//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-tanuj:tanuj123@cluster0-bgu6b.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemSchema ={
    name:String
};

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name:"welcome to your todolist!!",
});

const item2 = new Item({
  name:"Hit the + button add a new iteam.",
});

const item3 = new Item({
  name:"<--- hit this to delete an iteam.",
});

const defaultItems = [item1,item2,item3];


const listSchema = {
  name:String,
  iteam:[itemSchema]
}

const List = mongoose.model("List",listSchema);



app.get("/", function(req, res) {

  
  
  Item.find({},(err,foundItems)=>{

  if(foundItems.length===0){
            
      Item.insertMany(defaultItems,(err)=>{
        if(err)
          console.log(err);
        else
          console.log("Succesfuly inserted!!!");
      });
      //res.redirect("/");
  }
  else
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    
  });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  
  const item = new Item({
    name:itemName
  });

  if(listName ==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
        List.findOne({name:listName},(err,foundList)=>{
        foundList.iteam.push(item);
        foundList.save();
        res.redirect("/"+listName);
    });
  }
});



app.post("/delete",(req,res)=>{
    const checkItemid =  req.body.checkbox;
    const listName = req.body.listName;

    if(listName==="Today")
    {
      Item.findByIdAndRemove(checkItemid,(err)=>{
        if(!err){
          console.log("Succesfuly deleted!!!!!");
          res.redirect("/");
        }
      });
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{iteam:{_id:checkItemid}}},(err,foundList)=>{
             if(!err){
               res.redirect("/"+listName);
             } 
        });
    }

}); 



app.get("/:customListname",(req,res)=>{
  const customListname= _.capitalize(req.params.customListname);
  
  List.findOne({name:customListname},(err,foundList)=>{
    if(!err)
    {
      if(!foundList){
        const list = new List({
          name:customListname,
          iteam:defaultItems
        });
        list.save();
        res.redirect("/" + customListname);
      }
      else{
        res.render("list", {listTitle: foundList.name , newListItems:foundList.iteam});
        
      }
    }
  });

  
});

let port = process.env.PORT;
if(port==null || port==""){
  port=3000;
}


app.listen(port, function() {
  console.log("Server started on port succsfully");
});
