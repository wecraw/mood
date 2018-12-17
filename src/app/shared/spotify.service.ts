import { Injectable } from '@angular/core';
// import { Observable, of } from 'rxjs'
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {

  constructor(private http: HttpClient) { }

  getListeningHistory() {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + window.sessionStorage.getItem('access_token'));
    let params = new HttpParams().set('limit', '50')

    const options = { params: params, headers: headers}

    return this.http.get('https://api.spotify.com/v1/me/player/recently-played',options);


  }

  getValenceHistory(history:string) {
    let headers = new HttpHeaders().set("Authorization", "Bearer " + window.sessionStorage.getItem('access_token'));
    let params = new HttpParams().set('ids', history)

    const options = { params: params, headers: headers}

    return this.http.get('https://api.spotify.com/v1/audio-features',options);

  }


}
//    let params = new HttpParams().set('ids', this.getListeningHistory())

//    return this.http.get('https://api.spotify.com/v1/audio-features',options);
