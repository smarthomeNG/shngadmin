
import { Component, OnInit, OnDestroy, ViewChildren, EventEmitter } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Subscription } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import { UIChart } from 'primeng/primeng';

import * as $ from 'jquery';

import { OlddataService } from '../../common/services/olddata.service';
import { SystemInfo } from '../../common/models/system-info';
import { PypiInfo } from '../../common/models/pypi-info';
import { WebsocketService } from '../../common/services/websocket.service';
import { WebsocketPluginService } from '../../common/services/websocket-plugin.service';
import { SharedService } from '../../common/services/shared.service';
import { ServerApiService } from '../../common/services/server-api.service';


@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.css'],
  providers: [ WebsocketService, WebsocketPluginService ]
})
export class SystemComponent implements OnDestroy, OnInit {

  faCheckCircle = faCheckCircle;

  loading: boolean = true;

  @ViewChildren('chrtSystemload') chartSystemload: UIChart;
  @ViewChildren('chrtMemory') chartMemory: UIChart;
  @ViewChildren('chrtThreads') chartThreads: UIChart;
  @ViewChildren('chrtDisk') chartDisk: UIChart;

  systeminfo: SystemInfo = <SystemInfo>{};
  pypiinfo: PypiInfo[];
  reqinfodisplay: {};
  plugincount = 0;
  documentationcount = 0;
  testsuitecount = 0;
  norequirementcount = 0;

  os_uptime = '';
  sh_uptime = '';

  chartdataLoad: any;
  chartoptions1: any;
  chartdataMemory: any;
  chartdataThreads: any;
  chartdataDisk: any;

  changed_chartdataLoad: any;
  loadData: any;
  varChartSystemload: any;

  systemloadUpdateSubscription: Subscription = null;
  memoryUpdateSubscription: Subscription = null;
  threadsUpdateSubscription: Subscription = null;
  diskUpdateSubscription: Subscription = null;

  systemloadChartInitialized = false;
  memoryChartInitialized = false;
  threadsChartInitialized = false;
  diskChartInitialized = false;

  constructor(private http: HttpClient,
              private dataService: OlddataService,
              private dataServiceServer: ServerApiService,
              private translate: TranslateService,
              private websocketPluginService: WebsocketPluginService,
              public shared: SharedService) {
  }


  static resizeDisclosure() {
    const browserHeight = $(window).height();
    const disclosure = $('#disclosuretext');
    // const offsetTop = disclosure.offset().top;
    // initially offsetTop is off by a number of pixels. Correction: a fixed offset
    const offsetTop = 110;
    const height = String(Math.round((-1) * (offsetTop) - 35 + browserHeight) + 'px');
    disclosure.css('height', height);
    disclosure.css('maxHeight', height);
  }


  ngOnInit() {
    console.log('SystemComponent.ngOnInit:');


    this.dataServiceServer.getServerinfo()
      .subscribe(
        (response) => {
          this.initSystemInfo();
        }
      );
  }


  ngOnDestroy(): void {
    this.websocketPluginService.disconnect();
  }


  initSystemInfo() {

    // ---------------------------------------------
    // Initialize system info (from OlddataService)
    //
    this.dataService.getSysteminfo()
      .subscribe(
        (response: SystemInfo) => {
          this.systeminfo = response;

          this.os_uptime = this.shared.ageToString(this.systeminfo.uptime);
          this.sh_uptime = this.shared.ageToString(this.systeminfo.sh_uptime);


        },
        (error) => {
          console.log('SystemComponent: dataService.getSysteminfo():');
          console.log(error);
        }
      );


    // -----------------------------------
    // Initialize Pypi info
    //
    this.dataService.getPypiinfo()
      .subscribe(
        (response: PypiInfo[]) => {
          this.pypiinfo = response;
          this.loading = false;

          // count if plugin requirements exist
          this.plugincount = 0;
          for (let i = 0; i < this.pypiinfo.length; ++i) {
            // if (this.pypiinfo[i].name === 'ruamel.yaml') {
            //   console.log(this.pypiinfo[i]);
            // }
            if (this.pypiinfo[i].is_required_for_plugins === true) {
              this.plugincount++;
            }
          }

          // count if documentation requirements exist
          this.documentationcount = 0;
          for (let i = 0; i < this.pypiinfo.length; ++i) {
            if (this.pypiinfo[i].is_required_for_docbuild === true) {
              this.documentationcount++;
            }
          }

          // count if testsuite requirements exist
          this.testsuitecount = 0;
          for (let i = 0; i < this.pypiinfo.length; ++i) {
            if (this.pypiinfo[i].is_required_for_testsuite === true) {
              this.testsuitecount++;
            }
          }

          // count if package without requirements exist
          this.norequirementcount = 0;
          for (let i = 0; i < this.pypiinfo.length; ++i) {
            if (this.pypiinfo[i].is_required === false && this.pypiinfo[i].is_required_for_docbuild === false &&
              this.pypiinfo[i].is_required_for_testsuite === false) {
              this.norequirementcount++;
            }
          }

          this.reqinfodisplay = {};
          for (let i = 0; i < this.pypiinfo.length; ++i) {
            this.reqinfodisplay[this.pypiinfo[i].name] = this.buildreqinfostring(this.pypiinfo[i]);
          }

        },
        (error) => console.log('SystemComponent: dataService.getPypiinfo():' + error)
      );


    // -----------------------------------
    // Initialize info for the graph-tab
    //
    this.initCharts();



    window.addEventListener('resize', SystemComponent.resizeDisclosure, false);
    SystemComponent.resizeDisclosure();

    let filepath = '/3rdpartylicenses.txt';
    const hostip = sessionStorage.getItem('hostIp');
    if (hostip !== 'localhost') {
      filepath = '/admin' + filepath;
      this.http.get(filepath, {responseType: 'text'})
        .subscribe(
          response => {
            const message = response.toString();
            $('#disclosuretext').text(message);
          },
          error => {
            $('#disclosuretext').text( '\nERROR ' + error.status + ':\n\n    ' + error.url + '   ' + error.statusText);
          });

    } else {
      $('#disclosuretext').text("\nYou are in develop mode: \n\nThe file '3dpartylicenses.txt' is created only in production mode. In develop mode the file does not exist.");
    }

  }


