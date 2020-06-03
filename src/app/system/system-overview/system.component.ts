
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
  @ViewChildren('chrtWorkerThreads') chartWorkerThreads: UIChart;
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

  chartoptions1: any;
  chartoptionsSystem: any;
  chartoptionsScheduler: any;
  chartoptionsDisc: any;

  chartdataLoad: any;
  chartdataMemory: any;
  chartdataThreads: any;
  chartdataWorkerThreads: any;
  chartdataDisk: any;

  changed_chartdataLoad: any;
  loadData: any;
  varChartSystemload: any;

  systemloadUpdateSubscription: Subscription = null;
  memoryUpdateSubscription: Subscription = null;
  threadsUpdateSubscription: Subscription = null;
  workerThreadsUpdateSubscription: Subscription = null;
  idleWorkerThreadsUpdateSubscription: Subscription = null;
  activeWorkerThreadsUpdateSubscription: Subscription = null;
  diskUpdateSubscription: Subscription = null;


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
    console.log('initCharts()');



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

    this.chartoptionsSystem = {
      title: {
        display: true,
        text: 'System',
      },
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

    this.chartoptionsScheduler = {
      title: {
        display: true,
        text: 'SmartHomeNG Scheduler',
      },
      scales: {
        xAxes: [{
//          type: 'time',
          distribution: 'linear',
          time: {
            unit: 'minute'
          },
        }],
        yAxes: [{
          ticks: {
            min: 0
          }
        }]
      }
    };

    this.chartoptionsDisc = {
      title: {
        display: true,
        text: 'Disc',
      },
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
          label: 'Load',
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

    this.chartdataWorkerThreads = {
      labels: [],
      datasets: [
        {
          label: 'Started Workers',
          data: [],
          fill: false,
          backgroundColor: '#ff8000',
          borderColor: '#ff8000',
          pointRadius: 0,

        },
        {
          label: 'Active Workers',
          data: [],
          fill: false,
          backgroundColor: '#709cc2',
          borderColor: '#709cc2',
          pointRadius: 0,

        }
        // {
        //   label: 'Idle Workers',
        //   data: [],
        //   fill: false,
        //   backgroundColor: '008000',
        //   borderColor: '#008000',
        //   pointRadius: 0,
        //
        // }
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
          label: '% usage',
          data: [],
          fill: false,
          backgroundColor: '#709cc2',
          borderColor: '#709cc2',
          pointRadius: 0,

        }
      ]
    };

    this.websocketPluginService.connect();
    this.websocketPluginService.getSeriesLoad();
    this.websocketPluginService.getSeriesMemory();
    this.websocketPluginService.getSeriesThreads();
    this.websocketPluginService.getSeriesWorkerThreads();
    this.websocketPluginService.getSeriesDisk();
    this.drawCharts();
  }

  drawCharts() {
    console.log('DrawCharts()');
    this.systemloadUpdateSubscription = this.websocketPluginService.systemloadUpdate$.subscribe(() => {
      // console.error('systemloadUpdate$');
      this.updateChartData(this.chartSystemload, this.chartdataLoad, this.websocketPluginService.systemload.series);
    });
    this.memoryUpdateSubscription = this.websocketPluginService.memoryUpdate$.subscribe(() => {
//      console.error('memoryUpdate$');
      this.updateChartData(this.chartMemory, this.chartdataMemory, this.websocketPluginService.memory.series);
    });
    this.threadsUpdateSubscription = this.websocketPluginService.threadsUpdate$.subscribe(() => {
//      console.error('threadsUpdate$');
      this.updateChartData(this.chartThreads, this.chartdataThreads, this.websocketPluginService.threads.series);
    });
    this.workerThreadsUpdateSubscription = this.websocketPluginService.workerThreadsUpdate$.subscribe(() => {
//      console.error('workerThreadsUpdate$');
    });
    this.idleWorkerThreadsUpdateSubscription = this.websocketPluginService.idleWorkerThreadsUpdate$.subscribe(() => {
//      console.error('idleWorkerThreadsUpdate$');
      this.websocketPluginService.activeWorkerThreads.series = [];
      this.websocketPluginService.activeWorkerThreads.tsdiff = this.websocketPluginService.idleWorkerThreads.tsdiff ;
      for (let i = 0; i < this.websocketPluginService.workerThreads.series.length; i++) {
        this.websocketPluginService.activeWorkerThreads.series.push(this.websocketPluginService.idleWorkerThreads.series[i]);
        this.websocketPluginService.activeWorkerThreads.series[i][1] = this.websocketPluginService.workerThreads.series[i][1] - this.websocketPluginService.idleWorkerThreads.series[i][1];
      }
      this.updateChartData(this.chartWorkerThreads, this.chartdataWorkerThreads, this.websocketPluginService.workerThreads.series, this.websocketPluginService.activeWorkerThreads.series);

    });
    this.diskUpdateSubscription = this.websocketPluginService.diskUpdate$.subscribe(() => {
//      console.error('diskUpdate$');
      this.updateChartData(this.chartDisk, this.chartdataDisk, this.websocketPluginService.disk.series);
    });
  }


  updateChartData(chart: UIChart, chartdata, dataseries, dataseries2 = null) {
    chartdata.labels = [];
    chartdata.datasets[0].data = [];
    if ((dataseries.length > 1) && (dataseries2 != null)) {
      chartdata.datasets[1].data = [];
    }
    // console.warn('datasets', chartdata.datasets.length);

    for (let i = 0; i < dataseries.length; i++) {
      chartdata.labels.push(String(dataseries[i][2].time.substr(0, 5)));
      chartdata.datasets[0].data.push(dataseries[i][1]);
      if ((dataseries.length > 1) && (dataseries2 != null)) {
        chartdata.datasets[1].data.push(dataseries2[i][1]);
      }
    }
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
