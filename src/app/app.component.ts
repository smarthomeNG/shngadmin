import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ServerApiService } from './common/services/server-api.service';
import { AuthService } from './common/services/auth.service';
import { ServerInfo } from './common/models/server-info';
import {SharedService} from './common/services/shared.service';




// Allow ngx-translate to find translation files on other path than /assets/i18n/...
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  public APP_NAME = 'shngAdmin';
  public APP_VERSION = '0.3.3';

  title = 'app';

  constructor(private http: HttpClient,
              private dataService: ServerApiService,
              private translate: TranslateService,
              private shared: SharedService,
              public authService: AuthService) {

    // console.log('AppComponent.constructor:');

//    translate.setDefaultLang('de');

//    this.dataService.getServerBasicinfo()
    this.dataService.getServerBasicinfo()
      .subscribe(
        (response: ServerInfo) => {
          this.dataService.shng_serverinfo = response;

          this.shared.setGuiLanguage();
        },
        (error) => {
          console.warn('DataService: getShngServerinfo():', {error});
        }
      );
  }


  ngOnInit() {
  }

}

