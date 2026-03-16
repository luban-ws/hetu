import { Injectable, Output, EventEmitter, Inject, NgZone } from "@angular/core";
import { DesktopAdapter, DESKTOP_ADAPTER } from '../../infrastructure/desktop-adapter';
import { Issue } from "../models/issue";
import { ToastrService } from "ngx-toastr";
import { StatusBarService } from "../../infrastructure/status-bar.service";
import { Profile } from "../models/profile";
import { IssueType } from "../models/issue-type";
import { Resolution } from "../models/resolution";
import { IPC_EVENTS } from '@infrastructure/ipc-events';

@Injectable()
export class JiraIntegrationService {
  @Output() issueRetrieved: EventEmitter<Issue> = new EventEmitter<Issue>();
  @Output() subtaskRetrieved: EventEmitter<Issue> = new EventEmitter<Issue>();
  @Output() enabledChanged = new EventEmitter<boolean>();
  @Output() assignableRetrieved = new EventEmitter<{
    key: string;
    result: Profile[];
  }>();
  @Output() issueQueryRetrieved: EventEmitter<Issue[]> = new EventEmitter<
    Issue[]
  >();
  @Output() resolutionRetrieved: EventEmitter<Resolution[]> = new EventEmitter<
    Resolution[]
  >();
  @Output() changeIssue: EventEmitter<string> = new EventEmitter<string>();
  @Output() previousIssueStateChanged: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  @Output() nextIssueStateChanged: EventEmitter<boolean> =
    new EventEmitter<boolean>();
  enabled = false;
  jiraUrl = "";
  previousIssueStack: string[] = [];
  nextIssueStack: string[] = [];
  private jiraKeys = [];
  resolutions: Resolution[] = [];
  private issueTypes: IssueType[] = [];
  private subtaskType: IssueType;
  constructor(
    @Inject(DESKTOP_ADAPTER) private adapter: DesktopAdapter,
    private zone: NgZone,
    private toastr: ToastrService,
    private statusBarSvc: StatusBarService
  ) {
    this.adapter.on(IPC_EVENTS.SETTINGS.EFFECTIVE_UPDATED, (_event: unknown, arg: any) => {
      this.zone.run(() => {
        if (
          !arg ||
          !arg["jira-enabled"] ||
          !arg["jira-keys"] ||
          arg["jira-keys"].split(";").length === 0
        ) {
          this.enabled = false;
          this.jiraKeys = [];
          this.jiraUrl = "";
        } else {
          this.jiraKeys = arg["jira-keys"].split(";");
          this.jiraUrl = arg["jira-address"];
          this.enabled = true;
        }
        this.enabledChanged.emit(this.enabled);
        if (arg && arg.currentRepo && arg.currentRepo.id) {
          this.adapter.send(IPC_EVENTS.JIRA.REPO_CHANGED, {
            id: arg.currentRepo.id,
          });
        }
      });
    });
    this.adapter.on(IPC_EVENTS.JIRA.ISSUE_RETRIEVED, (_event: unknown, arg: any) => {
      this.zone.run(() => {
        this.issueRetrieved.emit(arg.issue);
      });
    });
    this.adapter.on(IPC_EVENTS.JIRA.RESOLUTIONS_RETRIEVED, (_event: unknown, arg: any) => {
      this.zone.run(() => {
        this.resolutions = arg.resolutions;
        this.resolutionRetrieved.emit(this.resolutions);
      });
    });
    this.adapter.on(IPC_EVENTS.JIRA.ISSUE_TYPES_RETRIEVED, (_event: unknown, arg: any) => {
      this.zone.run(() => {
        this.issueTypes = arg.issueTypes;
        this.subtaskType = arg.subtaskType;
      });
    });
    this.adapter.on(IPC_EVENTS.JIRA.ERROR, () => {
      this.zone.run(() => {
        this.toastr.error(
          "Your JIRA setup doesn't seemed to be correct, please enter the correct settings",
          "Error"
        );
      });
    });
    this.adapter.on(IPC_EVENTS.JIRA.TIMEOUT, () => {
      this.zone.run(() => {
        this.statusBarSvc.flash(
          "warning",
          "JIRA connection timeout, your network connection might be unstable"
        );
      });
    });
    this.adapter.on(IPC_EVENTS.JIRA.OPERATION_FAILED, () => {
      this.zone.run(() => {
        this.toastr.error(
          "Operation failed, please reload this issue and try again",
          "Failed"
        );
        this.issueRetrieved.emit(null);
      });
    });
    this.adapter.on(IPC_EVENTS.JIRA.NOT_FOUND, () => {
      this.zone.run(() => {
        this.toastr.warning(
          "JIRA issue not found, server returned 404",
          "Not Found"
        );
        this.issueRetrieved.emit(null);
      });
    });
    this.adapter.on(IPC_EVENTS.JIRA.CAPTCHA_REQUIRED, () => {
      this.zone.run(() => {
        this.toastr.warning(
          "You have triggered JIRA's CAPTCHA detection, please login using your browser and solve the challenge before attempting more requests",
          "JIRA Limiting"
        );
      });
    });
    this.adapter.on(IPC_EVENTS.JIRA.ASSIGNABLE_USERS_RETRIEVED, (_event: unknown, arg: any) => {
      this.zone.run(() => {
        this.assignableRetrieved.emit(arg.result);
      });
    });
    this.adapter.on(IPC_EVENTS.JIRA.ISSUE_QUERY_RESULT_RETRIEVED, (_event: unknown, arg: any) => {
      this.zone.run(() => {
        this.issueQueryRetrieved.emit(arg.issues);
      });
    });
  }
  parseKeyFromMessage(message, detail) {
    if (this.jiraKeys.length > 0) {
      let foundKeys = [];
      this.jiraKeys.forEach((key) => {
        let re = new RegExp(`${key}-\\d+`, "g");
        if (message) {
          let found = message.match(re);
          if (found) {
            foundKeys = foundKeys.concat(found);
          }
        }
        if (detail) {
          let found = detail.match(re);
          if (found) {
            foundKeys = foundKeys.concat(found);
          }
        }
      });
      return foundKeys;
    } else {
      return [];
    }
  }
  /** @description Fetch a single JIRA issue by key */
  getIssue(key) {
    this.adapter.send(IPC_EVENTS.JIRA.GET_ISSUE, { key: key });
  }

