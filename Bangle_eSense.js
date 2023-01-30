g.clear(1);
Bangle.setLCDTimeout(0);
Bangle.setLCDPower(1);
Bangle.setHRMPower(1);
Bangle.setCompassPower(1);


var started = 0;
var found_eSense = 0;
var slept = 0;


g.setFont("Vector", 20);
g.setFontAlign(1.1);
g.drawString("Start\nThe\nProgram", g.getWidth() / 2 + 40, g.getHeight() / 2, true);


function Print_any(iss, numb) {
  if (iss == 1) {
    g.setFont("Vector", 20);
    g.setColor("#B13577");
    g.setFontAlign(1.1);
    g.drawString(" Not Normal", 180, 110, true);
    g.drawString("       ", 140, 130, true);
    g.drawString(String(numb), 160, 130, true);
  } else if (iss == 2) {
    g.setFont("Vector", 20);
    g.setColor("#B13577");
    g.setFontAlign(1.1);
    g.drawString("     Normal", 180, 110, true);
    g.drawString("       ", 140, 130, true);
    g.drawString(numb, 160, 130, true);
  } else {
    g.setFont("Vector", 15);
    g.setColor("#B13577");
    g.setFontAlign(1.1);
    g.drawString("Connected", 220, 220, true);
  }
}

function Initiate_Bangle() {
  Bangle.on('HRM', function(hrmInfo) {
    if (slept) {
      g.setFont("Vector", 20);
      g.setFontAlign(1.1);
      g.drawString("Start\nThe\nProgram", g.getWidth() / 2 + 40, g.getHeight() / 2, true);
      slept = 0;
    }
    var c = hrmInfo.confidence;
    var h = hrmInfo.bpm;
    g.setFont("Vector", 30);
    g.setColor("#A77777");
    g.setFontAlign(1.1);
    g.drawString(h + " BPM", 180, 40, true);
    g.setFont("Vector", 20);
    g.drawString(c + " conf", 180, 70, true);
    if (c > 40 && h > 170) {
      // Bangle.buzz(1000);
    }
  });

  var counter = 0;
  var counter1 = 0;
  Bangle.on('accel', a => {
    var MG = Bangle.getCompass();
    var HD = Math.round(MG.heading);

    if (!(a.x >= 0 && a.y >= 0 && a.z <= 0) || ((HD > 50) && (HD < 180))) {
      counter++;
    } else {
      counter = 0;
    }

    g.setFont("Vector", 20);
    g.setColor("#F12347");
    g.setFontAlign(1.1);
    if (counter >= 40) {
      if (counter1 == 0) {
        g.drawString("  FOCUS!", 100, 190, true);
        Bangle.buzz(1000);
        counter = 0;
      }
    } else {
      if (counter1 == 1) {
        g.drawString("Waiting!", 100, 190, true);
      } else if ((a.x >= 0 && a.y >= 0 && a.z <= 0)) {
        g.drawString("DRIVING!", 100, 190, true);
      }
    }
  });

  setWatch(() => {
    Bangle.buzz();
    E.showMessage("Go\nTo\nthe Sleep!!!");
    setTimeout(() => g.clear(), 1000);
    wait_and_hold(1000);
    slept = 1;
    Bangle.softOff();
  }, BTN1, {
    repeat: true
  });

  setWatch(() => {
    Bangle.buzz();
    if (counter1 == 0) {
      E.showMessage("Waiting.....\n.....Waiting");
      counter1 = 1;
    } else {
      E.showMessage("Welcome.....\n.....Back!!!");
      counter1 = 0;
    }
    setTimeout(() => g.clear(), 1000);
    wait_and_hold(1000);
  }, BTN3, {
    repeat: true
  });
}

///////////////////////////eSense Code///////////////////////////////////////////////
var gatt, characteristic, s;
var cc = 0;