  // ===================================
  // methods for the Pypi check tab
  // -----------------------------------
  //
  buildreqinfostring(element) {

    /* Build String for requirements column */
    let reqString = '';

    if (element['vers_req_min'] !== '' && element['vers_req_max'] !== '' && (element['vers_req_min'] !== element['vers_req_max'])) {
      // MIN and MAX filled, MIN != MAX
      reqString += element['vers_req_min'] + ' <= ';
    } else {
      if (element['vers_req_min'] !== '' && element['vers_req_max'] != '' && (element['vers_req_min'] == element['vers_req_max'])) {
        // ELSE: MIN and MAX filled, MIN == MAX
        reqString += ' == ' + element['vers_req_min'];
      } else {
        // ELSE: MIN or MAX filled * /
        if (element['vers_req_min'] !== '') {
          reqString += ' >= ' + element['vers_req_min'];
        } else if (element['vers_req_max'] !== '') {
          reqString += '<= ' + element['vers_req_max'];
        }
      }

      if (reqString === '') {
        // Element required due to Doku, Testsuite or SmartHomeNG in general, but no MIN and MAX version -> all versions valid * /
        reqString = ' == *';
      }
    }

    return reqString;
  }


  // ===================================
  // methods for the graph tab
  // -----------------------------------
  //
  initCharts() {

    this.chartoptions1 = {
      scales: {
        xAxes: [{
//          type: 'time',
          distribution: 'linear',
          time: {
            unit: 'minute'
          },
        }]
      }
    };

    this.chartdataLoad = {
      labels: [],
      datasets: [
        {
          label: 'System Load',
          data: [],
          fill: false,
          backgroundColor: '#709cc2',
          borderColor: '#709cc2',
          pointRadius: 0,

        }
      ]
    };

    this.chartdataThreads = {
      labels: [],
      datasets: [
        {
          label: 'Threads',
          data: [],
          fill: false,
          backgroundColor: '#709cc2',
          borderColor: '#709cc2',
          pointRadius: 0,

        }
      ]
    };

    this.chartdataMemory = {
      labels: [],
      datasets: [
        {
          label: 'Memory (MByte)',
          data: [],
          fill: false,
          backgroundColor: '#709cc2',
          borderColor: '#709cc2',
          pointRadius: 0,

        }
      ]
    };

    this.chartdataDisk = {
      labels: [],
      datasets: [
        {
          label: 'Disk (% usage)',
          data: [],
          fill: false,
          backgroundColor: '#709cc2',
          borderColor: '#709cc2',
          pointRadius: 0,

        }
      ]
    };

//    this.setSystemloadData(undefined);
//    this.setMemoryData(undefined);
//    this.setThreadsData(undefined);
//    this.setDiskData(undefined);

    this.websocketPluginService.connect();
    this.websocketPluginService.getSeriesLoad();
    this.websocketPluginService.getSeriesMemory();
    this.websocketPluginService.getSeriesThreads();
    this.websocketPluginService.getSeriesDisk();

    this.systemloadUpdateSubscription = this.websocketPluginService.systemloadUpdate$.subscribe(() => {
//      console.error('systemloadUpdate$');
      this.updateSystemloadData(this.chartSystemload);
    });
    this.memoryUpdateSubscription = this.websocketPluginService.memoryUpdate$.subscribe(() => {
//      console.error('memoryUpdate$');
      this.updateMemoryData(this.chartMemory);
    });
    this.threadsUpdateSubscription = this.websocketPluginService.threadsUpdate$.subscribe(() => {
//      console.error('threadsUpdate$');
      this.updateThreadsData(this.chartThreads);
    });
    this.diskUpdateSubscription = this.websocketPluginService.diskUpdate$.subscribe(() => {
//      console.error('diskUpdate$');
      this.updateDiskData(this.chartDisk);
    });
  }


