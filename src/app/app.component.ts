import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'emstum_internal';
  // isScrolled = false;
  // @HostListener('window:scroll', [])
  // onWindowScroll() {
  //   this.isScrolled = window.scrollY > 10; // adjust the value as needed
  // }

  closeToast() {
    document.getElementById("toast").classList.add("d-none");
    let $Toast = document.getElementById("toast");
    let $Error = document.getElementById("warning-box");
    let $Warning = document.getElementById("error-box");
    if ($Toast) {
      $Toast.classList.add("d-none");
      $Error.classList.add("d-none");
      $Warning.classList.add("d-none");
    }
  }
}
