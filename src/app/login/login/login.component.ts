import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorLogin } from 'src/app/modal/error';
import { AuthSevice } from 'src/app/services/auth-sevice.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  validateForm!: FormGroup;
   listErrorLogin: ErrorLogin [] = [];
  constructor(private fb: FormBuilder, public auth: AuthSevice, private route: Router) { }

  ngOnInit(): void {
    if (this.auth.loginIn()){
      this.route.navigate(['home']);
    }
    this.validateForm = this.fb.group({
      phonenumber: [null, [Validators.required]],
      password: [null, [Validators.required]],
      remember: [true]
    });
      // let that =this;
      // that.auth.login("0379797979","Long123#").subscribe(res=>{

      // })
  }
  submitForm(form: NgForm): void {
    // tslint:disable-next-line:forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    const phonenumber = form.value.phonenumber;
    const password = form.value.password;

    this.auth.login(phonenumber, password)
    .subscribe(res => {
      this.auth.getProfile().subscribe(user => {
        this.route.navigate(['home']);
      });
    },
    error => {
      console.log('Lỗi đăng nhập', error);

      this.listErrorLogin = Object.values(error.error);
      // this.notification.create(
      //   'error',
      //   'Thất bại',
      //   'Xin vui lòng kiểm tra lại thông tin tài khoản');
    }
    );
  }

}
