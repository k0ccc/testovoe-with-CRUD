import { Pipe, PipeTransform } from '@angular/core';
import { Task } from '@interfaces/task.interface';

@Pipe({
  name: 'findTask',
})
export class FindTaskPipe implements PipeTransform {
  transform(tasks:Task[], search: string = ''): Task[] {
    if (!search.trim()){
      return tasks;
    }
    return tasks.filter(task =>{
      console.log(task);
      
      return task.task.includes(search);
    })
  }
}
