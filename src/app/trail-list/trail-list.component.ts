import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ErrorToast, Toast } from '../services/common.service';

@Component({
  selector: 'app-trail-list',
  templateUrl: './trail-list.component.html',
  styleUrls: ['./trail-list.component.scss']
})
export class TrailListComponent implements OnInit {
  isPageReady: boolean = false;
  trialList: Array<any> = [];
  baseUrl: string = "";
  trialData: Filter = new Filter();
  active: number = 1;
  constructor(private http: HttpClient,
              private route: Router
  ) {}

  ngOnInit(): void {
    this.baseUrl = environment.baseURL;
    this.getPendingTrailRequesst();
  }

  getPendingTrailRequesst() {
    this.isPageReady = false;
    this.trialData.IsProcessed = false;
    this.http.post(this.baseUrl + "trial/companyTrial", this.trialData).subscribe({
      next: (data: any) =>{
        this.trialList = data.responseBody;
        if (this.trialList && this.trialList.length > 0)
          this.trialData.TotalRecords = this.trialList[0].Total;
        else
          this.trialData.TotalRecords = 0;

        this.isPageReady = true;
        Toast("Data loaded successfully")
      },
      error: error => {
        ErrorToast(error.error.ResponseBody);
        ErrorToast(error.error.ResponseBody);
      }
    })
  }

  getCompletedTrailRequesst() {
    this.isPageReady = false;
    this.trialData.IsProcessed = true;
    this.http.post(this.baseUrl + "trial/companyTrial", this.trialData).subscribe({
      next: (data: any) =>{
        this.trialList = data.responseBody;
        if (this.trialList && this.trialList.length > 0)
          this.trialData.TotalRecords = this.trialList[0].Total;
        else
          this.trialData.TotalRecords = 0;

        this.isPageReady = true;
      },
      error: error => {
        ErrorToast(error.error.ResponseBody);
        ErrorToast(error.error.ResponseBody);
      }
    })
  }

  viewTrial(item: any) {
    if (item) {
      this.route.navigate(["/ems/registerneworg"], {queryParams: {Id: item.TrailRequestId}});
    }
  }

  GetFilterResult(e: Filter) {
    if(e != null) {
      this.trialData = e;
      if (this.active == 1) {
        this.getPendingTrailRequesst();
      } else {
        this.getCompletedTrailRequesst();
      }
    }
  }

  activeTab(event:Event) {
    let activeTabId = Number((event.currentTarget as HTMLElement).getAttribute('data-name'));
    this.active = activeTabId;
    this.trialData.reset();
    if (this.active == 1) {
      this.getPendingTrailRequesst();
    } else {
      this.getCompletedTrailRequesst();
    }
  }
}

export class Filter {
  EmployeeId?: number = 0;
  ClientId?: number = 0;
  SearchString: string = "1=1";
  PageIndex: number = 1;
  StartIndex?: number = 0;
  EndIndex?: number = 0;
  PageSize: number = 10;
  SortBy?: string = "";
  CompanyId: number = 0;
  TotalRecords?: number = 0;
  ShowPageNo?: number = 5;
  ActivePageNumber?: number = 1;
  isReUseSame?: boolean = false;
  isActive?: boolean = true;
  SortDirection?: string = null;
  IsProcessed: boolean = false;
  update(total: any) {
    if(!isNaN(Number(total))) {
      this.TotalRecords = total;
      this.StartIndex = 1;
      this.PageIndex = 1;
    }
  }

  reset() {
    this.TotalRecords = 0;
    this.StartIndex = 1;
    this.PageIndex = 1;
    this.ActivePageNumber = 1;
    this.SortDirection = null;
  }
}
