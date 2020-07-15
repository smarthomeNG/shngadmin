
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SchedulerInfo } from '../../common/models/scheduler-info';
import {SceneInfo} from '../../common/models/scene-info';
import {SystemInfo} from '../../common/models/system-info';
import {TranslateService} from '@ngx-translate/core';
import {MessageService} from 'primeng/api';
import {SchedulersApiService} from '../../common/services/schedulers-api.service';


@Component({
  selector: 'app-schedulers',
  templateUrl: './schedulers.component.html',
  styleUrls: ['./schedulers.component.css']
})

export class SchedulersComponent implements OnInit {

  schedulerinfo: SchedulerInfo[];
  developerMode: boolean;

  constructor(private http: HttpClient, private dataService: SchedulersApiService) {
  }

  ngOnInit() {
    console.log('SchedulersComponent.ngOnInit');

    this.dataService.getSchedulers()
      .subscribe(
        (response) => {
          this.schedulerinfo = <SchedulerInfo[]>response;
//          this.schedulerinfo.sort(function (a, b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)});
          this.developerMode = (sessionStorage.getItem('developer_mode') === 'true');

          console.log('getSchedulers', {response});
        }
      );

  }
}

