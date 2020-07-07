//utility funcitons
const chalk = require('chalk');
//export utility funcitons
module.exports = {
  //visible errors
  errorHandler: function(error){
    let flash = chalk.black.bgRed(`~~~~🔥🔥🔥🔥🔥🔥🔥error🔥🔥🔥🔥🔥🔥🔥~~~~`);
    console.log(flash);
    console.log(error);
    console.log(flash);
  },
  //visible log
  log: function(message){
    let flash = (`~~~~👾👾👾👾👾👾👾👾👾👾👾${chalk.black.bgGreen(`LOG`)}👾👾👾👾👾👾👾👾👾👾👾~~~~`);
    console.log(flash);
    console.log(message);
    console.log(flash);
  }
}

