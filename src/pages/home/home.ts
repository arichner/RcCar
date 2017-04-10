import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Gyroscope, GyroscopeOrientation, GyroscopeOptions } from '@ionic-native/gyroscope';
import {
    DeviceMotion, DeviceMotionAccelerationData,
    DeviceMotionAccelerometerOptions
} from '@ionic-native/device-motion';

import * as io from 'socket.io-client';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  providers: [ScreenOrientation, Gyroscope, DeviceMotion]
})
export class HomePage {
  socket:any;
  gyro_x: any;
  gyro_y: any;
  gyro_z: any;
  accel_x: any;
  accel_y: any;
  accel_z: any;
  accel_subscription: any;
  constructor(public navCtrl: NavController, private screenOrientation: ScreenOrientation, private gyroscope: Gyroscope, private deviceMotion: DeviceMotion) {
    this.lock();
    this.gyro(1000);
    this.motion(1000);

    this.socket = io('http://192.168.1.107:3000');
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

  lock()
  {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
  }

  gyro(ms)
  {
    let options: GyroscopeOptions = {
      frequency: ms
    };


    this.gyroscope.watch(options)
        .subscribe((orientation: GyroscopeOrientation) => {
          // console.log(orientation.x, orientation.y, orientation.z, orientation.timestamp);
          this.gyro_x = orientation.x;
          this.gyro_y = orientation.y;
          this.gyro_z = orientation.z;
          this.send_gyro(orientation);
        });
  }

  motion(ms)
  {
    let options: DeviceMotionAccelerometerOptions = {
      frequency: ms
    };

    this.accel_subscription = this.deviceMotion.watchAcceleration(options)
        .subscribe((acceleration: DeviceMotionAccelerationData) => {
          // console.log(acceleration.x, acceleration.y, acceleration.z, acceleration.timestamp);
          this.accel_x = acceleration.x;
          this.accel_y = acceleration.y;
          this.accel_z = acceleration.z;
          this.send_accel(acceleration);
        });
  }
}
