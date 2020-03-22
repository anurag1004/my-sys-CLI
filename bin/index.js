#!/usr/bin/env node
const os    = require('os'),
      chalk = require('chalk'),
      boxen = require('boxen'),
      yargs = require('yargs'),
      ps    = require('ps-node'),
      axios = require('axios'),
    cheerio = require('cheerio');

let boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "green",
    backgroundColor: "#555555"
};
const CPUMODEL = ()=>{
    //console.log(os.cpus());
    //listing details of all logical cores of cpu
    const cpuModel = os.cpus()[0].model;
    console.log("CORES : ")
    let coreCount = os.cpus().length;
        console.log(boxen(`${coreCount++}`,{
            padding: 1,
            margin: 2,
            borderStyle: "singleDouble",
            borderColor: "magenta",
            backgroundColor: "#555555" 
        }));
        console.log("CPU MODEL : ")
    console.log(boxen(chalk.yellowBright(cpuModel),boxenOptions));
    }
const TOTALSYSMEM = ()=>{
    //to get total system memory
    const sysMem = os.totalmem();
    console.log(`Total System Memory : ${chalk.green(sysMem)} Bytes | ${Number(sysMem/(1e9))} GB`);
    }
const AVAILSYSMEM = ()=>{
    //to get amount of free system memory -> os.freemem()
    let freemem = os.freemem(); //in bytes
    console.log(`Free System Memory : ${chalk.green(freemem)} Bytes | ${Number(freemem)/(1e9)} GB`);
    }
const GETPRIORITY = (pid)=>{
  //get process priority -> os.getPriority([pid])
  try{
    let pidPriority = os.getPriority(pid); //if no argument is provided then priority of current process is returned
    // -20(high priority) and 19(low priority)
  console.log(chalk.greenBright(`Priority Range -20(highest) to 19(lowest)`));
  console.log(`Process Priority PID - ${pid} : ${chalk.yellow(pidPriority)}`);
  }catch(err){
    console.log(chalk.red(`ERROR CODE: ${err.code}\n${err.info.message}`));
  }
}
const GETKERNEL = ()=>{
    let curr_nodeversion = process.version;
    //kernal version
    if(curr_nodeversion.match(/13.11/g)!=null){
        const kernelVer = os.version(); //only works in nodev > 13.11.x
        console.log(`Kernel Version : ${chalk.yellow(kernelVer)}`);
    }else{
        console.log(chalk.red("Update your node version to 13.11.x !"));
    }
}
    //Show hostname as welcome
    //hostname
