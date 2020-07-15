
import {Component, OnInit, DoCheck, SimpleChanges} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {AppComponent} from '../app.component';
import {ServerApiService} from '../common/services/server-api.service';
import {Router} from '@angular/router';
import {AuthService} from '../common/services/auth.service';
import {HttpClient} from '@angular/common/http';
import {SharedService} from '../common/services/shared.service';

interface MenuEntry {
  label: string;
  routerLink?: string[];
}
interface MenuItem {
  label: string;
  routerLink?: string[];
  visible: boolean;
  items: MenuEntry[];
}
@Component({
  selector: 'app-top-navigation',
  templateUrl: './top-navigation.component.html',
  styleUrls: ['./top-navigation.component.css']
})


export class TopNavigationComponent implements OnInit {

  labels: string[] = [];
  menu: MenuItem[] = [];
  loggedIn = false;

  developerMode = false;
  lastLanguage = '-';



  constructor(private appComponent: AppComponent,
              private translate: TranslateService,
              public  shared: SharedService,
              private dataServiceServer: ServerApiService,
              protected router: Router,
              public authService: AuthService) {

    console.log('TopNavigationComponent - constructor()');
  }

  ngDoCheck() {
    if (!(this.lastLanguage === sessionStorage.getItem('default_language'))) {
      this.buildMenu();
      this.lastLanguage = sessionStorage.getItem('default_language');
    }
    this.loggedIn = this.authService.isLoggedIn();
  }

  ngOnInit() {
    console.log('TopNavigationComponent - ngOnInit()');

    this.dataServiceServer.getServerinfo()
      .subscribe(
        (response) => {
          this.developerMode = (sessionStorage.getItem('developer_mode') === 'true');
          console.log('TopNavigationComponent.ngOnInit: getLangs()', this.translate.getLangs());
          console.log('TopNavigationComponent.ngOnInit: getDefaultLang()', this.translate.getDefaultLang());
          this.translate.use(sessionStorage.getItem('default_language'));
          this.translate.setDefaultLang(sessionStorage.getItem('default_language'));
          // this.lastLanguage = sessionStorage.getItem('default_language');

          this.translate.use('de');
          this.translate.setDefaultLang('de');
          this.shared.setGuiLanguage();
          console.log('TopNavigationComponent.ngOnInit: getDefaultLang()', this.translate.getDefaultLang());

          this.buildMenu();

          const credentials = {'username': '', 'password': ''};
          // console.log('signIn', {credentials});
          this.authService.login(credentials)
            .subscribe((result: boolean) => {
              // console.log('Anonymous login:', {result});

              this.buildMenu();
            });

        }
      );

  }

  toggleResponsiveMenu() {
    console.log('toggleResponsiveMenu');
    const x = document.getElementById('myTopnav');
    if (x.className === 'topnav') {
      x.className += ' responsive';
    } else {
      x.className = 'topnav';
    }
  }

  enableDropdownMenu() {

    const x = document.getElementsByClassName('dropdown-content-hidden');
    for (let i = 0; i < x.length; i++) {
      x[i].className = 'dropdown-content';
    }
  }

  disableResponsiveMenu(menuEntry, hideDropdown= true) {

    // disable dropped down menu if in mobile mode
    const m = document.getElementById('myTopnav');
    m.className = 'topnav';

    // hide dromdown after clicking on it (for menu in desktop mode)
    if (hideDropdown) {
      const x = document.getElementById('menu-' + menuEntry.label);
      x.className = 'dropdown-content-hidden';
    }
  }

  setMenuEntry(menu, label, routerLink = [], visible = true) {
    while (this.menu.length < menu + 1) {
      this.menu.push({label: 'dummy', visible: visible, items: []});
    }
    this.menu[menu].label = label;
    this.menu[menu].routerLink = routerLink;
    this.menu[menu].visible = visible;
  }

  setSubmenuEntry(menu, submenu, label, routerLink) {
    while (this.menu[menu].items.length < submenu + 1) {
      this.menu[menu].items.push({label: 'dummy'});
    }
    this.menu[menu].items[submenu].label = label;
    this.menu[menu].items[submenu].routerLink = routerLink;
  }

  buildMenu() {

    console.log('TopNavigationComponent.buildMenu: default_language', sessionStorage.getItem('default_language'));

    this.setMenuEntry(0, this.translate.instant('MENU.SYSTEM'));
    this.setSubmenuEntry(0, 0, this.translate.instant('MENU.SYSTEM_PROPERTIES'), ['/system/systemproperties']);
    this.setSubmenuEntry(0, 1, this.translate.instant('MENU.CONFIGURATION'), ['/system/config']);

    this.setMenuEntry(1, this.translate.instant('MENU.SERVICES'), ['/services']);

    this.setMenuEntry(2, this.translate.instant('MENU.ITEMS'));
    this.setSubmenuEntry(2, 0, this.translate.instant('MENU.ITEM_TREE'), ['/item_tree']);
    this.setSubmenuEntry(2, 1, this.translate.instant('MENU.ITEM_CONFIGURATION'), ['/items/config']);
    if (this.developerMode === true) {
      this.setSubmenuEntry(2, 2, this.translate.instant('MENU.ITEM_CONFIGURATION') + ' (dev)', ['/items/config2']);
      this.setSubmenuEntry(2, 3, this.translate.instant('MENU.ITEM_STRUCTS'), ['/items/structs']);
      this.setSubmenuEntry(2, 4, this.translate.instant('MENU.ITEM_STRUCT_CONFIGURATION'), ['/items/struct_config']);
    } else {
      this.setSubmenuEntry(2, 2, this.translate.instant('MENU.ITEM_STRUCTS'), ['/items/structs']);
      this.setSubmenuEntry(2, 3, this.translate.instant('MENU.ITEM_STRUCT_CONFIGURATION'), ['/items/struct_config']);
    }

    this.setMenuEntry(3, this.translate.instant('MENU.LOGICS'), ['/logics']);

    this.setMenuEntry(4, this.translate.instant('MENU.PLUGINS'));
    this.setSubmenuEntry(4, 0, this.translate.instant('MENU.PLUGINS_LIST'), ['/plugins_list']);
    this.setSubmenuEntry(4, 1, this.translate.instant('MENU.CONFIGURATION'), ['/plugins/config']);

    this.setMenuEntry(5, this.translate.instant('MENU.SCENES'));
    this.setSubmenuEntry(5, 0, this.translate.instant('MENU.SCENE_LIST'), ['/scenes/list']);
    this.setSubmenuEntry(5, 1, this.translate.instant('MENU.SCENE_CONFIGURATION'), ['/scenes/config']);

    this.setMenuEntry(6, this.translate.instant('MENU.SCHEDULERS'));
    this.setSubmenuEntry(6, 0, this.translate.instant('MENU.SCHEDULERS'), ['/schedulers']);
    this.setSubmenuEntry(6, 1, this.translate.instant('MENU.THREADS'), ['/threads']);

    this.setMenuEntry(7, this.translate.instant('MENU.LOGS'));
    this.setSubmenuEntry(7, 0, this.translate.instant('MENU.LOGS_DISPLAY'), ['/logs/display']);
    this.setSubmenuEntry(7, 1, this.translate.instant('MENU.LOGGER_LIST'), ['/logs/logger-list']);
    this.setSubmenuEntry(7, 2, this.translate.instant('MENU.CONFIGURATION'), ['/logs/logging-configuration']);
  }

  logout() {
    if (this.authService.isLoggedIn() && this.authService.loginRequired()) {
      this.router.navigate(['/login']);
      this.authService.logout();
    }
  }
}
