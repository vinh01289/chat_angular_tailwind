import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorLogin } from 'src/app/modal/error';
import { AuthSevice } from 'src/app/services/auth-sevice.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  validateForm!: FormGroup;
   listErrorLogin: ErrorLogin [] = [];
  constructor( public auth: AuthSevice, private route: Router, private fb: FormBuilder) { }

  ngOnInit(): void {
    if (this.auth.loginIn()){
      this.route.navigate(['home']);
    }
    this.validateForm = this.fb.group({
      phonenumber: [null, [Validators.required]],
    });
  }

}
