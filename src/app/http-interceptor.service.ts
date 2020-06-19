import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { Observable, throwError, of } from 'rxjs';
import { catchError, retryWhen, concatMap, delay } from 'rxjs/operators';

import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class HttpInterceptorService implements HttpInterceptor {
  private httpError = {
    status: 0,
    message: ''
  };

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const serverUrl = this.getHostLocation();
    console.log('server=', serverUrl);
    console.log('request=', request.url);

    let authReq: any;

    // In a typical app, calls are to a specific server with different routes depending on the data needed
    // For instance we may be calling our server with route "/api/get-orders" when we need to get orders.
    // If you are set up like that, this code can be used to intercept the request and handle the redundent work of
    // appending the correct server name and headers.
    // In this example, if the request starts with "/api", we know that we need to append the correct production
    // or test URL and the headers.
    // Any calls that do not start with /api, and those should be send right on through.
    if (request.url.startsWith('/api')) {
      authReq = request.clone({
        url: `${serverUrl}${request.url}`,
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getToken()}`
        })
      });
    } else {
        authReq = request;
    }

    // Intercept the response and if status if 504, indicating a timeout, we will retry again 3 times with a 500 millisecond
    // delay between each time.
    return next.handle(authReq).pipe(
      retryWhen(errors => errors
        .pipe(
          concatMap((error, count) => {
            if (count < 3 && error.status === 504) {
              return of(error);
            }
            return throwError(error.error);
          }),
          delay(500)
        )
      ),
      catchError((error: HttpErrorResponse) => {
        if (error instanceof HttpErrorResponse) {
          // server-side error
          this.httpError.status = error.status;
          this.httpError.message = error.message;
          return throwError(this.httpError);
        } else {
          // client-side error
          return throwError(error);
        }
      })
    );
  }

  constructor() { }

  private getHostLocation() {
    const hostLocation = window.location.host;

    let serverUrl = environment.serverUrl;

    if (environment.production && hostLocation.includes('localhost')) {
      // Override back-end URL with localhost if testing Service Worker using http-server
      serverUrl = 'http://localhost:3000';
    }

    return serverUrl;
  }

  private getToken(): string {
    let token: any;

    // Normally, you would get the authorization token stored locally like this.
    // token = localStorage.getItem('my-token');

    // But since we don't have one for this demo app, we will fake it

    token = 'my-token';

    return token;
  }
}
