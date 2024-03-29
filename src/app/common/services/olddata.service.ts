
import {APP_BASE_HREF} from '@angular/common';
import {Inject, Injectable, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ItemDetails} from '../models/item-details';
import {TranslateService} from '@ngx-translate/core';
import {SystemInfo} from '../models/system-info';
import {ServerInfo} from '../models/server-info';
import {parse} from 'url';

let url_start = 'http://';
let host_ip = '';
// let shng_serverinfo: ServerInfo = <ServerInfo>{'itemtree_fullpath': true};


@Injectable({
  providedIn: 'root'
})

export class OlddataService implements OnInit {

  baseUrl: string;
  shng_serverinfo: ServerInfo = <ServerInfo>{'itemtree_fullpath': true};

  href = '';

  constructor(private http: HttpClient, private translate: TranslateService, @Inject('BASE_URL') baseUrl: string) {


    console.log('OlddataService.constructor:');

    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');

    // console.log(baseUrl);
    this.baseUrl = baseUrl;
    if (host_ip === '') {
      host_ip = location.host;
      if (host_ip === 'localhost:4200') {
        url_start = baseUrl + '/assets/testdata/';
      } else {
        url_start = baseUrl;
      }
      // console.log({host_ip});

    }

  }


  ngOnInit() {
//    console.log('OlddataService.ngOnInit:');
  }


  getconfigDefaultLanguage() {
//    console.log('getconfigDefaultLanguage: default_language=' + shng_serverinfo.default_language);
    if (this.shng_serverinfo.default_language === undefined) {
      console.warn('getconfigDefaultLanguage: is undefined! (en used)');
      return 'en';
    }
    const result = sessionStorage.getItem('default_language');
    if (result !== undefined) {
      return result;
    }
    return this.shng_serverinfo.default_language;
  }


  getconfig(key) {
    if (this.shng_serverinfo[key] === undefined) {
      console.log('getconfig: key ' + key + ' is undefined!');
    }
    return this.shng_serverinfo[key];
  }




  getSysteminfo() {
    const url = url_start + 'systeminfo.json\\';
    // console.log('getSysteminfo: url: ' + url);
    return this.http.get(url);
  }


  getPypiinfo() {
    const url = url_start + 'pypi.json\\';
    // console.log('getPypiinfo: url: ' + url);
    return this.http.get(url);
  }

  // --------------------------------------------------------------------------

  getItemtree() {
    const url = url_start + 'items.json\\';
    // console.log('getItemtree: url: ' + url);
    return this.http.get(url);
  }


  getItemDetails(itempath) {
//    const url = this.url_start + 'item_detail_json.html?item_path=';
//    const url = 'http://10.0.0.174:1234/admin/item_detail_json.html?item_path=beoremote';

    const url = url_start + 'item_detail_json.html?item_path=' + itempath;
    console.log('getItemDetails: url: ' + url);
    console.log('getItemDetails: itempath: ' + itempath);
    if (host_ip === 'localhost:4200') {
      if (itempath === 'beoremote.beo4command' || itempath === 'beoremote.beo4commandnum' ||
          itempath === 'test.string' || itempath === 'test.number') {
      } else {
        console.log('getItemDetails: url: <' + itempath + '>');
        return itempath;
      }
    }
    return this.http.get(url);

  }


  // --------------------------------
  //  Change value of specified item
  //
  changeItemValue(itempath, value) {
    const url = url_start + 'item_change_value.html?item_path=' + itempath + '&value=' + encodeURIComponent(value);
    console.log('changeItemValue: url: ' + url);
    if (host_ip === 'localhost:4200') {
      alert('changeItemValue ' + itempath + ': Value not set, because running on localhost');
    } else {
      this.http.get(url)
        .subscribe(
          (response: ItemDetails[]) => {
            console.log('updateValue:');
            console.log({response});
          },
          (error) => {
            console.log('ERROR: dataService.updateValue():');
            console.log(error);
          }
        );
    }
  }


/*
  // -----------------------------------------------------------
  //  Update config of one plugin in etc/plugin.yaml on backend
  //
  setPluginConfig(pluginsection, config) {
    const configstr = JSON.stringify(config);
    const url = url_start + 'plugin_set_config.html?plugin_section=' + pluginsection + '&config=' + configstr;
    console.warn('setPluginConfig: url: ' + url);
    if (host_ip === 'localhost:4200') {
      alert('setPluginConfig ' + pluginsection + ': Nothing saved, because running on localhost');
    } else {
      this.http.get(url)
        .subscribe(
          (response: any[]) => {
            console.log('updateConfig:');
            console.log({response});
          },
          (error) => {
            console.log('ERROR: dataService.setPluginConfig():');
            console.log(error);
          }
        );
    }
  }
*/

}


