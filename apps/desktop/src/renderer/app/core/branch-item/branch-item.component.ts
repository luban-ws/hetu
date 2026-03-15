import { Component, OnInit, Input, HostBinding, ViewChild } from '@angular/core';
import { D3Service } from '../d3/d3.service';
import { ContextMenuService, ContextMenuComponent } from '@perfectmemory/ngx-contextmenu';
import { CommitSelectionService } from '../services/commit-selection.service';
import { SubmodulesService } from '../services/submodules.service';
import { RepoService } from '../services/repo.service';

@Component({
  standalone: false,
  selector: 'app-branch-item',
  templateUrl: './branch-item.component.html',
  styleUrls: ['./branch-item.component.scss']
})
export class BranchItemComponent implements OnInit {

  @Input() item;
  @Input()
  set collapse(cp: boolean) {
    this.toggled = !cp;
    this._collapse = cp;
  }
  @HostBinding('class.toggled') toggled = true;
  @ViewChild('tagMenu') tagMenu: ContextMenuComponent;
  @ViewChild('branchMenu') branchMenu: ContextMenuComponent;
  private _collapse = false;
  constructor(
    private d3: D3Service,
    private ctxService: ContextMenuService,
    private commitSelection: CommitSelectionService,
    private submodules: SubmodulesService,
    private repoService: RepoService
  ) { }

  ngOnInit() {
  }

  onClick($event) {
    if (this.item.items) {
      this.toggled = !this.toggled;
    } else if (this.item.submodule) {
      this.submodules.selectSubmodule(this.item.shorthand);
    } else if (this.item.isTag) {
      // For tags, just scroll to the commit
      this.d3.scrollTo(this.item.target);
    } else {
      // For branches, checkout the branch to load its commits
      this.repoService.checkout(this.item.shorthand);
    }
    $event.stopPropagation();
  }

  trackBy(index, item) {
    return item.display;
  }
  tryOpenMenu($event: MouseEvent, item: any) {
    if (item.isTag) {
      this.ctxService.show.next({
        contextMenu: this.tagMenu,
        event: $event,
        item: item,
      });
    } else if (item.isRemote || item.isBranch) {
      this.ctxService.show.next({
        contextMenu: this.branchMenu,
        event: $event,
        item: item
      });
    }
    $event.preventDefault();
    $event.stopPropagation();
  }
  onDeleteTag(name) {
    this.commitSelection.deleteTag(name);
  }
  onDeleteBranch(branch) {
    if (branch.isRemote) {
      this.commitSelection.deleteRemoteBranch(branch.name);
    } else {
      this.commitSelection.deleteBranch(branch.name);
    }
  }
}
