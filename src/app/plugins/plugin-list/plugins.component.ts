
import { Component, OnInit } from '@angular/core';
import { TemplateRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {faPlayCircle, faPauseCircle, faExclamationTriangle, faCode} from '@fortawesome/free-solid-svg-icons';

import { PluginsApiService } from '../../common/services/plugins-api.service';
import { OlddataService } from '../../common/services/olddata.service';
import { SchedulerInfo } from '../../common/models/scheduler-info';
import { PlugininfoType } from '../../common/models/plugin-info';

@Component({
  selector: 'app-plugins',
  templateUrl: './plugins.component.html',
  styleUrls: ['./plugins.component.css'],
  providers: [OlddataService]
})
export class PluginsComponent implements OnInit {

  faPlayCircle = faPlayCircle;
  faPauseCircle = faPauseCircle;
  faExclamationTriangle = faExclamationTriangle;  // signal deprecated plugin
  faCode = faCode;                               // signal plugin in state "develop"

  plugininfo: PlugininfoType[];

  modalRef: BsModalRef;
  constructor(private http: HttpClient, private pluginsdataService: PluginsApiService, private modalService: BsModalService) {
  }

  ngOnInit() {
    console.log('PluginsComponent.ngOnInit');

    this.pluginsdataService.getPluginsInfo()
      .subscribe(
        (response) => {
          this.plugininfo = <any>response;
          this.plugininfo.sort(function (a, b) {return (a.pluginname + a.configname.toLowerCase() > b.pluginname + b.configname.
          toLowerCase()) ? 1 : ((b.pluginname + b.configname.toLowerCase() > a.pluginname + a.configname.toLowerCase()) ? -1 : 0); });
        }
      );

  }



  parameterLines(parameters) {
    let result = Math.round(parameters / 2);
    if (result < 3) {
      result = 3;
    }
    return result;
  }

  attributeLines(parameters) {
    let result = Math.round(parameters / 3);
    if (result < 2) {
      result = 2;
    }
    return result;
  }

  openModal(template: TemplateRef<any>, parm: string) {
    this.modalRef = this.modalService.show(template, {animated: false});
    console.log('openModal: ' + parm);
  }

  goToLink(url: string) {
    window.open(url, '_blank');
  }

}

