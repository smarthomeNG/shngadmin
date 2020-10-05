import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import { SystemComponent } from './system/system-overview/system.component';
import { SystemConfigComponent } from './system/system-config/system-config.component';
import { ServicesComponent } from './services/services.component';
import { ItemTreeComponent } from './items/item-tree/item-tree.component';
import { ItemConfigurationComponent } from './items/item-configuration/item-configuration.component';
import { ItemConfiguration2Component } from './items/item-configuration2/item-configuration2.component';
import { StructsComponent } from './items/structs/structs.component';
import { StructConfigurationComponent } from './items/struct-configuration/struct-configuration.component';
import { LogicsListComponent } from './logics/logics-list/logics-list.component';
import { SchedulersComponent } from './schedulers/schedulers/schedulers.component';
import { PluginsComponent } from './plugins/plugin-list/plugins.component';
import { PluginConfigComponent } from './plugins/config/plugin-config.component';
import { ScenesComponent } from './scenes/scene-list/scenes.component';
import { ThreadsComponent } from './schedulers/threads/threads.component';
import { LogDisplayComponent } from './logs/log-display/log-display.component';
import { LoggerListComponent } from './logs/logger-list/logger-list.component';
import { LoggingConfigurationComponent } from './logs/logging-configuration/logging-configuration.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoginComponent } from './login/login.component';
import { AuthGuardService } from './common/services/auth-guard.service';
import {SceneConfigurationComponent} from './scenes/scene-configuration/scene-configuration.component';
import {LogicsEditComponent} from './logics/logics-edit/logics-edit.component';


const appRoutes: Routes = [
//  { path: '', redirectTo: '/system', pathMatch: 'full'},
  { path: '', component: SystemComponent, pathMatch: 'full', canActivate: [AuthGuardService] },
  { path: 'system', component: SystemComponent, canActivate: [AuthGuardService] },
  { path: 'system/systemproperties', component: SystemComponent, canActivate: [AuthGuardService] },
  { path: 'system/config', component: SystemConfigComponent, canActivate: [AuthGuardService] },
  { path: 'services', component: ServicesComponent, canActivate: [AuthGuardService] },

  { path: 'item_tree', component: ItemTreeComponent, canActivate: [AuthGuardService] },
  { path: 'items/config', component: ItemConfigurationComponent, canActivate: [AuthGuardService] },
  { path: 'items/config2', component: ItemConfiguration2Component, canActivate: [AuthGuardService] },
  { path: 'items/structs', component: StructsComponent, canActivate: [AuthGuardService] },
  { path: 'items/struct_config', component: StructConfigurationComponent, canActivate: [AuthGuardService] },
  { path: 'items', component: ItemTreeComponent, canActivate: [AuthGuardService] },
  { path: 'logics/edit/:logicname', component: LogicsEditComponent, canActivate: [AuthGuardService] },
  { path: 'logics', component: LogicsListComponent, canActivate: [AuthGuardService] },
  { path: 'schedulers', component: SchedulersComponent, canActivate: [AuthGuardService] },

  { path: 'plugins/config', component: PluginConfigComponent, canActivate: [AuthGuardService] },
  { path: 'plugins', component: PluginsComponent, canActivate: [AuthGuardService] },
  { path: 'plugins_list', component: PluginsComponent, canActivate: [AuthGuardService] },

  { path: 'scenes/list', component: ScenesComponent, canActivate: [AuthGuardService] },
  { path: 'scenes/config', component: SceneConfigurationComponent, canActivate: [AuthGuardService] },
  { path: 'scenes', component: ScenesComponent, canActivate: [AuthGuardService] },

  { path: 'threads', component: ThreadsComponent, canActivate: [AuthGuardService] },

  { path: 'logs/logger-list', component: LoggerListComponent, canActivate: [AuthGuardService] },
  { path: 'logs/logging-configuration', component: LoggingConfigurationComponent, canActivate: [AuthGuardService] },
  { path: 'logs/display/:logname', component: LogDisplayComponent, canActivate: [AuthGuardService] },
  { path: 'logs/display', component: LogDisplayComponent, canActivate: [AuthGuardService] },
  { path: 'logs', component: LogDisplayComponent, canActivate: [AuthGuardService] },
  { path: 'login', component: LoginComponent },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { onSameUrlNavigation: 'reload', relativeLinkResolution: "legacy" })],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
