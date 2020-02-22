
import {Component, OnInit, ViewChild, TemplateRef} from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { TranslateService } from '@ngx-translate/core';

import { faSearch, faCircleNotch, faFolder, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { faSync, faList, faStop, faTrashAlt, faThumbtack } from '@fortawesome/free-solid-svg-icons';
// import { faCoffee } from '@fortawesome/free-solid-svg-icons';

import * as $ from 'jquery';
import { TreeNode } from 'primeng/api';

import { cloneDeep } from 'lodash';

import { AppComponent } from '../../app.component';
import { OlddataService } from '../../common/services/olddata.service';
import { ItemTree } from '../../common/models/item-tree';
import { SharedService } from '../../common/services/shared.service';
import {ItemDetails} from '../../common/models/item-details';
// import {ServerInfo} from '../../common/models/server-info';
import {ServerApiService} from '../../common/services/server-api.service';


@Component({
  selector: 'app-items',
  templateUrl: 'item-tree.component.html',
  styleUrls: ['item-tree.component.css'],
  providers: [AppComponent]
})
export class ItemTreeComponent implements OnInit {

  faSearch = faSearch;
  faCircleNotch = faCircleNotch;
  faFolder = faFolder;
  faFolderOpen = faFolderOpen;
  faSync = faSync;
  faList = faList;
  faStop = faStop;
  faTrashAlt = faTrashAlt;
  faThumbtack = faThumbtack;

  itemcount = 0;
  itemtree: ItemTree;
  itemdetails: ItemDetails = <ItemDetails>{};
  itemdetailsloaded = false;

  monitoredItems: string[] = [];

  filesTree0: {}[];
  filteredTree: {}[];
  searchStart_param = {};
  treeIsFiltered = false;
  selectedFile: TreeNode;

  item_val: any;
  alertText = '';

  Object = Object;
  JSON = JSON;

  selectedNode;


  update_age = '';
  change_age = '';
  previous_update_age = '';
  previous_change_age = '';

  modalRef: BsModalRef;
  constructor(private dataService: OlddataService,
              private dataServiceServer: ServerApiService,
              private appComponent: AppComponent,
              private translate: TranslateService,
              private modalService: BsModalService,
              public shared: SharedService) {
  }


  static resizeItemTree() {
    const browserHeight = window.innerHeight;
//    console.log({browserHeight});
    const tree = $('#tree');
    const treeDetail = $('#tree_detail');

    // const offsetTopDetail = treeDetail.offset().top;
    // initially offsetTop is off by a number of pixels. Correction: a fixed offset
    const offsetTop = 167;
    const offsetTopDetail = 200;
    const height = String(Math.round((-1) * (offsetTop) - 35 + browserHeight) + 'px');
    const heightDetail = String(Math.round((-1) * (offsetTopDetail) - 35 + browserHeight) + 'px');
    tree.css('height', height);
    tree.css('maxHeight', height);
    treeDetail.css('height', heightDetail);
    treeDetail.css('maxHeight', heightDetail);
  }


  static htmlDecode(input) {
    const e = document.createElement('div');
    e.innerHTML = input;
    return e.childNodes.length === 0 ? '' : e.childNodes[0].nodeValue;
  }


  ngOnInit() {
    console.log('ItemTreeComponent.ngOnInit:');

    this.dataServiceServer.getServerinfo()
      .subscribe(
        (response) => {
          this.getItemtree();
        }
      );

    window.addEventListener('resize', ItemTreeComponent.resizeItemTree, false);
    ItemTreeComponent.resizeItemTree();
  }


  closeAlert(myalert, item_oldvalue) {
    this.item_val.value = item_oldvalue;
    myalert.hide();
  }


  getItemtree() {
    this.dataService.getItemtree()
      .subscribe(
        (response: [number, ItemTree]) => {
//          console.log('ItemsComponent: dataService.getItemtree()');
//          console.log(response);
          this.itemcount = response[0];
          this.filesTree0 = <any> response[1];
          this.filterNodes('');
          // this.plugininfo.sort(function (a, b) {return (a.pluginname > b.pluginname) ? 1 : ((b.pluginname > a.pluginname) ? -1 : 0)});
//          this.searchStart_param = {'number': sessionStorage.getItem('itemtree_searchstart')};
          this.searchStart_param = {'number': sessionStorage.getItem('itemtree_searchstart')};
        },
        (error) => {
          console.log('ERROR: ItemsComponent: dataService.getItemtree():');
          console.log(error);
        }
      );
  }


  updateValue(item_path, item_value, item_type, item_oldvalue, dialog) {

    console.log('ItemTreeComponent.updateValue:');

    if (item_type === 'num' || item_type === 'scene') {
      if (isNaN(item_value.value as any)) {
        this.item_val = item_value;
        this.alertText = this.translate.instant('ITEMS.ALERT.NOT NUMERIC');
        dialog.show();
        return;
      }
      if (item_type === 'scene' && (item_value.value < 0 || item_value.value > 63)) {
        this.item_val = item_value;
        this.alertText = this.translate.instant('ITEMS.ALERT.INVALID SCENE NUMBER');
        dialog.show();
        return;
      }
    }
    console.log('--> updateValue: ' + item_value.value);
    this.dataService.changeItemValue(item_path, item_value.value);
  }


/*

      $("#item_value" ).on('blur change', function() {
        $.ajax({
          url: 'item_change_value.html',
          type: 'POST',
          data: {
            'item_path': element.path,
            'value': $("#item_value").val()
          },
          success: function (response) {
            $( ".fa-sync" ).trigger( "click" );
          },
          error: function () {
            //your error code
          }
        });
      });
  */


  monitorItem(path: string, monitorIt: boolean) {
    // console.log('monitorItem: path=' + path + ', monitorIt=' + String(monitorIt));
    if (monitorIt) {
      this.monitoredItems.push(path);
    } else {
      for (let i = this.monitoredItems.length - 1; i >= 0; i--) {
        if (this.monitoredItems[i] === path) {
          this.monitoredItems.splice(i, 1);
          // break;       //<-- Uncomment  if only the first term has to be removed
        }
      }
    }

    // console.log(this.monitoredItems);
  }


  getDetails(path: string) {
    console.log('ItemTreeComponent.getDetails: ' + path);
    if ((path !== undefined)) {
      this.dataService.getItemDetails(path)
        .subscribe(
          (response: ItemDetails[]) => {
            const details = response[0];
            details.eval = ItemTreeComponent.htmlDecode(details.eval);
            details.crontab = ItemTreeComponent.htmlDecode(details.crontab);
            this.showDetails(details);
            },
          (error) => {
            console.log('ERROR: ItemsComponent: dataService.getItemDetails():');
            console.log(error);
          }
          );

    } else {
      this.showDetails();
    }

  }


  showDetails(response?) {
    console.log('showDetails:');
    console.log({response});

    if (response === undefined) {
      this.itemdetails = <ItemDetails>{};
      this.itemdetails.config = {};
      // this.itemdetails.value = item_value.value;

      this.update_age = this.shared.ageToString(0);
      this.change_age = this.shared.ageToString(0);
      this.previous_update_age = this.shared.ageToString(0);
      this.previous_change_age = this.shared.ageToString(0);
    } else {
      this.itemdetails = response;

      this.update_age = this.shared.ageToString(this.itemdetails.update_age);
      this.change_age = this.shared.ageToString(this.itemdetails.change_age);
      this.previous_update_age = this.shared.ageToString(this.itemdetails.previous_update_age);
      this.previous_change_age = this.shared.ageToString(this.itemdetails.previous_change_age);
    }
    this.itemdetailsloaded = true;
  }



/* ----------------------------------------------
  * For PrimeNG Tree:
*/

  filterTree(treeModel, value) {
    if (value.length >= sessionStorage.getItem('itemtree_searchstart')) {
      this.filterNodes(value);
    } else {
      this.filterNodes('');
    }
  }

  filterNodes(value) {
//    console.log('ItemsComponent.filterTree: >' + value + '<')
    value = value.toLowerCase();
    this.filteredTree = cloneDeep(this.filesTree0);
    this.treeIsFiltered = false;
    if (value && value !== '') {
      this.treeIsFiltered = true;
      this.prune(this.filteredTree, value);
      this.expandAll();
    }
  }


  clearFilter(event, filter) {
    filter.value = '';
    this.filterTree(event, filter.value);
    this.itemdetailsloaded = false;
  }

  prune(array, filter) {
    for (let i = array.length - 1; i >= 0; i--) {
      const obj = array[i];
      if (obj.children) {
        if (this.prune(obj.children, filter)) {
          if (obj.children.length === 0) {
            array.splice(i, 1);
          }
          return true;
        }
      }
      if (obj.label.toLowerCase().indexOf(filter) === -1) {
        if (obj.children.length === 0) {
          array.splice(i, 1);
        }
      }
    }
  }


  filterTreeY(event, value) {
//    console.log('ItemsComponent.filterTree: >' + value + '<')
    this.filteredTree = cloneDeep(this.filesTree0);
    if (value && value !== '') {
      this.filteredTree.forEach( node => {
        this.filterRecursive(node, value, 0);
      } );

    }
  }

  private filterRecursive(node: TreeNode, filter: string, index: number) {
    if (node.children) {
      node.children.forEach((childNode, index2) => {
        this.filterRecursive(childNode, filter, index2);
        if (!childNode) {
          console.log({index});
        }
      });
    }
    if (node.label.indexOf(filter) === -1) {
      console.log('filtered node: ' + node.label + ', index: ' + index  + ', children: ' + node.children);
//      node.label = '( ' + node.label + ' )';
      node.label = '';
    } else {
      console.log('active node: ' + node.label + ', index: ' + index  + ', children: ' + node.children);

    }
  }


  nodeSelect(event) {
    console.log('Node Selected: ' + event.node.label);
    this.itemdetailsloaded = false;
    this.getDetails(event.node.path);

    }

  expandAll() {
    this.filteredTree.forEach( node => {
      this.expandRecursive(node, true);
    } );
  }

  collapseAll() {
    this.filteredTree.forEach( node => {
      this.expandRecursive(node, false);
    } );
  }

  private expandRecursive(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach( childNode => {
        this.expandRecursive(childNode, isExpand);
      } );
    }
  }

}



function fuzzysearch (needle: string, haystack: string) {
  const haystackLC = haystack.toLowerCase();
  const needleLC = needle.toLowerCase();

  const hlen = haystack.length;
  const nlen = needleLC.length;

  if (nlen > hlen) {
    return false;
  }
  if (nlen === hlen) {
    return needleLC === haystackLC;
  }
  outer: for (let i = 0, j = 0; i < nlen; i++) {
    const nch = needleLC.charCodeAt(i);

    while (j < hlen) {
      if (haystackLC.charCodeAt(j++) === nch) {
        continue outer;
      }
    }
    return false;
  }
  return true;
}

