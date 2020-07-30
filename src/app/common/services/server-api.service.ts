
import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';


import { TranslateService } from '@ngx-translate/core';
import { parse } from 'url';
import { ServerInfo } from '../models/server-info';
import {SharedService} from './shared.service';



let dataUrl = 'http://';
let host_ip = '';

@Injectable({
  providedIn: 'root'
})
export class ServerApiService {
// export class ThreadsApiService {

  baseUrl: string;
  shng_serverinfo: ServerInfo = <ServerInfo>{'itemtree_fullpath': true};


  constructor(private http: HttpClient,
              private translate: TranslateService,
              private shared: SharedService,
              @Inject('BASE_URL') baseUrl: string) {

    // console.log('ServerApiService.constructor:');

    this.baseUrl = baseUrl;

    const parsedUrl = parse(baseUrl);
    let apiUrl = '/api/';

    if (host_ip === '') {
      host_ip = location.host;
      if (host_ip === 'localhost:4200') {
        dataUrl = baseUrl + 'assets/testdata/';
        apiUrl = dataUrl + 'api/';
      } else {
        dataUrl = baseUrl;
      }
      sessionStorage.setItem('apiUrl', apiUrl);
      sessionStorage.setItem('dataUrl', dataUrl);

      sessionStorage.setItem('hostIp', host_ip.split(':')[0]);
      // sessionStorage.setItem('wsPort', '2424');

    }


    this.getServerBasicinfo()
      .subscribe(
        (response: ServerInfo) => {
          this.shng_serverinfo = response;
          // this language will be used as a fallback when a translation isn't found in the current language
          // translate.setDefaultLang(this.shared.getFallbackLanguage());
        },
        (error) => {
          console.warn('DataService: getShngServerinfo():', {error});
        }
      );


  }


  getServerBasicinfo() {
    const apiUrl = sessionStorage.getItem('apiUrl');
    let url = apiUrl + 'server/';
    if (apiUrl.includes('localhost')) {
      url += 'default.json';
    }
    return this.http.get(url)
      .pipe(
        map(response => {
          this.shng_serverinfo = <ServerInfo>response;
          const result = <ServerInfo>response;
          let lang = sessionStorage.getItem('default_language');
          // console.warn({lang});
          if (lang === null) {
            sessionStorage.setItem('default_language', this.shng_serverinfo.default_language);
            const fallback = this.shng_serverinfo.fallback_language_order;
            lang = sessionStorage.getItem('default_language');
            this.translate.setDefaultLang(this.shared.getFallbackLanguage());
            // console.log('getServerBasicinfo', {lang}, {fallback}, this.shared.getFallbackLanguage());
            this.shared.setGuiLanguage();
          }
          sessionStorage.setItem('client_ip', this.shng_serverinfo.client_ip);
          // sessionStorage.setItem('tz', this.shng_serverinfo.tz);
          // sessionStorage.setItem('tzname', this.shng_serverinfo.tzname);
          // sessionStorage.setItem('itemtree_fullpath', this.shng_serverinfo.itemtree_fullpath.toString());
          // sessionStorage.setItem('itemtree_searchstart', this.shng_serverinfo.itemtree_searchstart.toString());
          // sessionStorage.setItem('core_branch', this.shng_serverinfo.core_branch);
          // sessionStorage.setItem('plugins_branch', this.shng_serverinfo.plugins_branch);
          const hostip = sessionStorage.getItem('hostIp');
          if (hostip === 'localhost') {
            // sessionStorage.setItem('wsHost', this.shng_serverinfo.websocket_host);
          } else {
            sessionStorage.setItem('wsHost', hostip);
          }
          // sessionStorage.setItem('wsPort', this.shng_serverinfo.websocket_port);

          this.shared.setGuiLanguage();
          return result;
        }),
        catchError((err: HttpErrorResponse) => {
          console.error('ServerApiService (getServerinfo): Could not read serverinfo data' + ' - ' + err.error.error);
          return of({});
        })
      );
  }

