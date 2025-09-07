import { Component, Output, EventEmitter } from '@angular/core';
import { Prompt } from '../../infrastructure/prompt';

@Component({
  standalone: false,
  selector: 'app-git-init-prompt',
  templateUrl: './git-init-prompt.component.html',
  styleUrls: ['./git-init-prompt.component.scss']
})
export class GitInitPromptComponent implements Prompt {
  toClose = new EventEmitter();
  @Output() onResult = new EventEmitter<boolean>();
  
  message = '';
  workingDir = '';

  /**
   * Set the configuration for this prompt
   * @param message - The message to display to the user
   * @param workingDir - The directory path to initialize
   */
  configure(message: string, workingDir: string) {
    this.message = message;
    this.workingDir = workingDir;
  }

  /**
   * User clicked Initialize - emit true and close modal
   */
  onInitialize() {
    this.toClose.emit();
    this.onResult.emit(true);
  }

  /**
   * User clicked Cancel - emit false and close modal
   */
  onCancel() {
    this.toClose.emit();
    this.onResult.emit(false);
  }
}