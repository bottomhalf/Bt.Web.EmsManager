import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ErrorToast, HideModal, ShowModal, Toast } from '../services/common.service';
import { FileDetail } from '../json-editor/json-editor.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule, Location } from '@angular/common';
import { BreadcrumsComponent } from '../breadcrums/breadcrums.component';
import { TreeComponent } from '../tree/tree.component';
import { TreeService } from '../tree/tree.service';

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [FormsModule, NgbTooltipModule, CommonModule, BreadcrumsComponent, TreeComponent],
  templateUrl: './file-list.component.html',
  styleUrl: './file-list.component.scss'
})
export class FileListComponent implements OnInit {
  private baseUrl: string = "";
  fileDetails: Array<FileDetail> = [];
  isPageReady: boolean = false;
  selectDeleteFile: FileDetail = null;
  isLoading: boolean = false;
  rootPath: any = {"Name": "root", "Id": 0};
  routePath: Array<any> = [];
  tokenFileDetail: TokenFileDetail = {Key: null, CompanyCode: null, ExpiryTimeInSeconds: null, Issuer: null, ParentId: 0};
  submitted: boolean = false;
  private parentId: number = 0;
  folderDetail: FileDetail = {Content: null, Extension: 'dir', FileDetailId: 0, FileName: null, OldFileName: null, ParentId: 0};

  public nodes: any;

  constructor(private http: HttpClient,
              private router: Router,
              private location: Location,
              private treeService: TreeService
  ) {}
  ngOnInit(): void {
    this.nodes = this.treeService.fetchNodes();
    this.baseUrl = environment.baseURL;
    this.load_files_dirs(0);
  }

  load_files_dirs(parentId: number) {
    this.parentId = parentId;
    this.http.get(this.baseUrl + `FileDetail/getFilesDirs/${parentId}`).subscribe({
      next: (res: any) => {
        // this.location.go(`filelist/${parentId}`)
        this.fileDetails = res.responseBody;
        this.routePath = [this.rootPath];
        if(this.fileDetails.length > 0 && this.fileDetails[0]["Paths"] != null) {
          let paths: Array<any> = JSON.parse(this.fileDetails[0]["Paths"]);
          this.routePath.push(...paths.reverse());
        }

        Toast("Data loaded successfully");
        this.isPageReady = true;
      },
      error: error => {
        ErrorToast(error.error.ResponseBody);
        this.isPageReady = true;
      }
    })
  }

  loadNext(item: FileDetail) {
    if (item.Extension == 'dir') {
      this.load_files_dirs(item.FileDetailId);
    } else {
      this.viewFile(item);    
    }
  }

  loadRoute(id: number) {
    this.load_files_dirs(id);
  }

  viewFile(item: FileDetail) {
    if (item) {
      this.router.navigate(["/ems/filelist/jsoneditor"], {queryParams: {Id: item.FileDetailId, PId: item.ParentId}});
    }
  }

  addNewFile() {
    this.router.navigate(["/ems/filelist/jsoneditor"], {queryParams: {Id: 0, PId: this.parentId}});
  }

  deleteFilePopup(item: FileDetail) {
    this.selectDeleteFile= null;
    this.selectDeleteFile = item;
    ShowModal("deleteFileModal");
  }

  deleteFile() {
    if (this.selectDeleteFile) {
      this.isLoading = true;
      this.http.post(this.baseUrl + "FileDetail/deleteFile", this.selectDeleteFile).subscribe({
        next: (res: any) => {
          this.fileDetails = res.responseBody;
          Toast("File deleted successfully");
          HideModal("deleteFileModal");
          this.isLoading = false;
        },
        error: error => {
          ErrorToast(error.error.ResponseBody);
          this.isLoading = false;
        }
      })
    }
  }

  addTokenFilePoppup() {
    this.submitted = false;
    this.tokenFileDetail = {Key: null, CompanyCode: null, ExpiryTimeInSeconds: null, Issuer: null, ParentId: 0};
    ShowModal("manageTokenFileModal");
  }

  saveTokenDetail() {
    this.submitted = true;
    if (!this.tokenFileDetail.Key) {
      ErrorToast("Please add secret key");
      return;
    }

    if (!this.tokenFileDetail.Issuer) {
      ErrorToast("Please add issuer");
      return;
    }

    if (!this.tokenFileDetail.CompanyCode) {
      ErrorToast("Please add company code");
      return;
    }

    if (this.tokenFileDetail.ExpiryTimeInSeconds == null || this.tokenFileDetail.ExpiryTimeInSeconds < 6000) {
      ErrorToast("Please specify an expiry time greater than 6000.");
      return;
    }
    this.saveContent();
  }

  generateSecretKey() {
    const length = 32;
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array)
    this.tokenFileDetail.Key = Array.from(array, b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('').substring(0, length);
  }

  private saveContent() {
    this.isLoading = true;
    this.tokenFileDetail.ParentId = this.parentId;
    this.http.post(this.baseUrl + "FileDetail/saveTokenFile", this.tokenFileDetail).subscribe({
      next: (res: any) => {
        this.fileDetails = res.responseBody;
        this.routePath = [this.rootPath];
        if(this.fileDetails.length > 0 && this.fileDetails[0]["Paths"] != null) {
          let paths: Array<any> = JSON.parse(this.fileDetails[0]["Paths"]);
          this.routePath.push(...paths.reverse());
        }
        Toast("Token detail inert/updated successfully");
        HideModal("manageTokenFileModal");
        this.isLoading = false;
      },
      error: error => {
        this.isLoading = false;
        ErrorToast(error.error.ResponseBody);
      }
    })
  }

  addFolderPopup() {
    this.submitted = false;
    this.folderDetail = {Content: null, Extension: 'dir', FileDetailId: 0, FileName: null, OldFileName: null, ParentId: 0};
    ShowModal("manageFolderModal");
  }

  editFolderPopup(item: FileDetail) {
    this.submitted = false;
    this.folderDetail = item;
    ShowModal("manageFolderModal");
  }

  manageFolderDetail() {
    this.submitted = true;

    if (!this.folderDetail.FileName) {
      ErrorToast('Please add folder name');
      return;
    }

    this.isLoading = true;
    this.folderDetail.ParentId = this.parentId;
    this.http.post(this.baseUrl + "FileDetail/manageFolderDetail", this.folderDetail).subscribe({
      next: (res: any) => {
        this.fileDetails = res.responseBody;
        this.routePath = [this.rootPath];
        if(this.fileDetails.length > 0 && this.fileDetails[0]["Paths"] != null) {
          let paths: Array<any> = JSON.parse(this.fileDetails[0]["Paths"]);
          this.routePath.push(...paths.reverse());
        }
        Toast("Token detail inert/updated successfully");
        HideModal("manageFolderModal");
        this.isLoading = false;
      },
      error: error => {
        this.isLoading = false;
        ErrorToast(error.error.ResponseBody);
      }
    })
  }
}

export interface TokenFileDetail {
  Key: string;
  Issuer: string;
  CompanyCode: string;
  ExpiryTimeInSeconds: number;
  ParentId: number;
}