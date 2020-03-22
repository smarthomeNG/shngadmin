
import {PluginMetadata} from './plugin-metadata';
import {PluginItemAttribute} from './plugin-item-attribute';
import {PluginParameter} from './plugin-parameter';

//
// Datatype for <shng-server>:<port>/api/plugins/info
//
export interface PlugininfoType {
  pluginname: string;
  configname: string;
  version: string;
  state: string;
  smartplugin: boolean;
  multiinstance: boolean;
  instancename: string;
  webif_url: string;
  blog_url: string;
  parameters: PluginParameter[];
  arttibutes: PluginItemAttribute[];
  metadata: PluginMetadata;
  stoppable: boolean;
  stopped: boolean;
  triggers: string[];
}

