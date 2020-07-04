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
  }
}

