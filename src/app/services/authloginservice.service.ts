import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthSevice } from './auth-sevice.service';


@Injectable({
  providedIn: 'root'
})
export class AuthLoginService implements CanActivate, CanLoad {

  constructor(private authService: AuthSevice, private route: Router) { }
  canLoad(route: Route, segments: UrlSegment[]): boolean{
    return this.authService.loginIn();
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean  {
    
    if ( this.authService.loginIn()){
     return true;
    }
    else{
      this.route.navigate(['']);
      return false;
   }
  }
}
