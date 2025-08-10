import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterNewOrgComponent } from './register-new-org/register-new-org.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { TrailListComponent } from './trail-list/trail-list.component';
import { PaginationComponent } from './pagination/pagination.component';
import { ReloadDbComponent } from './reload-db/reload-db.component';
import { ServiceHealthComponent } from './service-health/service-health.component';
import { LoginComponent } from './login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { JobsListComponent } from './jobs-list/jobs-list.component';
import { ManageCronjobComponent } from './manage-cronjob/manage-cronjob.component';
import { NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CronJobComponent } from './cron-job/cron-job.component';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './toast/toast.component';
import { AuthHeaderInterceptor } from './services/auth-header.interceptor';

@NgModule({ 
    declarations: [
        AppComponent,
        RegisterNewOrgComponent,
        TrailListComponent,
        PaginationComponent,
        ReloadDbComponent,
        ServiceHealthComponent,
        LoginComponent,
        LayoutComponent,
        JobsListComponent,
        ManageCronjobComponent,
        CronJobComponent,
        ToastComponent
    ],
    bootstrap: [AppComponent], 
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        CommonModule,
        NgbDatepickerModule], 
        providers: 
        [
            {
                provide: HTTP_INTERCEPTORS,
                useClass: AuthHeaderInterceptor,
                multi: true
            },
            provideHttpClient(withInterceptorsFromDi())
        ] 
})
export class AppModule { }
