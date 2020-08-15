import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'reverseStr'})
export class ReverseStrPipe implements PipeTransform {
  transform(str: string): string {
    if(!str) {
      return '';
    }

    var pos1 = str.indexOf("(");
    if(pos1 < 0) {
        return str;
    }
    var pos2 = str.indexOf(")");
    
    str = str.substring(pos1 + 1, pos2);
    return str;
  }
}