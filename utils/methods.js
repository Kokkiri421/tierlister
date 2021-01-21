const errors = require("./errors");
const mongoose = require('mongoose');

const Tierlist = mongoose.model('Tierlist');
const Tier = mongoose.model('Tier');
const Element = mongoose.model('Element');

function moveArrayElement(array, from, to) {
  if (to >= array.length) {
    to = array.length-1;
  }
  
  const elm = array.splice(from, 1)[0];
  array.splice(to, 0, elm);
  return array;
};

function validateFields(fields, fieldNames) {
  fieldArray = fields.map( function(field, i){
    if (typeof field == 'undefined') {
      throw new errors.BaseError(name='ValidationError', message=`field ${fieldNames[i]} is required`);
    }   
  })
}

async function validateModel(user, model, name, id, isOwnerOnly, populate = false) {
  if (populate) {
    var foundModel = await model.findOne({_id: id}).populate(populate).exec();
  } else {
    var foundModel = await model.findOne({_id: id}).exec();
  }
  
  if (!foundModel) {
    throw new errors.BaseError("NotFoundError", `No such ${name}`);
  }
  
  if (!user.equals(foundModel.owner) && isOwnerOnly) {
    throw new errors.BaseError("Unauthorized","Wrong user"); 
  }
  
  return foundModel;
}

module.exports = {
  moveArrayElement,
  validateFields,
  validateModel
}
