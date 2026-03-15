import { Component, OnInit, Input, ViewChild, AfterViewInit, HostBinding, ChangeDetectorRef, QueryList, OnDestroy, ElementRef } from '@angular/core';
import { SubwayMap } from '../../../d3/models/subway-map';
import { D3Service } from '../../../d3/d3.service';
import { Node } from '../../../d3/models/node';
import { Commit } from '../../../prototypes/commit';
import { NodeVisualComponent } from '../../shared/node-visual/node-visual.component';
import { Subscription } from 'rxjs/Subscription';

@Component({
  standalone: false,
  selector: 'app-subway-map-visual',
  templateUrl: './subway-map-visual.component.html',
  styleUrls: ['./subway-map-visual.component.scss']
})
export class SubwayMapVisualComponent implements OnInit, AfterViewInit, OnDestroy {


  @Input('commits') set commits(cmts: Commit[]) {
    let that = this;
    if (!that._commits) {
      that._commits = cmts;
      that.graph = that.d3Service.getSubwayMap(that._commits);
      that.d3Service.getCIStatus();
      that._updateWidth();
      // Only init graph if svg is available
      if (this.svg) {
        this.graph.initGraph(this.svg);
      }
      that.cdr.detectChanges();
    } else {
      setTimeout(() => {
        that.d3Service.updateCommits(cmts);
        that._commits = cmts;
        that._updateHeight();
        that._updateWidth();
        // Only init graph if svg is available
        if (that.svg) {
          that.graph.initGraph(that.svg);
        }
        that.cdr.detectChanges();
      });
    }
  }
  @ViewChild('svg') svg!: ElementRef;
  @ViewChild('nodeVisual') nodeVisuals!: QueryList<NodeVisualComponent>;
  @HostBinding('style.height.px') height!: number;
  @HostBinding('style.width.px') width = 500;
  private _commits!: Commit[];
  private subs: Subscription;
  graph!: SubwayMap;

  constructor(
    private d3Service: D3Service,
    private cdr: ChangeDetectorRef,
  ) {
    this.subs = this.d3Service.mapChange.subscribe(() => {
      if (this.graph) {
        this.cdr.detectChanges();
      }
    });
  }

  ngOnInit() {
    // this._updateHeight();
  }
  ngAfterViewInit(): void {
    // Initialize graph if it exists and hasn't been initialized yet
    if (this.graph && this.svg && !this.graph.initialized) {
      this.graph.initGraph(this.svg);
    }
    this.cdr.detach();
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  private _updateHeight() {
    if (this._commits) {
      this.height = Math.max(this._commits.length * Node.height + 10, 55);
    }
  }
  private _updateWidth() {
    if (this.graph) {
      this.width = Math.min(Math.max(this.graph.width * 50 + 20 + 3, 55), 600);
    }
  }
}
