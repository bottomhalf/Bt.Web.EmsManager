import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthHeaderInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
     const company = this.authService.getCurrentCompany(); 
    // Example header: Add Authorization or any custom header
    if (req.url.includes("authenticateUser")) {
      const modifiedReq = req.clone({
        setHeaders: {
          CompanyName: company, // You can replace with dynamic values
        }
      });
      return next.handle(modifiedReq);
    } else {
      const token = this.authService.getAccessToken(); 
      if(token == null || token == "") {
        throw "Token not found. Please login again.";
      }

      const modifiedReq = req.clone({
        setHeaders: {
          Authorization: "Bearer " + token, // You can replace with dynamic values
          CompanyName: company,
        }
      });
      return next.handle(modifiedReq);
    }
  }
}