function Start_the_program() {
  NRF.requestDevice({
    filters: [{
      name: 'eSense-0770'
    }]
  }).then(function(device) {
    console.log("Found");
    return device.gatt.connect();
  }).then(function(gg) {
    console.log("Connected");
    Print_any(3, 3);
    gatt = gg;
    return gatt.getPrimaryService(
      "0xFF06");
  }).then(function(service) {
    s = service;
    return service.getCharacteristic(
      "0xFF07");
  }).then(function(c) {
    return c.writeValue([83, 53, 2, 1, 50]);
  }).then(function() {
    return s.getCharacteristic("0xFF08");
  }).then(function(c) {
    console.log("Got Characteristic");
    characteristic = c;
    setInterval(startWriting, 3000);
    if (started == 0) {
      Initiate_Bangle();
      started = 1;
    }
  }).catch(function(e) {
    if (!found_eSense) {
      g.drawString("No\nDevice\nFound\nRestart?", 120, 90, true);
      found_eSense = 1;
    } else {
      g.setFont("Vector", 15);
      g.setColor("#CC3377");
      g.setFontAlign(1.1);
      g.drawString("No\nService\nFound\nRestart?", 220, 170, true);
    }
  });
}

function startWriting() {
  s.getCharacteristic("0xFF08")
    .then(function(s) {
      return s.readValue();
    })
    .then(function(d) {
      //console.log("x: " + d.buffer[9] + " " + d.buffer[10] + " " + Math.abs(d.buffer[9] - d.buffer[10]));
      //console.log("ya: " + d.buffer[11] + " " + d.buffer[12] + " " + Math.abs(d.buffer[11] - d.buffer[12]));
      //console.log("z: " + d.buffer[13] + " " + d.buffer[14] + " " + Math.abs(d.buffer[13] - d.buffer[14]));
      var pr = Math.abs(d.buffer[10] - d.buffer[11]) + Math.abs(d.buffer[12] - d.buffer[13]) + Math.abs(d.buffer[14] - d.buffer[15]);
      //console.log("Totala " + pr);
      //console.log("yg: " + d.buffer[5] + " " + d.buffer[6] + " " + Math.abs(d.buffer[5] - d.buffer[6]));
      pr = Math.abs(d.buffer[4] - d.buffer[5]) + Math.abs(d.buffer[6] - d.buffer[7]) + Math.abs(d.buffer[8] - d.buffer[9]);
      //console.log("Totalg " + pr);
      //examine_single_axis_reading(d,6,7);
      if (Math.abs(d.buffer[5] - d.buffer[6]) > 200 || Math.abs(d.buffer[5] - d.buffer[6]) < 100) {
        if (cc > 1) {
          //console.log("Not Normal");
          Print_any(1, Math.abs(d.buffer[5] - d.buffer[6]));
        } else {
          //console.log("Not Normal");
          Print_any(1, Math.abs(d.buffer[5] - d.buffer[6]));
          cc++;
        }
      } else {
        //console.log(" Normal");
        Print_any(2, Math.abs(d.buffer[5] - d.buffer[6]));
        cc = 0;
      }
    });
}

function wait_and_hold(ms) {
  const time = Date.now();
  let curr_time = null;
  do {
    curr_time = Date.now();
  } while ((curr_time - time) < ms);
}

setWatch(() => {
  Bangle.buzz();
  E.showMessage("Restarting\nthe\nProgram!");
  setTimeout(() => g.clear(), 1000);
  wait_and_hold(1500);
  Start_the_program();
}, BTN2, {
  repeat: true
});

////////////////////////////////////////////Trial and Error//////////////////////////////////////
/*
Gyro x: [4] [5]
Gyro y: [6] [7]
Gyro z: [8] [9]
Acce x: [10] [11]
Acce y: [12] [13]
Acce z: [14] [15]
*/
function examine_rmsqrt_reading(xv,yv,zv){
  return Math.sqrt(Math.pow(xv,2)+Math.pow(yv,2)+Math.pow(zv,2));
}

function examine_object_reading(obj){
  return Math.abs(obj.buffer[10] - obj.buffer[11]) + Math.abs(obj.buffer[12] - obj.buffer[13]) + Math.abs(obj.buffer[14] - obj.buffer[15]);
  //return Math.abs(obj.buffer[4] - obj.buffer[5]) + Math.abs(obj.buffer[6] - obj.buffer[7]) + Math.abs(obj.buffer[8] - obj.buffer[9]);
}
function examine_single_axis_reading(obj,i,j){
  return Math.abs(Math.abs(obj.buffer[i] - obj.buffer[j]));
}