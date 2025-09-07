import { Injectable, Output, EventEmitter } from "@angular/core";
import { ElectronService } from "../../infrastructure/electron.service";
import { Issue } from "../models/issue";
import { ToastrService } from "ngx-toastr";
import { StatusBarService } from "../../infrastructure/status-bar.service";
import { Profile } from "../models/profile";
import { IssueType } from "../models/issue-type";
import { Resolution } from "../models/resolution";
import { IPC_EVENTS  } from '@common/ipc-events';

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
    private electron: ElectronService,
    private toastr: ToastrService,
    private statusBarSvc: StatusBarService
  ) {
    electron.onCD(IPC_EVENTS.SETTINGS.EFFECTIVE_UPDATED, (event, arg) => {
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
        electron.ipcRenderer.send(IPC_EVENTS.JIRA.REPO_CHANGED, {
          id: arg.currentRepo.id,
        });
      }
    });
    electron.onCD(IPC_EVENTS.JIRA.ISSUE_RETRIEVED, (event, arg) => {
      this.issueRetrieved.emit(arg.issue);
    });
    electron.onCD(IPC_EVENTS.JIRA.RESOLUTIONS_RETRIEVED, (event, arg) => {
      this.resolutions = arg.resolutions;
      this.resolutionRetrieved.emit(this.resolutions);
    });
    electron.onCD(IPC_EVENTS.JIRA.ISSUE_TYPES_RETRIEVED, (event, arg) => {
      this.issueTypes = arg.issueTypes;
      this.subtaskType = arg.subtaskType;
    });
    electron.onCD(IPC_EVENTS.JIRA.ERROR, (event, arg) => {
      this.toastr.error(
        "Your JIRA setup doesn't seemed to be correct, please enter the correct settings",
        "Error"
      );
    });
    electron.onCD(IPC_EVENTS.JIRA.TIMEOUT, (event, arg) => {
      statusBarSvc.flash(
        "warning",
        "JIRA connection timeout, your network connection might be unstable"
      );
    });
    electron.onCD(IPC_EVENTS.JIRA.OPERATION_FAILED, (event, arg) => {
      this.toastr.error(
        "Operation failed, please reload this issue and try again",
        "Failed"
      );
      this.issueRetrieved.emit(null);
    });
    electron.onCD(IPC_EVENTS.JIRA.NOT_FOUND, (event, arg) => {
      this.toastr.warning(
        "JIRA issue not found, server returned 404",
        "Not Found"
      );
      this.issueRetrieved.emit(null);
    });
    electron.onCD(IPC_EVENTS.JIRA.CAPTCHA_REQUIRED, (event, arg) => {
      this.toastr.warning(
        "You have triggered JIRA's CAPTCHA detection, please login using your browser and solve the challenge before attempting more requests",
        "JIRA Limiting"
      );
    });
    electron.onCD(IPC_EVENTS.JIRA.ASSIGNABLE_USERS_RETRIEVED, (event, arg) => {
      this.assignableRetrieved.emit(arg.result);
    });
    electron.onCD(IPC_EVENTS.JIRA.ISSUE_QUERY_RESULT_RETRIEVED, (event, arg) => {
      this.issueQueryRetrieved.emit(arg.issues);
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
  getIssue(key) {
    this.electron.ipcRenderer.send(IPC_EVENTS.JIRA.GET_ISSUE, { key: key });
  }
  addComment(key, body) {
    this.electron.ipcRenderer.send(IPC_EVENTS.JIRA.ADD_COMMENT, { key: key, body: body });
  }
  updateIssue(key, fields, transition?) {
    let data = {};
    if (fields) {
      data["fields"] = fields;
    }
    if (transition) {
      data["transition"] = transition;
    }
    this.electron.ipcRenderer.send(IPC_EVENTS.JIRA.UPDATE_ISSUE, {
      key: key,
      data: data,
    });
  }
  findAssignableUsers(key, search = "") {
    this.electron.ipcRenderer.send(IPC_EVENTS.JIRA.GET_ASSIGNABLE_USERS, {
      key: key,
      search: search,
    });
  }
  assignIssue(key, name) {
    this.electron.ipcRenderer.send(IPC_EVENTS.JIRA.ASSIGN_ISSUE, {
      key: key,
      name: name,
    });
  }
  addSubtask(key, name, projectId) {
    this.electron.ipcRenderer.send(IPC_EVENTS.JIRA.ADD_SUBTASK, {
      key: key,
      name: name,
      projectId: projectId,
      subtaskId: this.subtaskType.id,
    });
  }
  searchIssuesByKey(keyQuery, fields?) {
    let jql = `key = "${keyQuery}"`;
    this.electron.ipcRenderer.send(IPC_EVENTS.JIRA.SEARCH_ISSUES, {
      jql: jql,
      fields: fields,
    });
  }
  searchIssuesBySummary(textQuery, fields?) {
    let jql = `summary ~ "\\"${textQuery}\\""`;
    this.electron.ipcRenderer.send(IPC_EVENTS.JIRA.SEARCH_ISSUES, {
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
