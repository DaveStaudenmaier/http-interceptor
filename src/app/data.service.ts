import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  getData(responseCode: number) {
    return this.http.get('http://httpstat.us/' + responseCode + '?sleep=1000');
  }

  getServerApi() {
    return this.http.get('/api/get-orders');
  }
}
