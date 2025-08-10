import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ResponseModal } from '../reload-db/reload-db.component';
import { ErrorToast, Toast } from '../services/common.service';

@Component({
  selector: 'app-service-health',
  templateUrl: './service-health.component.html',
  styleUrls: ['./service-health.component.scss']
})
export class ServiceHealthComponent implements OnInit {
  allServiceHealth: Array<ServiceHealth> = [];
  baseUrl: string = "";
  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.baseUrl = environment.baseURL;
    this.allServiceHealth.push({
      serviceName: "Core Service",
      url: "www.bottomhalf.in",
      lastVisited: new Date(),
      module: "Emstum",
      status: 1
    }, {
      serviceName: "Core Service",
      url: "www.bottomhalf.in",
      lastVisited: new Date(),
      module: "Emstum",
      status: 2
    }, {
      serviceName: "Core Service",
      url: "www.bottomhalf.in",
      lastVisited: new Date(),
      module: "Emstum",
      status: 1
    }, {
      serviceName: "Core Service",
      url: "www.bottomhalf.in",
      lastVisited: new Date(),
      module: "Emstum",
      status: 2
    }, {
      serviceName: "Core Service",
      url: "www.bottomhalf.in",
      lastVisited: new Date(),
      module: "Emstum",
      status: 1
    }, {
      serviceName: "Core Service",
      url: "www.bottomhalf.in",
      lastVisited: new Date(),
      module: "Emstum",
      status: 2
    })
  
    this.http.get(this.baseUrl + "ServiceHealth/test").subscribe({
      next: (res:any) => {
        if (res.message)
        Toast(res);
      },
      error: err => {
        ErrorToast(err.error.ResponseBody);
      },
    })
  }
}

interface ServiceHealth {
  serviceName: string,
  url: string,
  lastVisited: Date,
  module: string,
  status: number
}