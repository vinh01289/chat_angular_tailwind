import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSevice } from './services/auth-sevice.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isload = false;
  constructor(public auth: AuthSevice, private route: Router){

  }
  // tslint:disable-next-line:typedef
  ngOnInit(){
      const that = this;
      that.auth.getProfile().subscribe(res => {
        this.isload = true;
        if (!res){
          if (that.auth.loginIn())
          {
            that.auth.logOut();
            this.route.navigate(['login']);

          }
        }
      });
  }
}