  /** @description Add a comment to a JIRA issue */
  addComment(key, body) {
    this.adapter.send(IPC_EVENTS.JIRA.ADD_COMMENT, { key: key, body: body });
  }

  /** @description Update JIRA issue fields and/or transition */
  updateIssue(key, fields, transition?) {
    let data = {};
    if (fields) {
      data["fields"] = fields;
    }
    if (transition) {
      data["transition"] = transition;
    }
    this.adapter.send(IPC_EVENTS.JIRA.UPDATE_ISSUE, {
      key: key,
      data: data,
    });
  }

  /** @description Find users assignable to a JIRA issue */
  findAssignableUsers(key, search = "") {
    this.adapter.send(IPC_EVENTS.JIRA.GET_ASSIGNABLE_USERS, {
      key: key,
      search: search,
    });
  }

  /** @description Assign a JIRA issue to a user */
  assignIssue(key, name) {
    this.adapter.send(IPC_EVENTS.JIRA.ASSIGN_ISSUE, {
      key: key,
      name: name,
    });
  }

  /** @description Create a subtask under a JIRA issue */
  addSubtask(key, name, projectId) {
    this.adapter.send(IPC_EVENTS.JIRA.ADD_SUBTASK, {
      key: key,
      name: name,
      projectId: projectId,
      subtaskId: this.subtaskType.id,
    });
  }

  /** @description Search JIRA issues by exact key */
  searchIssuesByKey(keyQuery, fields?) {
    let jql = `key = "${keyQuery}"`;
    this.adapter.send(IPC_EVENTS.JIRA.SEARCH_ISSUES, {
      jql: jql,
      fields: fields,
    });
  }

  /** @description Search JIRA issues by summary text */
  searchIssuesBySummary(textQuery, fields?) {
    let jql = `summary ~ "\\"${textQuery}\\""`;
    this.adapter.send(IPC_EVENTS.JIRA.SEARCH_ISSUES, {
      jql: jql,
      fields: fields,
    });
  }
  navigateToIssue(key) {
    this.changeIssue.emit(key);
  }
  pushPrevious(key) {
    if (this.previousIssueStack.indexOf(key) === -1 && key) {
      this.previousIssueStack.push(key);
      if (this.previousIssueStack.length === 1) {
        this.previousIssueStateChanged.emit(true);
      }
    }
  }
  pushNext(key) {
    if (this.nextIssueStack.indexOf(key) === -1) {
      this.nextIssueStack.push(key);
      if (this.nextIssueStack.length === 1) {
        this.nextIssueStateChanged.emit(true);
      }
    }
  }
  gotoPrevious() {
    if (this.previousIssueStack.length) {
      let issue = this.previousIssueStack.pop();
      this.navigateToIssue(issue);
      if (!this.previousIssueStack.length) {
        this.previousIssueStateChanged.emit(false);
      }
    }
  }
  gotoNext() {
    if (this.nextIssueStack.length) {
      let issue = this.nextIssueStack.pop();
      this.navigateToIssue(issue);
      if (!this.nextIssueStack.length) {
        this.nextIssueStateChanged.emit(false);
      }
    }
  }
}
