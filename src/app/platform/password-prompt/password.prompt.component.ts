import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-password-prompt',
  templateUrl: 'password.prompt.component.html',
  styleUrls: ['password.prompt.component.scss']
})
export class PasswordPromptComponent {

  public passwordInputType: PasswordInputType = 'password';

  public resolve: (value?: string | PromiseLike<string> | undefined) => void;
  public reject: () => void;

  constructor(
    private readonly dialog: MatDialog) {
    this.resolve = () => {};
    this.reject = () => {};
  }

  public togglePasswordVisibility() {
      this.passwordInputType = this.passwordInputType === 'text' ? 'password' : 'text';
  }

  public get password(): Promise<string> {
    return new Promise((res, rej) => {
      this.reject = () => {
        rej(new Error('Password prompt cancelled by user.'));
      };
      this.resolve = res;
    });
  }

  public onKeyUp(pass: string, keyCode: number) {
    if(keyCode == 13) {
      this.resolve(pass);
      this.dialog.closeAll();
    }
  }

}

type PasswordInputType = 'text' | 'password';