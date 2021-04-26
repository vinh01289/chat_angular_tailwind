import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import {  Observable, ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { Constant, HandleLocalStore } from './HandleLocalSore';
import {  UserProfile } from '../modal/user';

@Injectable({
  providedIn: 'root'
})
export class AuthSevice {
  public Token: string;
  jwtHelper = new JwtHelperService();
  private currentUser = null;
  constructor(private route: Router, protected http: HttpClient) {
  }
  login(phoneNumber: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl.chatUrl}api/v1/users/sign-in/password`, {
      phoneNumber,
      password
    }).pipe(map((userLogin) => {
        if (userLogin){
          console.log(userLogin);
          localStorage.setItem('currentUser', JSON.stringify(userLogin));
          HandleLocalStore.writeaccessToken(userLogin[`accessToken`]);
          HandleLocalStore.writerefreshToken(userLogin[`refreshToken`]);
          // TODO request user
        }
        else{
          this.logOut();
        }
    }));
  }

  logOut(): void{
    localStorage.removeItem(Constant.LOCALVARIABLENAME.accessToken);
    localStorage.removeItem(Constant.LOCALVARIABLENAME.refreshToken);
    localStorage.removeItem('currentuser');
  }
  loginIn(): boolean{
    const token = HandleLocalStore.getToken();
    return token &&
     !this.jwtHelper.isTokenExpired(token);
  }
  sentOtp(phoneNumber: string): Observable<any>{
    return this.http.post(`${environment.apiUrl.chatUrl}api/v1/users/sign-up/send-otpsms`, {
      phoneNumber
    }).pipe(map(res => {
      return res;
    }));
  }
  verifyOtp(phoneNumber: string, otpcode: string): Observable<any>{
      return this.http.post(`${environment.apiUrl.chatUrl}api/v1/users/sign-up/verify-otpsms`, {
        phoneNumber,
        otpcode
      }).pipe(map(res => {
         localStorage.setItem('smstoken', res[`smsOtpToken`]);
         return res;
      }));
  }
  signUp(name: string, email: string, password: string,
         phoneNumber: string, smsOtpToken: string, otpCode: string): Observable<any>{
    return this.http.post(`${environment.apiUrl.chatUrl}api/v1/users/sign-up`, {
      name,
      email,
      password,
      phoneNumber,
      smsOtpToken,
      otpCode
    }).pipe(map(res => {
      return res;
    }));
  }
  getProfile(): Observable<UserProfile> {
    const that = this;

    return new Observable( obs => {
      if (that.loginIn())
      {
        const accessToken = localStorage.getItem('accessToken');
        const reqHeader = new HttpHeaders({
          // tslint:disable-next-line:object-literal-key-quotes
          'Authorization': `Bearer ${accessToken}`
        });
        this.http.get(`${environment.apiUrl.chatUrl}api/v1/users/get-profile-user`, {headers: reqHeader}).subscribe(
          (res: UserProfile) => {
              this.currentUser = res;
              obs.next(res);
              obs.complete();

          },
          e => {
            this.currentUser = null;
            obs.next(null);
            obs.complete();
          }
          );
      }else{
        this.currentUser = null;
        obs.next(null);
        obs.complete();
      }
    });
  }
  getCurrentUser(): UserProfile
  {
    return this.currentUser;
  }
}
