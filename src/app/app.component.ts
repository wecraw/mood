import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import {SpotifyService} from './shared/index';
import { switchMap, tap, map } from 'rxjs/operators';
import { Chart } from 'chart.js';
import * as linspace from 'linspace'


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})


export class AppComponent implements OnInit {

  @ViewChild('canvas') canvas: ElementRef;
  chart = [];
  title = 'mood-app';
  clientId = 'b0ceffc831b04ac4b63ab619617fec38';
  responseType = 'code';
  scope = 'user-read-recently-played';

  response: Object;
  listeningHistoryDetails: any;
  audioFeaturesDetails: any;
  valenceResponse: any;
  valenceHistory = [];
  timestampArray = [];
  nameArray = [];
  artistArray = [];
  displayChart: boolean = false;
  spacingArray = linspace(1,50,50);


  redirectURI = 'https://wecraw.github.io/mood/';
  // redirectURI = 'http://localhost:4200/';
  encodedURI = encodeURI(this.redirectURI)

  authUrl = 'https://accounts.spotify.com/authorize?client_id='+this.clientId+'&response_type=token&redirect_uri='+this.encodedURI+'&scope=user-read-recently-played'

  constructor(private spotifyService: SpotifyService) { }

  ngOnInit(){
    let url:string = window.location.href;

    //check if user was just redirected from the spotify auth flow
    if(url.includes('token=')){


      //get token from url
      let access_token = url.substring(
          url.lastIndexOf("token=") + 6, url.lastIndexOf("&") //get str between token= and next query response, offset 6 for length of 'token='
      )

      window.sessionStorage.setItem('access_token',access_token);
      window.open(this.redirectURI,"_self")
    }
    if(this.checkAuth()){

      this.spotifyService.getListeningHistory().pipe(

        tap(res1 => {
          this.listeningHistoryDetails = res1;
          for (let i in res1['items']){
            this.timestampArray[i] = new Date(res1['items'][i]['played_at'])
            this.nameArray[i] = res1['items'][i]['track']['name']
            this.artistArray[i] = res1['items'][i]['track']['artists'][0]['name']
          }
        }),

        switchMap(res1 => {
          let listeningHistory = [];
          for (let i in res1['items']){
            listeningHistory[i] = res1['items'][i]['track']['uri'];
          }
          let lhString = listeningHistory.toString();
          lhString = lhString.replace(/spotify:track:/g, '')

          return this.spotifyService.getValenceHistory(lhString);

        })).subscribe(res2 => {
          this.audioFeaturesDetails = res2;
          for (let j in res2['audio_features']){
            this.valenceHistory[j] = res2['audio_features'][j]['valence']
          }

          let names = this.nameArray;
          let artists = this.artistArray;

          this.chart = new Chart(this.canvas.nativeElement.getContext('2d'), {
            type: 'line',
            data: {
              // labels: this.timestampArray, // x axis data
              labels: this.spacingArray,

              datasets: [
                {
                  data: this.valenceHistory, // your data array
                  lineTension: 0,
                  borderColor: '#00AEFF',
                  fill: false,
                  pointRadius: 8
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,

              legend: {
                display: false
              },
              scales: {
                xAxes: [{

                display: false
                }],
                yAxes: [{
                  ticks: {
                    min: 0,
                    max: 1
                  },
                  scaleLabel: {
                    display: true,
                    labelString: 'Valence'
                  },
                  display: true
                }],
              },
              tooltips: {
                callbacks: {
                  beforeTitle: function(t,d) {
                    return (artists[t[0].index] + ' - ' + names[t[0].index])
                  },
                  title: function(){} //hide datetime in tooltip

                }
              }

            }
          });
        })
    }
  }

  //returns true if user has authenitcated in current session
  checkAuth(): boolean{
    return window.sessionStorage.getItem('access_token') != null
  }

  login(): any{

    window.open(this.authUrl,"_self")

  }

  getTimestampArray(): any{

    let timestampArray = [];
    for (let i in this.listeningHistoryDetails['items']){
      timestampArray[i] = new Date(this.listeningHistoryDetails['items'][i]['played_at'])
    }
    return timestampArray;

  }

}
