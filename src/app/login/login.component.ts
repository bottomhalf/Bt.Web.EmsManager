import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ErrorToast, Toast } from '../services/common.service';
import { Authorization, CompanyName } from '../services/constant';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isPasswordShow: boolean = false;
  type: string = "password";
  password: string = "";
  email: string = "";
  submitted: boolean = false;
  company: string ="emstum";
  baseUrl: string = "";
  isLoading: boolean = false;
  constructor(private router: Router,
              private auth: AuthService,
              private http: HttpClient
  ) {}
  ngOnInit(): void {
    this.baseUrl = environment.baseURL;
  }

  login() {
    this.submitted = true;
    if (this.email == null || this.email == "") {
      ErrorToast("Please enter email");
      return;
    }

    if (this.password == null || this.password == "") {
      ErrorToast("Please enter password");
      return;
    }

    let value = {
      Email: this.email,
      Password: this.password,
      Company: this.company
    }

    this.isLoading = true;
    sessionStorage.setItem(CompanyName, this.company);
    this.http.post(this.baseUrl + "login/authenticateUser", value).subscribe({
      next: (res: any) => {
        if (res.ResponseBody) {
          this.auth.login();
          sessionStorage.setItem(CompanyName, this.company);
          sessionStorage.setItem(Authorization, res.ResponseBody.Token);
          Toast("Login successfully.");
          this.isLoading = false;
          this.router.navigateByUrl("/ems/companytrialist");
        }
      }, error: err => {
        sessionStorage.removeItem(CompanyName);
        this.isLoading = false;
        ErrorToast(err.error.ResponseBody);
      }
    })
  }

  showHidePassword() {
    this.isPasswordShow = !this.isPasswordShow;
    if (this.isPasswordShow)
      this.type = "text";
    else
      this.type = "password";
  }
}
