import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Shared grid layout for file-editor pages (item config, struct config,
 * scene config, function config).  Callers project content into five named
 * slots via the `slot` attribute on <ng-container>:
 *
 *   slot="buttons-left"   — left side of the toolbar row
 *   slot="buttons-right"  — right side of the toolbar row
 *   slot="filelist"       — file list column (left)
 *   slot="editor"         — editor column (right)
 *
 * Pass [title] to show the blue page-header bar above the toolbar.
 * Omit it (function-config) to suppress the header row entirely.
 */
@Component({
  selector: 'app-file-editor-layout',
  standalone: true,
  templateUrl: './file-editor-layout.component.html',
  styleUrl: './file-editor-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileEditorLayoutComponent {
  @Input() title?: string;
}
