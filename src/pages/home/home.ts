import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Gyroscope, GyroscopeOrientation, GyroscopeOptions } from '@ionic-native/gyroscope';
import {
    DeviceMotion, DeviceMotionAccelerationData,
    DeviceMotionAccelerometerOptions
} from '@ionic-native/device-motion';

import * as io from 'socket.io-client';
import {Observable} from 'rxjs/Rx';

declare var cordova: any;
declare var sensors: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [ScreenOrientation, Gyroscope, DeviceMotion]
})
export class HomePage {
  socket:any;
  gyro_vals = {x: 0, y: 0, z: 0, timestamp: 0};
  accel_vals= {x: 0, y: 0, z: 0, timestamp: 0};
  mag = {x: 0, y: 0, z: 0, magnitude: 0};
  accel_subscription: any;
  data = {gx: 0, gy: 0, gz:0, ax: 0, ay: 0, az: 0, mx: 0, my: 0, mz: 0, timestamp: 0};
  game: any;

  constructor(public navCtrl: NavController, private screenOrientation: ScreenOrientation, private gyroscope: Gyroscope, private deviceMotion: DeviceMotion) {
    this.lock();
    this.gyro(100);
    this.motion(100);
    //this.magnet(100);

    //this.initGameSensor(500);
    this.send_data(100);

    this.socket = io('http://131.212.207.174:3000');
  }




  send_gyro(msg) {
    if(msg != ''){
      this.socket.emit('gyro', msg);
    }
  }

  send_accel(msg) {
    if(msg != ''){
      this.socket.emit('accel', msg);
    }
  }

  send_mag(msg) {
    if(msg != ''){
      this.socket.emit('mag', msg);
    }
  }

  lock()
  {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
  }

  send_data(ms)
  {
    let timer = Observable.timer(100,ms);
    timer.subscribe(t=> {
      this.sendAllData();
    });
  }

  sendAllData()
  {
    // send what we got at this moment
    this.data.gx        = this.gyro_vals.x;
    this.data.gy        = this.gyro_vals.y;
    this.data.gz        = this.gyro_vals.z;
    this.data.ax        = this.accel_vals.x;
    this.data.ay        = this.accel_vals.y;
    this.data.az        = this.accel_vals.z;
    //this.data.mx        = this.mag.x;
    //this.data.my        = this.mag.y;
    //this.data.mz        = this.mag.z;
    //this.data.timestamp = Date.now();

    this.socket.emit('data', this.data);
  }

  magnet(ms)
  {
    let timer = Observable.timer(100,ms);
    timer.subscribe(t=> {
      this.readMagnet();
    });
  }

  initGameSensor(ms)
  {
    sensors.enableSensor("LINEAR_ACCELERATION");
    let timer = Observable.timer(100,ms);
    timer.subscribe(t=> {
      this.readSensor();
    });
  }

  readSensor()
  {
    var self = this;
    sensors.getState(function success(reading){
        console.log(JSON.stringify(reading));
        self.game = reading;
      },
      function error(message){
        console.log(message);
      });
  }

  readMagnet()
  {
    var self = this;
    cordova.plugins.magnetometer.getReading(
      function success(reading){
        //console.log(JSON.stringify(reading));
        self.mag = reading;
      },
      function error(message){
        console.log(message);
      }
    )
  }

  gyro(ms)
  {
    let options: GyroscopeOptions = {
      frequency: ms
    };


    this.gyroscope.watch(options)
        .subscribe((orientation: GyroscopeOrientation) => {
          //console.log(orientation.x, orientation.y, orientation.z, orientation.timestamp);
          if(orientation.x > .1) {
            this.gyro_vals.x = orientation.x;
          }
          if(orientation.y > .1)
          {
            this.gyro_vals.y = orientation.y;
          }
          if(orientation.z > .1)
          {
            this.gyro_vals.z = orientation.z;
          }

        });
  }

  motion(ms)
  {
    let options: DeviceMotionAccelerometerOptions = {
      frequency: ms
    };

    this.accel_subscription = this.deviceMotion.watchAcceleration(options)
        .subscribe((acceleration: DeviceMotionAccelerationData) => {
          if(this.accel_vals.x - acceleration.x > .1 || this.accel_vals.x - acceleration.x < -.1)
          {
            this.accel_vals.x = acceleration.x;
          }
          if(this.accel_vals.y - acceleration.y > .1 || this.accel_vals.y - acceleration.y < -.1)
          {
            this.accel_vals.y = acceleration.y;
          }
          if(this.accel_vals.z - acceleration.z > .1 || this.accel_vals.z - acceleration.z < -.1)
          {
            this.accel_vals.z = acceleration.z;
          }

        });
  }
}