  updateSystemloadData(chart: UIChart) {
    this.chartdataLoad.labels = [];
    this.chartdataLoad.datasets[0].data = [];
    // console.log('Load - Datapoints: ' + String(this.websocketPluginService.systemload.series.length));
//    console.log(this.websocketPluginService.systemload.series);
    for (let i = 0; i < this.websocketPluginService.systemload.series.length; i++) {
        this.chartdataLoad.labels.push(String(this.websocketPluginService.systemload.series[i][2].time.substr(0,5)));
      this.chartdataLoad.datasets[0].data.push(this.websocketPluginService.systemload.series[i][1]);
    }
//    console.log({chart});
    if (this.systemloadChartInitialized) {
      // console.warn('updateSystemloadData: Chart-Refresh');
//      chart.refresh();
    }
    this.systemloadChartInitialized = true;
  }


  updateMemoryData(chart: UIChart) {
    this.chartdataMemory.labels = [];
    this.chartdataMemory.datasets[0].data = [];
    // console.log('Memory - Datapoints: ' + String(this.websocketPluginService.memory.series.length));
//    console.log(this.websocketPluginService.memory.series);
    for (let i = 0; i < this.websocketPluginService.memory.series.length; i++) {
      this.chartdataMemory.labels.push(String(this.websocketPluginService.memory.series[i][2].time.substr(0,5)));
//      this.chartdataMemory.labels.push(String(this.websocketPluginService.MemorySeriesData[i][0]));
      this.chartdataMemory.datasets[0].data.push(this.websocketPluginService.memory.series[i][1]);
    }
//    console.log({chart});
    if (this.memoryChartInitialized) {
      // console.warn('updateMemoryData: Chart-Refresh');
//      chart.refresh();
    }
    this.memoryChartInitialized = true;
  }


  updateThreadsData(chart: UIChart) {
    this.chartdataThreads.labels = [];
    this.chartdataThreads.datasets[0].data = [];
    // console.log('Threads - Datapoints: ' + String(this.websocketPluginService.threads.series.length));
//    console.log(this.websocketPluginService.threads.series);
    for (let i = 0; i < this.websocketPluginService.threads.series.length; i++) {
//      this.chartdataThreads.labels.push(String(this.websocketPluginService.ThreadsSeriesData[i][2].time.substr(0,5)));
      this.chartdataThreads.labels.push(this.websocketPluginService.threads.series[i][2].date.substr(0, 5) + ' ' + String(this.websocketPluginService.threads.series[i][2].time.substr(0,5)));
//      this.chartdataMemory.labels.push(String(this.websocketPluginService.MemorySeriesData[i][0]));
      this.chartdataThreads.datasets[0].data.push(this.websocketPluginService.threads.series[i][1]);
    }
//    console.log({chart});
    if (this.threadsChartInitialized) {
      // console.warn('updateThreadsData: Chart-Refresh');
//      chart.refresh();
    }
    this.threadsChartInitialized = true;
  }


  updateDiskData(chart: UIChart) {
    this.chartdataDisk.labels = [];
    this.chartdataDisk.datasets[0].data = [];
    // console.log('Disk - Datapoints: ' + String(this.websocketPluginService.disk.series.length));
//    console.log(this.websocketPluginService.disk.series);
    for (let i = 0; i < this.websocketPluginService.disk.series.length; i++) {
//      this.chartdataDisk.labels.push(String(this.websocketPluginService.DiskSeriesData[i][2].time.substr(0,5)));
      this.chartdataDisk.labels.push(this.websocketPluginService.disk.series[i][2].date.substr(0, 5) + ' ' + String(this.websocketPluginService.disk.series[i][2].time.substr(0, 5)));
//      this.chartdataMemory.labels.push(String(this.websocketPluginService.MemorySeriesData[i][0]));
      this.chartdataDisk.datasets[0].data.push(this.websocketPluginService.disk.series[i][1]);
    }
//    console.log({chart});
    if (this.diskChartInitialized) {
      console.warn('updateDiskData: Chart-Refresh');
//      chart.refresh();
    }
    this.diskChartInitialized = true;
  }


  updateSystemloadChart(chart: UIChart) {
    chart.refresh();
  }


  setSystemloadData(loadData) {

    this.chartdataLoad = {
      labels: [],
      datasets: [
        {
          label: 'System Load',
          data: [],
          fill: false,
          backgroundColor: '#709cc2',
          borderColor: '#709cc2',
          pointRadius: 0,

        }
      ]
    };

    if (loadData === undefined) {
    } else {
      console.log('setSystemloadData (callback)');
      console.log(loadData);
      this.loadData = loadData;

      this.chartdataLoad.labels = [];
      this.chartdataLoad.datasets[0].data = [];
      console.log('Datapoints: ' + String(loadData.length));
      for (let i = 0; i < loadData.length; i++) {
        this.chartdataLoad.datasets[0].data.push(loadData[i][1]);
      }

      console.log(this.chartdataLoad.labels);
      console.log(this.chartdataLoad.datasets[0].data);

    }
  }

}
