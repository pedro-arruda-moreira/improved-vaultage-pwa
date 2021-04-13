import { Injectable, Inject } from '@angular/core';
import { WINDOW } from './platform/providers';

/**
 * Password prompt service.
 * 
 * Modified from
 * https://stackoverflow.com/questions/9554987/how-can-i-hide-the-password-entered-via-a-javascript-dialog-prompt
 */
 @Injectable()
 export class PasswordPromptService {

    private promptCount = 0;
     
    constructor(@Inject(WINDOW) private readonly window: Window) {}

    public passwordPrompt(options: PasswordPromptOptions): Promise<string> {
        const promptDiv = this.window.document.createElement('div');
        
        promptDiv.className = "pw_prompt";
        let resolve : (value?: string | PromiseLike<string> | undefined) => void;
        let reject : (reason?: any) => void;
        const promise = new Promise<string>((res, rej) => {
            resolve = res;
            reject = rej;
        });

        const label = this.window.document.createElement("label");
        label.textContent = options.promptText;
        label.setAttribute('for', "pw_prompt_input" + (++this.promptCount));
        promptDiv.appendChild(label);

        const input = this.window.document.createElement("input");
        const submit = () => {
            this.window.document.body.removeChild(promptDiv);
            resolve(input.value);
        };
        const cancel = () => {
            this.window.document.body.removeChild(promptDiv);
            reject(new Error(options.cancelMessage));
        };
        input.id = "pw_prompt_input" + (this.promptCount);
        input.type = "password";
        input.addEventListener("keyup", (e) => {
            if (e.keyCode == 13) submit();
        }, false);
        promptDiv.appendChild(input);

        const submitButton = this.window.document.createElement("button");
        submitButton.textContent = options.submitButtonText;
        submitButton.addEventListener("click", submit, false);
        promptDiv.appendChild(submitButton);

        const cancelButton = this.window.document.createElement("button");
        cancelButton.textContent = options.cancelButtonText;
        cancelButton.addEventListener("click", cancel, false);
        promptDiv.appendChild(cancelButton);
    
        this.window.document.body.appendChild(promptDiv);
        return promise;
    }
 }

 export interface PasswordPromptOptions {
     promptText: string;
     submitButtonText: string;
     cancelButtonText: string;
     cancelMessage: string;
 }

 class Bla implements PromiseLike<string> {
     then<TResult1 = string, TResult2 = never>(onfulfilled?: ((value: string) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): PromiseLike<TResult1 | TResult2> {
         throw new Error("Method not implemented.");
     }

 }