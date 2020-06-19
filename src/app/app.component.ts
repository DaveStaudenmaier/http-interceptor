import { Component } from '@angular/core';

import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showResult = false;
  httpResult: string;

  constructor(private data: DataService) {}

  onResponse(responseCode: number) {
    this.showResult = true;
    this.httpResult = 'Loading...';

    this.data.getData(responseCode)
    .subscribe(result => {
      this.httpResult = 'Success!';
    }, error => {
      this.httpResult  = 'Error! Status =' + error.code;
    });
  }

  onApi() {
    this.showResult = true;
    this.httpResult = 'Loading...';

    this.data.getServerApi()
    .subscribe(result => {
      this.httpResult = 'Success!';
    }, error => {
      this.httpResult  = 'Error! Status =' + error.status;
    });
  }
}
