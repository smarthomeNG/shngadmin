import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PrimeTemplate, SelectItem } from 'primeng/api';
import { Bind } from 'primeng/bind';
import { ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Listbox } from 'primeng/listbox';
import { PickList } from 'primeng/picklist';
import { LogicsGroupType, LogicsinfoType } from '../../common/models/logics-info';
import { LogService } from '../../common/services/log.service';
import { LogicsApiService } from '../../common/services/logics-api.service';
import { ServerApiService } from '../../common/services/server-api.service';

@Component({
  selector: 'app-logics-groups',
  templateUrl: './logics-groups.component.html',
  styleUrls: ['./logics-groups.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Bind,
    ButtonDirective,
    Listbox,
    PickList,
    FormsModule,
    InputText,
    Dialog,
    PrimeTemplate,
    TranslatePipe,
  ],
})
export class LogicsGroupsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);
  private dataServiceServer = inject(ServerApiService);
  private dataService = inject(LogicsApiService);
  private titleService = inject(Title);
  private readonly log = inject(LogService);

  @ViewChild('groupDesc') private groupDescEl!: ElementRef<HTMLElement>;

  // Group list / selection
  logicGroups!: Record<string, LogicsGroupType>;
  groupList!: string[];
  group!: LogicsGroupType;
  menuGroupList!: SelectItem[];
  selectedGroup!: SelectItem;
  myEditGroup = '';

  // Unknown groups: referenced in logic.yaml but not defined in logic_groups.yaml
  unknownGroups: Record<string, string[]> = {}; // {groupname: [logicname, ...]}

  // Member pick-list
  allLogics: LogicsinfoType[] = [];
  membersAvailable: LogicsinfoType[] = [];
  membersInGroup: LogicsinfoType[] = [];
  private membersOrig: string[] = [];

  // Change tracking
  groupTitleOrig = '';
  groupDescriptionOrig = '';
  groupChanged = false;

  // Dialog state
  error_display = false;
  myTextOutput = '';
  newgroup_display = false;
  newGroupname = '';
  add_enabled = false;
  confirmdelete_display = false;
  delete_param!: {};

  ngOnInit() {
    this.group = { title: '', description: '' };

    // Load groups and all logics in parallel; we need both before the
    // pick-list can be populated.
    this.dataService
      .getLogics()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        const data = response as {
          logics: LogicsinfoType[];
          logics_new: LogicsinfoType[];
          groups: Record<string, LogicsGroupType>;
        };

        // Merge loaded + unloaded logics, sorted by name
        this.allLogics = [...(data.logics ?? []), ...(data.logics_new ?? [])].sort((a, b) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
        );

        this.logicGroups = data.groups ?? {};
        this.unknownGroups =
          ((data as Record<string, unknown>)['unknown_groups'] as Record<string, string[]>) ?? {};
        this._rebuildGroupMenu();
        this.myEditGroup = '';
        this.cdr.markForCheck();
      });
  }

  // ------------------------------------------------------------------
  //  Helpers
  // ------------------------------------------------------------------

  private _rebuildGroupMenu() {
    this.groupList = Object.keys(this.logicGroups).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase()),
    );
    this.menuGroupList = this.groupList.map((g) => ({ label: g, value: g }) as SelectItem);
  }

  /** Split allLogics into "in group" / "available" for the pick-list. */
  private _splitByGroup(groupname: string) {
    this.membersInGroup = [];
    this.membersAvailable = [];
    for (const logic of this.allLogics) {
      const groups = Array.isArray(logic.group) ? logic.group : logic.group ? [logic.group] : [];
      if (groups.includes(groupname)) {
        this.membersInGroup.push(logic);
      } else {
        this.membersAvailable.push(logic);
      }
    }
    this.membersOrig = this.membersInGroup.map((l) => l.name);
  }

  private _hasMembersChanged(): boolean {
    const current = this.membersInGroup.map((l) => l.name).sort();
    const orig = [...this.membersOrig].sort();
    return current.length !== orig.length || current.some((name, i) => name !== orig[i]);
  }

  hasGroupChanged(): boolean {
    const desc = this.groupDescEl?.nativeElement?.textContent?.trim() ?? '';
    return (
      this.groupTitleOrig !== this.group['title'] ||
      this.groupDescriptionOrig !== desc ||
      this._hasMembersChanged()
    );
  }

  onPickListChange() {
    this.groupChanged = this.hasGroupChanged();
    this.cdr.markForCheck();
  }

  // ------------------------------------------------------------------
  //  Group selection
  // ------------------------------------------------------------------

  groupSelected() {
    const group = this.selectedGroup.value as string;
    if (!group) {
      this.myEditGroup = '';
      this.group = { title: '', description: '' };
      this._setDescEl('');
      this.membersAvailable = [...this.allLogics];
      this.membersInGroup = [];
      this.membersOrig = [];
    } else {
      this.myEditGroup = group;
      this.group = this.logicGroups[group];
      if (this.group.description === undefined) this.group.description = '';
      this._setDescEl(this.group.description);
      this.groupTitleOrig = this.group.title;
      this.groupDescriptionOrig = this.group.description;
      this._splitByGroup(group);
    }
    this.groupChanged = false;
    this.cdr.markForCheck();
  }

  private _setDescEl(text: string) {
    const el = this.groupDescEl?.nativeElement;
    if (el) el.textContent = text;
  }

  // ------------------------------------------------------------------
  //  Save / discard
  // ------------------------------------------------------------------

  saveGroup() {
    const desc = this.groupDescEl?.nativeElement?.textContent?.trim() ?? '';
    this.group['description'] = desc;

    const members = this.membersInGroup.map((l) => l.name);
    const payload = { ...this.group, members };

    this.dataService
      .saveLogicGroup(this.myEditGroup, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.groupTitleOrig = this.group['title'];
        this.groupDescriptionOrig = this.group['description'];
        this.membersOrig = [...members];
        this.logicGroups[this.myEditGroup] = this.group;
        this._setDescEl(this.group.description);
        this.groupChanged = false;
        this.cdr.markForCheck();
      });
  }

  discardChanges() {
    this.group.title = this.groupTitleOrig;
    this.group.description = this.groupDescriptionOrig;
    this._setDescEl(this.group.description);
    this._splitByGroup(this.myEditGroup); // restore pick-list
    this.groupChanged = false;
    this.cdr.markForCheck();
  }

  // ------------------------------------------------------------------
  //  Unknown group resolution
  // ------------------------------------------------------------------

  unknownGroupNames(): string[] {
    return Object.keys(this.unknownGroups);
  }

  createUnknownGroup(groupname: string) {
    const newGroup: LogicsGroupType = { title: '', description: '' };
    this.dataService
      .saveLogicGroup(groupname, { ...newGroup, members: [] })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.logicGroups[groupname] = newGroup;
        delete this.unknownGroups[groupname];
        this._rebuildGroupMenu();
        this.cdr.markForCheck();
      });
  }

  // ------------------------------------------------------------------
  //  Create / delete group
  // ------------------------------------------------------------------

  newGroup() {
    this.newGroupname = '';
    this.add_enabled = false;
    this.newgroup_display = true;
  }

  checkInput() {
    this.add_enabled =
      this.newGroupname.length > 0 &&
      !this.groupList.some((g) => g.toLowerCase() === this.newGroupname.toLowerCase());
  }

  addGroup() {
    this.newgroup_display = false;
    this.myEditGroup = this.newGroupname;
    const newGroup: LogicsGroupType = { title: '', description: '' };

    this.dataService
      .saveLogicGroup(this.myEditGroup, { ...newGroup, members: [] })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.logicGroups[this.myEditGroup] = newGroup;
        this.group = newGroup;
        this._setDescEl('');
        this.groupTitleOrig = '';
        this.groupDescriptionOrig = '';
        this.membersInGroup = [];
        this.membersAvailable = [...this.allLogics];
        this.membersOrig = [];
        this.groupChanged = false;
        this._rebuildGroupMenu();
        this.selectedGroup = { label: this.myEditGroup, value: this.myEditGroup };
        this.cdr.markForCheck();
      });
  }

  newGroupAbort() {
    this.newGroupname = '';
    this.add_enabled = false;
    this.newgroup_display = false;
    this._setDescEl(this.group.description);
    this.selectedGroup = { label: this.myEditGroup, value: this.myEditGroup };
  }

  deleteGroup() {
    this.delete_param = { config: this.myEditGroup };
    this.confirmdelete_display = true;
  }

  DeleteGroupConfirm() {
    this.confirmdelete_display = false;

    this.dataService
      .deleteLogicGroup(this.myEditGroup)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        delete this.logicGroups[this.myEditGroup];
        this._rebuildGroupMenu();
        this.myEditGroup = '';
        this.group = { title: '', description: '' };
        this._setDescEl('');
        this.membersAvailable = [...this.allLogics];
        this.membersInGroup = [];
        this.membersOrig = [];
        this.groupChanged = false;
        this.cdr.markForCheck();
      });
  }
}
