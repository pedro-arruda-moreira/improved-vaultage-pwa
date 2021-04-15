import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WINDOW } from 'src/app/platform/providers';

@Component({
  selector: 'app-password-generator',
  templateUrl: 'password.generator.component.html',
  styleUrls: ['password.generator.component.scss']
})
export class PasswordGeneratorComponent implements OnInit {
  constructor(@Inject(WINDOW) private readonly window: Window) {
    this.resolver = () => {};
    this.reject = () => {};
  }
  
  private resolver: (value?: string | PromiseLike<string> | undefined) => void;
  public reject: () => void;

  public password: string = '';

  public length: number = 12;

  public type: PasswordType = PasswordType.STANDARD;

  public generatePassword() {
    switch(this.type) {
      case PasswordType.STANDARD: {
        this.password = (this.window as any).generatePassword(this.length, false);
        break;
      }
      case PasswordType.MEMORABLE: {
        this.password = (this.window as any).generatePassword(this.length);
        break;
      }
      case PasswordType.ALL_CHARS: {
        this.password = (this.window as any).generatePassword(this.length, false, /.*/);
        break;
      }
      case PasswordType.NUMBERS_ONLY: {
        this.password = (this.window as any).generatePassword(this.length, false, /[0-9]/);
        break;
      }
    }
  }
  public ngOnInit(): void {
    this.generatePassword();
  }

  public get generatedPassword(): Promise<string> {
    return new Promise((res, rej) => {
      this.resolver = res;
      this.reject = rej;
    });
  }

  public resolve() {
    this.resolver(this.password);
  }
}

export enum PasswordType {
  STANDARD = "1",
  MEMORABLE = "2",
  ALL_CHARS = "3",
  NUMBERS_ONLY = "4"
}