console.log(`${boxen(chalk.whiteBright(`********HOST********\n${os.hostname()}`),boxenOptions)}`);
//for taking cmd line args
const options = yargs
 .usage(`Usage: \n--cpu\n--gp <PID>\n${chalk.yellow(`--sp --pid <PID>`)}\n--err <errcode>\n--kill <pid>`)
 .option("cpu", { alias: "cpuInfo", describe: "Get you CPU Details", type: "boolean", value: true})
 .option("mem",{alias:"sysMem",describe:"Get total system memory",type: "boolean", value: true})
 .option("currOS",{alias:"CURROS",describe:"Get info about current OS", type: "boolean",value:true})
 .option("gp",{alias:"getPriority",describe: "Get Priority",type:"number"})
 .options({
     'sp':{
         alias:"setPriority",
         describe: `Set Priority ${chalk.red(("[Requires root permission]"))}`,
         type: "number"
     },
     'pid':{
         type: "number",
         describe: `Process ID ${chalk.yellow('[use with --sp]')}`
     }
 })
 .option("uptime",{alias:"uptime",describe: "Get System  Uptime",type:"boolean",value:true})
 .option('kv',{alias:"kernelV",describe:`Get current kernel version\n ${chalk.yellow("Requires node verion 13.11.x or greater")}`,type:"boolean",value:true})
 .option('kill',{describe:"Kill a specific process. --kill <PID>",type:'number'})
 .option('err',{describe:"Get details about most common linux error codes",type:'number'})
 .argv;

 if(options.cpuInfo){
    CPUMODEL();
 }else if(options.sysMem){
        TOTALSYSMEM();
        AVAILSYSMEM();
 }else if(options.currOS){
    //get os -> os.platform()
    const platform = os.platform();
    console.log(`Platform : ${chalk.magenta(platform)}`);
    //get os type
    const OStype = os.type();
    console.log(`OS Type : ${chalk.magenta(OStype)}`);

    //get operating system as string -> os.release()
    const release = os.release();
    console.log(`Release : ${chalk.magenta(release)}`);

 }else if(options.getPriority){
    GETPRIORITY(options.getPriority);
 }else if(options.setPriority){
    // console.log(options);
     if(!options.pid){
         console.log(`${chalk.red(`Incorrect usage ! Please use as stated below \n`)} ${chalk.yellow('--sp --pid <PID>')}`);
     }else{
    //setting priority of a particular pid require root permission
         if((options.sp >= -20 && options.sp <= 19) && ((typeof options.pid).toString() === 'number')&&((typeof options.setPriority).toString() === 'number')){
            os.setPriority(options.pid,options.setPriority);
            console.log("SUCESS!!");
            GETPRIORITY(options.pid);
        }
     }
 }else if(options.setPriority == 0){
    if(!options.pid){
        console.log(`${chalk.red(`Incorrect usage ! Please use as stated below \n`)} ${chalk.yellow('--sp --pid <PID>')}`);
    }else{
   // setting priority of a particular pid require root permission
        if((options.sp >= -20 && options.sp <= 19) && ((typeof options.pid).toString() === 'number')&&((typeof options.setPriority).toString() === 'number')){
           os.setPriority(options.pid,options.setPriority);
           console.log("SUCESS!!");
           GETPRIORITY(options.pid);
       }
    }
 }else if(options.uptime){
    //get system Uptime
    let Uptime = os.uptime();
    console.log(`Uptime : ${chalk.magenta(Uptime)} s | ${chalk.magenta((Number(Uptime)/60).toPrecision(3))} min | ${chalk.magenta((Number(Uptime)/3600).toPrecision(3))} hr`);
 }else if(options.kernelV){
     GETKERNEL();
 }else if(options.kill){
     if((typeof options.kill).toString() === 'number'){
        ps.kill( options.kill, function( err ) {
            if (err) {
                throw new Error( err );
            }
            else {
                console.log( 'Process %s has been killed!', options.kill );
            }
        });
     }else{
         console.log(chalk.red("PID should be a number!!"));
     }

 }else if(options.err){
     //webscrapper
     console.log(chalk.green("Finding err code from the web.... "));
        let i = 0;  // dots counter
        let ch;
        const interval = setInterval(function() {
              process.stdout.clearLine();  // clear current text
              process.stdout.cursorTo(0);  // move cursor to beginning of line
              i = (i + 1) % 4;
              var dots = new Array(i + 1).join(".");
              process.stdout.write(`${chalk.green('Please Wait')} ${chalk.yellowBright(dots)}`);  // write text
            }, 300);
    
     axios.get('https://mariadb.com/kb/en/operating-system-error-codes/')
     .then(page=>{
         //console.log(page.data);
         let flag = false;
         const $ = cheerio.load(page.data);
         const trs = $('tr');
         //console.log(Number((trs[1].children[0].children)[0].data));
         //console.log($('tr').length);
         for(let i=0;i<trs.length;i++){
             for(let j=0;j<trs.children.length;j++){
                 if(Number((trs[i].children[j].children)[0].data) === options.err && !flag){
                     process.stdout.clearLine();
                     process.stdout.cursorTo(0);
                    console.log(`\nDescription : ${chalk.yellow((trs[i].children[j+2]).children[0].data)}`);
                    console.log(`Error Code : ${chalk.yellow((trs[i].children[j+1]).children[0].data)}`);
                    flag = true;
                    clearInterval(interval);
                 }
             }
         }
         if(!flag){
             console.log(chalk.greenBright("Sorry no such error code found :("));
         }
         //console.log((tr[1].children[0].children)[0].data);
     })
     .catch(err=>{
         console.log(err);
     });
 }
 else{
     //console.log(options)
     console.log(chalk.red("Invalid option ! Please see --help"));
 }	