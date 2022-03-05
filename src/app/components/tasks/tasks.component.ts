import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '@interfaces/task.interface';
import { ModalService } from '../_modal';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
})
export class TasksComponent implements OnInit, AfterViewInit {
  // Массив Задач
  tasks: Task[] = [];
  // Переменные для верхних импутов
  find_Task = '';
  name_Task: string;
  // Переменные для Task
  text_Task = '';
  asked_Id:number;
  // Общие
  base_Url = 'http://localhost:3000/tasks';

  constructor(private http: HttpClient, private modalService: ModalService) {}

  ngOnInit(): void {
    // Взятие сохраненного фильтра
    this.find_Task = sessionStorage.getItem('find_Task');
  }
  // Сохронение фильтра
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    sessionStorage.setItem('find_Task', this.find_Task);
  }
  ngAfterViewInit(): void {
    // Берем массив Task
    this.http.get<Task[]>(this.base_Url).subscribe((data) => {
      this.tasks = data;
    });
  }
  // Можно создать отдельный сервис для всего этого.
  // Добавляем Task
  add_task() {
    const post_Form: Task = {
      id: this.tasks[this.tasks.length - 1].id + 1,
      task: this.name_Task,
      isCompleted: false,
      edit: false,
    };
    // Добавляем в локальный массив
    this.tasks.push(post_Form);
    // Добавляем в БД
    this.http.post<Task>(this.base_Url, post_Form).subscribe();
  }
  // Разрешить\запретить редактирование Task
  edit_task(id: number, task: string) {
    console.log(task, id);
    this.text_Task = task;
    this.tasks[id].edit = !this.tasks[id].edit;
    // this.tasks[id].task =
  }
  // Сохранение checkbox, локально, потом отправка на сервер
  save_checkbox(id: number, bool: boolean) {
    this.tasks[id].isCompleted = !this.tasks[id].isCompleted;
    // Если передавать только isCompleted, то сервер трет поля, что странно
    const put_Form: Task = {
      id: this.tasks[id].id,
      task: this.tasks[id].task,
      isCompleted: this.tasks[id].isCompleted,
      edit: this.tasks[id].edit,
    };
    this.http
      .put<void>(this.base_Url + '/' + this.tasks[id].id, put_Form)
      .subscribe();
    console.log(this.tasks[id].isCompleted);
  }
  // Сохранение текста таски, локально, потом отправка на сервер
  save(id: number, task: string) {
    this.tasks[id].task = this.text_Task;
    this.tasks[id].edit = !this.tasks[id].edit;
    const put_Form: Task = {
      id: this.tasks[id].id,
      task: this.tasks[id].task,
      isCompleted: this.tasks[id].isCompleted,
      edit: this.tasks[id].edit,
    };
    this.http
      .put<void>(this.base_Url + '/' + this.tasks[id].id, put_Form)
      .subscribe();
  }
  // Отмена редактирования
  cancel(id: number) {
    this.tasks[id].edit = !this.tasks[id].edit;
  }
  // Удаление Task
  ask_remove_task(id_modal: string, id_task: number): void {
    // Модалка взята от сюда: https://jasonwatmore.com/post/2020/09/24/angular-10-custom-modal-window-dialog-box
    // т.к. Material запрещен

    // Передаем id таски котокой обратились
    this.asked_Id = id_task;
    // Открываем модалку
    this.modalService.open(id_modal);
  }
  closeModal(id: string) {
    // Закрываем
    this.modalService.close(id);
  }
  // Удаление таски
  delete_Task(id:string) {
    const id_task = this.asked_Id
    this.http
      .delete(this.base_Url + '/' + this.tasks[id_task].id)
      .subscribe(() => {
        this.tasks = this.tasks.filter((t) => t.id !== id_task+1);
      });
    this.modalService.close(id);
  }
}