  getServerinfo() {
    // console.log('ServerApiService.getServerinfo');
    const apiUrl = sessionStorage.getItem('apiUrl');
    let url = apiUrl + 'server/info/';
    if (apiUrl.includes('localhost')) {
      url += 'default.json';
    }
    return this.http.get(url)
      .pipe(
        map(response => {
          // console.log('getServerinfo(): map');
          this.shng_serverinfo = <ServerInfo> response;
          const result = response;
          let lang = sessionStorage.getItem('default_language');
          // console.warn({lang});
          const fallback = this.shng_serverinfo.fallback_language_order;
          if (lang === null) {
            sessionStorage.setItem('default_language', this.shng_serverinfo.default_language);
            lang = sessionStorage.getItem('default_language');
          }
          this.translate.setDefaultLang(this.shared.getFallbackLanguage());
          // console.log('getServerinfo', {lang}, {fallback});
          sessionStorage.setItem('client_ip', this.shng_serverinfo.client_ip);
          sessionStorage.setItem('tz', this.shng_serverinfo.tz);
          sessionStorage.setItem('tzname', this.shng_serverinfo.tzname);
          sessionStorage.setItem('tznameST', this.shng_serverinfo.tznameST);
          sessionStorage.setItem('tznameDST', this.shng_serverinfo.tznameDST);
          sessionStorage.setItem('itemtree_fullpath', this.shng_serverinfo.itemtree_fullpath.toString());
          sessionStorage.setItem('itemtree_searchstart', this.shng_serverinfo.itemtree_searchstart.toString());
          sessionStorage.setItem('core_branch', this.shng_serverinfo.core_branch);
          sessionStorage.setItem('plugins_branch', this.shng_serverinfo.plugins_branch);
          sessionStorage.setItem('developer_mode', this.shng_serverinfo.developer_mode.toString());
          sessionStorage.setItem('click_dropdown_header', this.shng_serverinfo.click_dropdown_header.toString());

          sessionStorage.setItem('fallback_language_order', JSON.stringify(this.shng_serverinfo.fallback_language_order.split(',')));

          const hostip = sessionStorage.getItem('hostIp');
          if (hostip === 'localhost') {
            sessionStorage.setItem('wsHost', this.shng_serverinfo.websocket_host);
          } else {
            sessionStorage.setItem('wsHost', hostip);
          }
          sessionStorage.setItem('wsPort', this.shng_serverinfo.websocket_port);

          this.shared.setGuiLanguage();
          return result;
        }),
        catchError((err: HttpErrorResponse) => {
          console.error('ServerApiService (getServerinfo): Could not read serverinfo data' + ' - ' + err.error.error);
          return of({});
        })
      );

  }


  // get Status of shNG software
  getShngServerStatus() {
    // console.log('getShngServerStatus')
    const apiUrl = sessionStorage.getItem('apiUrl');
    let url = apiUrl + 'server/status/';
    if (apiUrl.includes('localhost')) {
      url += 'default.json';
    }
    return this.http.get(url)
      .pipe(
        map(response => {
          return response;
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.error.error !== undefined) {
            console.error('ServerApiService (getShngServerStatus): Could not read server status' + ' - ' + err.error.error);
//          } else {
//            console.warn('ServerApiService (getShngServerStatus): SmartHomeNG is not running');
          }
          return of({});
        })
      );
  }


  // restart shNG software
  restartShngServer() {
    // console.log('restartShngServer')
    const apiUrl = sessionStorage.getItem('apiUrl');
    let url = apiUrl + 'server/restart/';
    if (apiUrl.includes('localhost')) {
      url += 'default.json';
    }
    return this.http.put(url, JSON.stringify(''))
      .pipe(
        map(response => {
          return response;
        }),
        catchError((err: HttpErrorResponse) => {
          console.error('ServerApiService (RestartShngServer): Could not restart server' + ' - ' + err.error.error);
          return of({});
        })
      );
  }


  // Download config files as a zip archive

  downloadConfigBackup() {
    // console.log('restartShngServer')
    const apiUrl = sessionStorage.getItem('apiUrl');
    let url = apiUrl + 'files/backup/';
    if (apiUrl.includes('localhost')) {
      url += 'shng_backup.zip';
    }
    return this.http.get(url, {responseType: 'blob'})
      .pipe(
        map(response => {
          return response;
        }),
        catchError((err: HttpErrorResponse) => {
          console.error('ServerApiService (downloadConfigBackup): Could not download backup data' + ' - ' + err.error.error);
          return of({});
        })
      );
  }

}




