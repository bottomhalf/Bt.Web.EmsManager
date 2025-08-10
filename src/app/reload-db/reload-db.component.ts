import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { Filter } from '../trail-list/trail-list.component';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { ErrorToast, Toast } from '../services/common.service';

@Component({
  selector: 'app-reload-db',
  templateUrl: './reload-db.component.html',
  styleUrls: ['./reload-db.component.scss']
})
export class ReloadDbComponent implements OnInit {
  masterConnectionString: Array<MasterConnectionString> = [];
  isLoading: boolean = false;
  baseUrl: string = "";
  filterData: Filter =null;
  filterText: string = "";
  constructor(private http: HttpClient,
              private route: Router
  ) {}
  ngOnInit(): void {
    this.baseUrl = environment.baseURL;
    this.filterData = new Filter();
    this.filterData.SearchString = "";
    this.getAllConnection();
  }
  getAllConnection() {
    this.isLoading = true;
    this.http.post(this.baseUrl + "dbConnection/getAllConnection", this.filterData).subscribe({
      next: (data:ResponseModal) => {
        if (data.responseBody) {
          this.masterConnectionString = data.responseBody;
          this.isLoading = false;
        }
      },
      error: error => {
        ErrorToast(error.error.ResponseBody);
        this.isLoading = false;
      }
    })
  }

  reloadDataBase() {
    this.isLoading = true;
    this.http.get(this.baseUrl + "dbConnection/reloadConnection").subscribe({
      next: (data:ResponseModal) => {
        if (data.responseBody) {
          Toast("Connection reloaded successfully");
          this.masterConnectionString = data.responseBody;
          this.isLoading = false;
          let modalElement = document.getElementById("reloadAlertModal");
          var modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) 
            modal.hide();
        }
      },
      error: error => {
        ErrorToast(error.error.ResponseBody);
        this.isLoading = false;
      }
    })
  }

  filterRecord() {
    if (this.filterText) {
      this.filterData.SearchString = this.filterText;
      this.getAllConnection();
    } 
  }

  resetRecord() {
    if (this.filterText) {
      this.filterText = "";
      this.filterData.SearchString = "";
      this.getAllConnection();
    }
  }

  reloadDataBasePopup() {
    let modalElement = document.getElementById("reloadAlertModal");
    var modal = new bootstrap.Modal(modalElement);
    if (modal)
      modal.show();
  }

  viewCronjob(companyCode: any, db: any) {
    this.route.navigate(["/ems/reloaddb/cronjob"], {queryParams: {companyCode: companyCode, db: db}})
  }
}
interface MasterConnectionString {
  OrganizationCode: string,
  Code: string,
  NodeId: string,
  Schema: string,
  DatabaseName: string,
  Server: string,
  Port: string,
  Database: string,
  UserId: string,
  Password: string,
  ConnectionTimeout: number,
  ConnectionLifetime: number,
  MinPoolSize: number,
  MaxPoolSize: number,
  Pooling: boolean
}

export interface ResponseModal {
  statusCode: number,
  message: string,
  responseBody: any
}