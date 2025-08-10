import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import data from "../../assets/server.json";
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ErrorToast, Toast } from '../services/common.service';

@Component({
  selector: 'app-register-new-org',
  templateUrl: './register-new-org.component.html',
  styleUrls: ['./register-new-org.component.scss']
})
export class RegisterNewOrgComponent implements OnInit {
  isShowPassword: boolean = false;
  inputType: string = "password";
  submitted: boolean = false;
  isLoading: boolean = false;
  initialForm: FormGroup;
  serverId: number = 0;
  password: string = null;
  serverDetail: Array<any> = data;
  baseUrl: string = "";
  trailRequestId: number = 0;
  isPageReady: boolean = false;
  companyIntialDetai: CompanyIntialDetai = {
  OrganizationName : "",
  FullName : "",
  Email : "",
  GSTNo : "",
  CompanyName : "",
  PhoneNumber : "",
  FullAddress : "",
  Country : "",
  State : "",
  City : "",
  ProbationPeriodInDays : 0,
  NoticePeriodInDays : 0,
  NoticePeriodInProbation : 0,
  TimezoneName : ""
  }
  constructor( private fb: FormBuilder,
               private http: HttpClient,
              private router: ActivatedRoute,
              private route: Router) {
    this.trailRequestId = Number(this.router.snapshot.queryParams['Id']);
  }

  ngOnInit(): void {
    this.baseUrl = environment.baseURL;
    if (this.trailRequestId > 0) {
      this.loadData()
    } else {
      this.isPageReady = true;
      this.initForm();
    }
  }

  loadData() {
    this.isPageReady = false;
    this.http.get(this.baseUrl + `trial/getCompanyTrial/${this.trailRequestId}`).subscribe({
      next: (data: any) => {
        this.companyIntialDetai = data.responseBody;
        if (!this.companyIntialDetai.OrganizationName)
          this.companyIntialDetai.OrganizationName = this.companyIntialDetai.CompanyName;

        this.initForm();
        this.isPageReady = true;
      },
      error: error => {
        ErrorToast(error.error.ResponseBody);
      }
    })
  }

  initForm() {
    this.initialForm = this.fb.group({
      TrailRequestId: new FormControl(this.trailRequestId, [Validators.required]),
      OrganizationName: new FormControl(this.companyIntialDetai.OrganizationName, [Validators.required]),
      OwnerName: new FormControl(this.companyIntialDetai.FullName, [Validators.required]),
      EmailId: new FormControl(this.companyIntialDetai.Email, [Validators.required, Validators.email]),
      GSTNo: new FormControl(this.companyIntialDetai.GSTNo != null ? this.companyIntialDetai.GSTNo : "000000000", [Validators.required]),
      CompanyName: new FormControl(this.companyIntialDetai.CompanyName, [Validators.required]),
      Mobile: new FormControl(this.companyIntialDetai.PhoneNumber, [Validators.required]),
      FullAddress: new FormControl(this.companyIntialDetai.FullAddress, [Validators.required]),
      Country: new FormControl(this.companyIntialDetai.Country),
      State: new FormControl(this.companyIntialDetai.State),
      City: new FormControl(this.companyIntialDetai.City),
      ProbationPeriodInDays: new FormControl(90),
      NoticePeriodInDays: new FormControl(90),
      NoticePeriodInProbation: new FormControl(90),
      TimezoneName: new FormControl("India Standard Time")
    })
  }

  get f () {
    return this.initialForm.controls;
  }

  registerAccount() {
    this.isLoading = true;
    this.submitted = true;

    if (this.initialForm.invalid) {
      this.isLoading = false;
      return;
    }
    let value = this.initialForm.value;
    if (value.OwnerName.includes(" ")) {
      let name = value.OwnerName.split(" ");
      if (name == null) {
        ErrorToast("Unable to read owner name");
        return;
      }

      if (name.length >= 2) {
        value.FirstName = name[0];
        value.LastName = name.splice(1).join(" ");
      } else {
        value.FirstName = name[0];
        value.LastName = "";
      }
    } else {
      value.FirstName = value.OwnerName;
      value.LastName = "";
    }
    if (value.FullAddress.includes(" ")) {
      //let address = value.FullAddress.split(" ");
      if (value.FullAddress == null) {
        ErrorToast("Unable to read full address");
        return;
      }

      var addressPart = this.splitAddress(value.FullAddress);
      value.FirstAddress = addressPart.part1;
      value.SecondAddress = addressPart.part2;
    }
    this.http.post(this.baseUrl + "create/new_organization", value).subscribe({
      next: data => {
        Toast("Created");
        this.route.navigate(["/companytrialist"]);
        this.isLoading = false;
      },
      error: error => {
        ErrorToast(error.error.ResponseBody);
        this.isLoading = false;
      }
    })
  }

  showPassword() {
    if (!this.isShowPassword) {
      this.inputType = "text";
      this.isShowPassword = true;
    } else {
      this.inputType = "password";
      this.isShowPassword = false;
    }
  }

  private splitAddress(address: string): { part1: string; part2: string } {
    const maxLength = Math.floor(address.length / 2); // Try splitting at the middle
    let splitIndex = address.lastIndexOf(" ", maxLength); // Find nearest space before the midpoint
  
    // If no space found before midpoint, look for space after the midpoint
    if (splitIndex === -1) {
      splitIndex = address.indexOf(" ", maxLength);
    }
  
    // If still no space is found, return full address in one part
    if (splitIndex === -1) {
      return { part1: address, part2: "" };
    }
  
    return {
      part1: address.substring(0, splitIndex).trim(),
      part2: address.substring(splitIndex).trim(),
    };
  }
}

interface CompanyIntialDetai {
  OrganizationName: string,
  FullName: string,
  Email: string,
  GSTNo: string,
  CompanyName: string,
  PhoneNumber: string,
  FullAddress: string,
  Country: string,
  State: string,
  City: string,
  ProbationPeriodInDays: number,
  NoticePeriodInDays: number,
  NoticePeriodInProbation: number,
  TimezoneName: string,
}
