//handy functions and data
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

