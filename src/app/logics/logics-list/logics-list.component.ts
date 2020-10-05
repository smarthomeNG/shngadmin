
import { Component, OnInit } from '@angular/core';
import { TemplateRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BsModalService} from 'ngx-bootstrap/modal';

import {LogicsApiService} from '../../common/services/logics-api.service';
import {LogicsinfoType} from '../../common/models/logics-info';
import {OlddataService} from '../../common/services/olddata.service';
// import {Log} from '@angular/core/testing/src/logger';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-logics',
  templateUrl: './logics-list.component.html',
  styleUrls: ['./logics-list.component.css'],
  providers: [OlddataService]
})
export class LogicsListComponent implements OnInit {

  logics: LogicsinfoType[];
  userlogics: LogicsinfoType[];
  systemlogics: LogicsinfoType[];
  newlogics: LogicsinfoType[];

  newlogic_display: boolean = false;
  newlogic_name: string = '';
  newlogic_filename: string = '';
  newlogic_add_enabled: boolean = true;
  wrongNewLogicName: string = '';
  confirmdelete_display: boolean = false;
  logicToDelete: string = '';
  delete_param: {};


  constructor(private http: HttpClient,
              private dataService: LogicsApiService,
              private modalService: BsModalService,
              private router: Router,
              private route: ActivatedRoute) {
    this.userlogics = [];
    this.systemlogics = [];
  }


  ngOnInit() {
    console.log('LogicsListComponent.ngOnInit');
    this.getLogics();
  }


  baseName(str, withExtension = true) {
    let base = str;
    base = base.substring(base.lastIndexOf('/') + 1);
    if (!withExtension && base.lastIndexOf('.') !== -1) {
      base = base.substring(0, base.lastIndexOf('.'));
    }
    return base;
  }


  getLogics() {
    this.dataService.getLogics()
      .subscribe(
        (response) => {
          this.logics = <LogicsinfoType[]>response['logics'];
          this.logics.sort(function (a, b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });
          this.userlogics = [];
          this.systemlogics = [];
          for (const logic of this.logics) {
            if (logic.userlogic === true) {
              this.userlogics.push(logic);
            } else {
              this.systemlogics.push(logic);
            }
          }
          this.newlogics = <LogicsinfoType[]>response['logics_new'];
          this.newlogics.sort(function (a, b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });
        }
      );
  }


  triggerLogic(logicName) {
    // console.log('triggerLogic', {logicName});
    this.dataService.setLogicState(logicName, 'trigger')
      .subscribe(
        (response) => {
          this.getLogics();
        }
      );
  }


  reloadLogic(logicName) {
    // console.log('reloadLogic', {logicName});
    this.dataService.setLogicState(logicName, 'reload')
      .subscribe(
        (response) => {
          this.getLogics();
        }
      );
  }


  disableLogic(logicName) {
    // console.log('disableLogic', {logicName});
    this.dataService.setLogicState(logicName, 'disable')
      .subscribe(
        (response) => {
          this.getLogics();
        }
      );
  }


  enableLogic(logicName) {
    // console.log('enableLogic', {logicName});
    this.dataService.setLogicState(logicName, 'enable')
      .subscribe(
        (response) => {
          this.getLogics();
        }
      );
  }


  unloadLogic(logicName) {
    // console.log('unloadLogic', {logicName});
    this.dataService.setLogicState(logicName, 'unload')
      .subscribe(
        (response) => {
          this.getLogics();
        }
      );
  }


  loadLogic(logicName) {
    // console.log('loadLogic', {logicName});
    this.dataService.setLogicState(logicName, 'load')
      .subscribe(
        (response) => {
          this.getLogics();
        }
      );
  }


  newLogic() {
    console.log('newLogic');
    this.newlogic_name = '';
    this.newlogic_filename = '';
    this.newlogic_add_enabled = false;
    this.newlogic_display = true;
  }


  checkNewLogicInput() {
    this.newlogic_add_enabled = true;

    if (this.newlogic_name.match(/^\d/)) {
      this.newlogic_add_enabled = false;
      this.wrongNewLogicName = 'LOGICS.INVALID_NAME';
      return;
    }

    for (let i = 0; i < this.logics.length; i++) {
      // console.log({i}, this.logics[i].name);
      if (this.newlogic_name === this.logics[i].name) {
        this.newlogic_add_enabled = false;
        this.wrongNewLogicName = 'LOGICS.NAME_ALREADY_EXISTS';
        return;
      }
    }

    for (let i = 0; i < this.logics.length; i++) {
      // console.log({i}, this.baseName(this.logics[i].pathname, false));
      if (this.newlogic_filename === this.baseName(this.logics[i].pathname, false)) {
        this.newlogic_add_enabled = false;
        this.wrongNewLogicName = 'LOGICS.FILENAME_ALREADY_EXISTS';
        return;
      }
    }

    if (this.newlogic_name === '' || this.newlogic_filename === '') {
      this.newlogic_add_enabled = false;
      this.wrongNewLogicName = '';
      return;
    }

    this.wrongNewLogicName = '';
  }


  createLogic() {
    console.warn('createLogic', this.newlogic_name, this.newlogic_filename);
    this.newlogic_display = false;
    this.dataService.setLogicState(this.newlogic_name, 'create', this.newlogic_filename)
      .subscribe(
        (response) => {
          this.getLogics();
          this.router.navigate(['/logics/edit', this.newlogic_name]);
        }
      );
  }



  deleteLogic(logicName, fileName) {
    // console.log('deleteLogic', {logicName});

    this.logicToDelete = logicName;
    this.delete_param = {'config': logicName, 'filename': fileName};
    this.confirmdelete_display = true;
  }


  deleteLogicConfirm() {
    // console.log('deleteLogicConfirm', this.logicToDelete);
    this.confirmdelete_display = false;

    this.dataService.setLogicState(this.logicToDelete, 'delete')
      .subscribe(
        (response) => {
          this.getLogics();
        }
      );
  }


  deleteLogicAbort() {
    this.confirmdelete_display = false;
    this.logicToDelete = '';
  }
}

