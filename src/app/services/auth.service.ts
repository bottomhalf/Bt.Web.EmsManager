import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Authorization, Auth, CompanyName } from './constant';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedIn = false;
  constructor(private router: Router){}
  login() {
    this.isLoggedIn = true;
    sessionStorage.setItem(Auth, 'true'); // Optional: persist login
  }

  logout(): void {
    this.isLoggedIn = false;
    //sessionStorage.removeItem(this.auth);
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn || sessionStorage.getItem(Auth) === 'true';
  }

  getCurrentCompany(): string {
    return sessionStorage.getItem(CompanyName);
  }

  getAccessToken(): string {
    return sessionStorage.getItem(Authorization);
  }
}
