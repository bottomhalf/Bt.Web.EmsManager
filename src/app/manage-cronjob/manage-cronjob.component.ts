import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CronJob } from '../jobs-list/jobs-list.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ErrorToast, Toast } from '../services/common.service';

@Component({
  selector: 'app-manage-cronjob',
  templateUrl: './manage-cronjob.component.html',
  styleUrls: ['./manage-cronjob.component.scss']
})
export class ManageCronjobComponent implements OnInit {
  jobDetail: CronJob = {
    GroupId : "dailyJobGroup",
    IsActiveJob : false,
    JobDayOfMonth : 1,
    JobDayOfWeek : 0,
    JobEndDate : null,
    JobId : 0,
    JobMonthOfYear : 0,
    JobOccurrenceType : 1,
    JobStartDate : null,
    JobTime : 0,
    JobTypeDescription : "",
    KafkaServiceNameId : null,
    Template : "",
    TopicName : null,
    JobTypeName: "",
    JobsDetail: ""
  };
  serviceTypes: Array<any> = [];
  jobstartdateModel: NgbDateStruct;
  jobenddateModel: NgbDateStruct;
  minDate: any = null;
  jobsForm: FormGroup;
  isLoading: boolean = false;
  isSubmitted: boolean = false;
  isPageReady: boolean = false;
  cronJobId: number = 0;
  private baseUrl: string = "";
  topics: Array<string> = [];
  constructor(private router: ActivatedRoute,
              private http: HttpClient,
              private fb: FormBuilder
  ) {
    this.cronJobId = Number(this.router.snapshot.queryParams['Id']);
    this.baseUrl = environment.baseURL;
  }
  ngOnInit(): void {
    this.loadData();
  }
  loadData() {
    this.isPageReady = false;
    this.http.get(this.baseUrl + `Job/getJobsById/${this.cronJobId}`).subscribe({
      next: (res: any) => {
        if (res.responseBody) {
          if (res.responseBody["Job"]) {
            this.jobDetail = res.responseBody["Job"];
            let date = this.ToLocateDate(this.jobDetail.JobStartDate);
            this.jobstartdateModel = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
            if (this.jobDetail.JobEndDate) {
              let date = this.ToLocateDate(this.jobDetail.JobEndDate);
              this.jobenddateModel = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
            }
          }
  
          this.serviceTypes = res.responseBody["ServiceType"];
          this.topics = res.responseBody["Topics"];
          this.initform();
          this.isPageReady = true;
        }
      },
      error: err => {
        ErrorToast(err.error.ResponseBody);
        this.isPageReady = true;
      }
    })
  }

  initform() {
    this.jobsForm = this.fb.group({
      JobId: new FormControl(this.jobDetail.JobId),
      KafkaServiceNameId: new FormControl(this.jobDetail.KafkaServiceNameId, [Validators.required]),
      JobTypeDescription: new FormControl(this.jobDetail.JobTypeDescription, [Validators.required]),
      IsActiveJob: new FormControl(this.jobDetail.IsActiveJob),
      JobStartDate: new FormControl(this.jobDetail.JobStartDate, [Validators.required]),
      JobEndDate: new FormControl(this.jobDetail.JobEndDate),
      JobTime: new FormControl(this.jobDetail.JobTime),
      JobDayOfWeek: new FormControl(this.jobDetail.JobDayOfWeek),
      JobDayOfMonth: new FormControl(this.jobDetail.JobDayOfMonth),
      JobMonthOfYear: new FormControl(this.jobDetail.JobMonthOfYear),
      JobOccurrenceType: new FormControl(this.jobDetail.JobOccurrenceType),
      TopicName: new FormControl(this.jobDetail.TopicName, [Validators.required]),
      GroupId: new FormControl(this.jobDetail.GroupId),
      Template: new FormControl(this.jobDetail.Template),
      JobTypeName: new FormControl("")
    })
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.jobsForm.controls["JobStartDate"].setValue(date);
  }

  onEndDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.jobsForm.controls["JobEndDate"].setValue(date);
  }

  get f() {
    return this.jobsForm.controls;
  }

  saveJobsConnection() {
    this.isLoading = true;
    this.isSubmitted = true;
    if (this.jobsForm.invalid) {
      this.isLoading = false;
      ErrorToast("Please fill all the mandatory field");
      return;
    }

    let value = this.jobsForm.value;
    if (value.JobStartDate == null)
      value.JobStartDate = new Date();

    value.JobTypeName = this.serviceTypes.find(x => x.ServiceTypeId == value.KafkaServiceNameId).ServiceName;
    this.http.post(this.baseUrl + "Job/manageJobs", value).subscribe({
      next: (res: any) => {
        if (res.responseBody) {
          Toast("Job detail insert/updated successfully");
          this.isLoading = false;
          this.isSubmitted = false;
        }
      },
      error: err => {
        this.isLoading = false;
        ErrorToast(err.error.ResponseBody);
      }
    })
  }

  private ToLocateDate(date: any) {
    if(date) {
      let type = typeof(date);
      switch(type) {
        case "string":
          if (date.indexOf("Z") == -1)
            return new Date(date + ".000Z");
          else
            return new Date(date)
        default:
            var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
            var offset = date.getTimezoneOffset() / 60;
            var hours = date.getHours();
            newDate.setHours(hours - offset);
            return newDate;
      }
    }
  
    return null;
  }
}
