import {HttpHeaders} from '@angular/common/http';


import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

}
export function getBasicAuthHeader(username: string = 'admin', password: string = 'admin'): HttpHeaders {
  const encoded = btoa(`${username}:${password}`);
  return new HttpHeaders({
    'Authorization': `Basic ${encoded}`
  });
}
