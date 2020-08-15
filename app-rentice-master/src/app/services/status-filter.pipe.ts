import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'statusFilter'})
export class StatusFilterPipe implements PipeTransform {
  transform(items: any[], filter: string): any {
    if (!items || !filter) {
        return items;
    }

    if(filter == 'All') {
      return items;
    }

    return items.filter(item => item.status == filter);
  }
}