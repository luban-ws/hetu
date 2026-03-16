import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingScreenComponent } from './loading-screen/loading-screen.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { LoadingService } from './loading-service.service';
import { IcheckComponent } from './icheck/icheck.component';
import { PromptInjectorService } from './prompt-injector.service';
import { StatusBarService } from './status-bar.service';
import { UpdaterService } from './updater.service';
import { ReleaseNoteComponent } from './release-note/release-note.component';
import { AboutPageComponent } from './about-page/about-page.component';
import { CacheService } from './cache.service';
import { TauriBridgeService } from './tauri-bridge.service';
import { DESKTOP_ADAPTER } from './desktop-adapter';
import { TauriAdapter } from './tauri-adapter';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [LoadingScreenComponent, SpinnerComponent, IcheckComponent],
  declarations: [LoadingScreenComponent, SpinnerComponent, IcheckComponent, ReleaseNoteComponent, AboutPageComponent],
  providers: [
    LoadingService,
    PromptInjectorService,
    StatusBarService,
    UpdaterService,
    CacheService,
    TauriBridgeService,
    { provide: DESKTOP_ADAPTER, useFactory: () => new TauriAdapter() },
  ]
})
export class InfrastructureModule { }
