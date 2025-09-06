import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, COMPILER_OPTIONS, CompilerFactory, Compiler } from '@angular/core';
import { JitCompilerFactory } from '@angular/platform-browser-dynamic';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { ToastrModule } from 'ngx-toastr';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Routes, RouterModule } from '@angular/router';
import { GitViewComponent } from './core/git-view/git-view.component';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { SettingsModule } from './settings/settings.module';
import { SettingsPageComponent } from './settings/settings-page/settings-page.component';
import { CiSettingsComponent } from './settings/ci-settings/ci-settings.component';
import { AuthSettingsComponent } from './settings/auth-settings/auth-settings.component';
import { GeneralSettingsComponent } from './settings/general-settings/general-settings.component';
import { JiraSettingsComponent } from './settings/jira-settings/jira-settings.component';
// import { TagInputModule } from 'ngx-chips'; // Removed for compatibility
import { ContextMenuModule } from '@perfectmemory/ngx-contextmenu';
import { ExternalFileViewerComponent } from './core/external-file-viewer/external-file-viewer.component';
// import { HotkeyModule } from 'angular2-hotkeys'; // Temporarily disabled - incompatible with Angular 20
import { ReleaseNoteComponent } from './infrastructure/release-note/release-note.component';
import { AboutPageComponent } from './infrastructure/about-page/about-page.component';
import { JIRAIssueGuard } from './jira/services/jira-issue-link-guard';
import { HotkeysHelpComponent } from '@ngneat/hotkeys';

const appRoutes: Routes = [
  {
    path: 'settings', component: SettingsPageComponent,
    children: [
      {
        path: 'ci', component: CiSettingsComponent
      },
      {
        path: 'auth', component: AuthSettingsComponent
      },
      {
        path: 'general', component: GeneralSettingsComponent
      },
      {
        path: 'jira', component: JiraSettingsComponent
      }
    ]
  },
  { path: 'git', component: GitViewComponent },
  {
    path: 'file/:sha', component: ExternalFileViewerComponent
  },
  {
    path: 'jira-issue/:key/:previousKey', canActivate: [JIRAIssueGuard], component: GitViewComponent
  },
  { path: 'release-note', component: ReleaseNoteComponent },
  { path: 'about', component: AboutPageComponent },
  { path: '', redirectTo: 'git', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    // TagInputModule, // Removed for compatibility
    BrowserModule,
    BrowserAnimationsModule,
    NgbModule,
    ContextMenuModule,
    HotkeysHelpComponent,
    ToastrModule.forRoot({
      positionClass: 'toast-top-right',
      timeOut: 10000,
      preventDuplicates: true,
      enableHtml: true
    }),
    // HotkeyModule.forRoot({
    //   cheatSheetHotkey: '?',
    // }), // Temporarily disabled - incompatible with Angular 20
    InfrastructureModule,
    CoreModule,
    SettingsModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true, useHash: true } // <-- debugging purposes only
    ),
  ],
  providers: [
    { provide: COMPILER_OPTIONS, useValue: {}, multi: true },
    { provide: CompilerFactory, useClass: JitCompilerFactory, deps: [COMPILER_OPTIONS] },
    { provide: Compiler, useFactory: createCompiler, deps: [CompilerFactory] }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function createCompiler(compilerFactory: CompilerFactory) {
  return compilerFactory.createCompiler();
}
