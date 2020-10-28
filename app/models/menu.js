const mongoose = require('mongoose');

const Schema = mongoose.Schema;  //if the first letter is capital then either the name will  be a class or a constructor


const menuSchema= new Schema ({
    name : { type: String ,required:true,},
    image : { type: String ,required:true,},
    price : { type: Number ,required:true,},
    size : { type: String ,required:true,}
})

const Menu = mongoose.model("Menu",menuSchema)

module.exports=Menu;