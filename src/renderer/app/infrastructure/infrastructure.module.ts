import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingScreenComponent } from './loading-screen/loading-screen.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { LoadingService } from './loading-service.service';
import { ElectronService } from './electron.service';
import { IcheckComponent } from './icheck/icheck.component';
import { PromptInjectorService } from './prompt-injector.service';
import { StatusBarService } from './status-bar.service';
import { UpdaterService } from './updater.service';
import { ReleaseNoteComponent } from './release-note/release-note.component';
import { AboutPageComponent } from './about-page/about-page.component';
import { CacheService } from './cache.service';
import { TauriBridgeService } from './tauri-bridge.service';
import { DESKTOP_ADAPTER, DesktopAdapter } from './desktop-adapter';
import { ElectronAdapter } from './electron-adapter';
import { TauriAdapter } from './tauri-adapter';

/**
 * Factory that selects the correct DesktopAdapter at runtime.
 * Tauri injects `window.__TAURI__`; if absent, fall back to Electron.
 */
function desktopAdapterFactory(): DesktopAdapter {
  const isTauri =
    typeof window !== 'undefined' &&
    !!(window as unknown as { __TAURI__?: unknown }).__TAURI__;
  return isTauri ? new TauriAdapter() : new ElectronAdapter();
}

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [LoadingScreenComponent, SpinnerComponent, IcheckComponent],
  declarations: [LoadingScreenComponent, SpinnerComponent, IcheckComponent, ReleaseNoteComponent, AboutPageComponent],
  providers: [
    LoadingService,
    ElectronService,
    PromptInjectorService,
    StatusBarService,
    UpdaterService,
    CacheService,
    TauriBridgeService,
    { provide: DESKTOP_ADAPTER, useFactory: desktopAdapterFactory },
  ]
})
export class InfrastructureModule { }
