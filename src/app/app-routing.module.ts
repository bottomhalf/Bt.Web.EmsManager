import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterNewOrgComponent } from './register-new-org/register-new-org.component';
import { TrailListComponent } from './trail-list/trail-list.component';
import { ReloadDbComponent } from './reload-db/reload-db.component';
import { ServiceHealthComponent } from './service-health/service-health.component';
import { JobsListComponent } from './jobs-list/jobs-list.component';
import { ManageCronjobComponent } from './manage-cronjob/manage-cronjob.component';
import { LoginComponent } from './login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from './services/auth.guard';
import { CronJobComponent } from './cron-job/cron-job.component';
import { JsonEditorComponent } from './json-editor/json-editor.component';
import { FileListComponent } from './file-list/file-list.component';
import { RepositoryComponent } from './repository/repository.component';

const routes: Routes = [
  // {path: "", redirectTo: 'companytrialist', pathMatch: 'full'},
  // {path: "registerneworg", component: RegisterNewOrgComponent},
  // {path: "companytrialist", component: TrailListComponent},
  // {path: "reloaddb", component: ReloadDbComponent},
  // {path: "servicehealth", component: ServiceHealthComponent},
  // {path: "jobs", component: JobsListComponent},
  // {path: "jobs/managejob", component: ManageCronjobComponent},
  {path: "login", component: LoginComponent},
  { path: 'ems', component: LayoutComponent, 
    children: [
      {path: '', component: TrailListComponent},
      {path: "registerneworg", component: RegisterNewOrgComponent, canActivate: [AuthGuard]},
      {path: "companytrialist", component: TrailListComponent, canActivate: [AuthGuard]},
      {path: "reloaddb", component: ReloadDbComponent, canActivate: [AuthGuard]},
      {path: "servicehealth", component: ServiceHealthComponent, canActivate: [AuthGuard]},
      {path: "jobs", component: JobsListComponent, canActivate: [AuthGuard]},
      {path: "jobs/managejob", component: ManageCronjobComponent, canActivate: [AuthGuard]},
      {path: "reloaddb/cronjob", component: CronJobComponent, canActivate: [AuthGuard]},
      {path: 'filelist/jsoneditor', component: JsonEditorComponent, canActivate: [AuthGuard]},
      {path: 'filelist', component: FileListComponent, canActivate: [AuthGuard]},
      {path: 'repository', component: RepositoryComponent, canActivate: [AuthGuard]},
    ]
  },
  { path: '**', redirectTo: 'login'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
