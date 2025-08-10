import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ErrorToast } from '../services/common.service';

@Component({
  selector: 'app-jobs-list',
  templateUrl: './jobs-list.component.html',
  styleUrls: ['./jobs-list.component.scss']
})
export class JobsListComponent implements OnInit {
  private cronJobs: Array<CronJob> = [];
  filteredCronJobs: Array<CronJob> = [];
  private baseUrl: string = "";
  isPageReady: boolean = false;
  filterValue: string = "";
  constructor(private http: HttpClient,
              private router: Router
  ) {}
  ngOnInit(): void {
    this.baseUrl = environment.baseURL;
    this.loadData();
  }

  loadData() {
    this.isPageReady = false;
    this.http.get(this.baseUrl + "Job/getAllJobs").subscribe({
      next: (res: any) => {
        if (res.responseBody) {
          this.cronJobs = res.responseBody;
          this.filteredCronJobs = res.responseBody;
          this.isPageReady = true;
        }
      }, error: err => {
        ErrorToast(err.error.ResponseBody);
        this.isPageReady = true;
      }
    })
  }

  eidtCronjob(item: CronJob) {
    this.router.navigate(['/ems/jobs/managejob'], {queryParams: {Id: item.JobId}})
  }

  addNewJob() {
    this.router.navigate(['/ems/jobs/managejob'], {queryParams: {Id: 0}})
  }

  filterJob() {
    if (this.filterValue) {
      this.filteredCronJobs = this.cronJobs.filter(x => x.JobTypeName.toLowerCase().includes(this.filterValue) || x.TopicName.toLowerCase().includes(this.filterValue) || x.GroupId.toLowerCase().includes(this.filterValue))
    }
  }

  resetFilte() {
    this.filterValue = "";
    this.filteredCronJobs = this.cronJobs;
  }

  getJobType(jobType: number): string {
    if (jobType == 1)
      return "Daily Job";
    else if (jobType == 2)
      return "Weekly Job";
    else if (jobType == 3)
      return "Monthly Job";
    else if (jobType == 4)
      return "Yearly job";
  }
}

export interface CronJob {
  JobId: number,
  JobTypeName: string,
  KafkaServiceNameId: number, 
  JobTypeDescription: string, 
  IsActiveJob: boolean,
  JobStartDate: Date, 
  JobEndDate: Date, 
  JobTime: number,
  JobDayOfWeek: number, 
  JobDayOfMonth: number,
  JobMonthOfYear: number,
  JobOccurrenceType: number,
  TopicName: string,
  GroupId: string, 
  JobsDetail: string,
  Template: string
}