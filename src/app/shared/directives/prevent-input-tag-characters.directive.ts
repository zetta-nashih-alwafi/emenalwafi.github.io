import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[msPreventInputTagCharacters]'
})
export class PreventInputTagCharactersDirective {
  constructor() { }

  @HostListener('keydown', ['$event'])
  onKeydown(event: any) {
    const forbiddenCharacters = ['<', '>'];
    const inputedCharacter = event.key;

    if (forbiddenCharacters.includes(inputedCharacter)) {
      event.stopPropagation();
      event.preventDefault();
    }
  }
}
