const chalk = require('chalk');

//export utility funcitons
module.exports = {
  //visible errors
  errorHandler: function(){
    console.log(`${chalk.black.bgRed(`~~~~`)}🔥🔥🔥🔥🔥🔥🔥🔥🔥${chalk.black.bgRed(`BEGIN ERROR`)}🔥🔥🔥🔥🔥🔥🔥🔥🔥${chalk.black.bgRed(`~~~~`)}`);
    for (let i = 0; i < arguments.length; i++) {
      console.log(arguments[i]);
    }
    console.log(`${chalk.black.bgRed(`~~~~`)}🔥🔥🔥🔥🔥🔥🔥🔥🔥${chalk.black.bgRed(`END ERROR`)}🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥${chalk.black.bgRed(`~~~~`)}`);
  },
  //visible log
  log: function(){
    console.log((`~~~~👾👾👾👾👾👾👾👾👾👾👾${chalk.black.bgGreen(`BEGIN LOG`)}👾👾👾👾👾👾👾👾👾👾👾~~~~`));
    for (let i = 0; i < arguments.length; i++) {
      console.log(arguments[i]);
    }
    console.log((`~~~~👾👾👾👾👾👾👾👾👾👾👾${chalk.black.bgGreen(`END LOG`)}👾👾👾👾👾👾👾👾👾👾👾👾~~~~`));
  },
  //return true is object is has not contents
  objectIsEmpty: function(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
  },
  //millisecond conversions
  mSec: {
    min: 1000 * 60,
    hour: 1000 * 60 * 60,
    day: 1000 * 60 * 60 * 24,
    week: 1000 * 60 * 60 * 24 * 7,
    month: 1000 * 60 * 60 * 24 * 7 * 4
  },
  //returns current time minus a range in UTC ms
  getTimeRange: function(range){
    //figure out current UTC time
    let currentTime = new Date();
    currentTime = currentTime.getTime();
    let minimumTime;
    switch(range){
      case 'lastHour':
        minimumTime = currentTime - this.mSec.hour;
        break;
      case '24Hr':
        minimumTime = currentTime - this.mSec.day;
        break;
      case 'lastWeek':
        minimumTime = currentTime - this.mSec.week;
        break;
      case 'lastMonth':
        minimumTime = currentTime - this.mSec.month;
        break;
      case 'all':
        minimumTime = 0;
        break;
      default:
        minimumTime = 0;
    }
    return minimumTime;
  }
}

