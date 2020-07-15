
import { Component, OnInit } from '@angular/core';

import { ThreadInfo } from '../../common/models/thread-info';
import {ThreadsApiService} from '../../common/services/threads-api.service';


@Component({
  selector: 'app-threads',
  templateUrl: './threads.component.html',
  styleUrls: ['./threads.component.css'],
})


export class ThreadsComponent implements OnInit {

  threadsList: ThreadInfo[];
  threads_count: number;
  thread_response: [number, ThreadInfo[]];


  constructor(private dataService: ThreadsApiService) { }

  ngOnInit() {
    // console.log('ThreadsComponent.ngOnInit');

    this.dataService.getThreads()
      .subscribe(
        (response) => {
          this.threadsList = response[1];
          this.threads_count = response[0];
//          this.schedulerinfo.sort(function (a, b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)});
          console.log('getThreads', {response});
        }
      );
  }

}

