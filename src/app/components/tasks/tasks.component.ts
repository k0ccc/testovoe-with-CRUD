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
  tasks!: Task[];
  // Переменные для верхних импутов
  findTask!: string;
  nameTask!: string;
  // Переменные для Task
  textTask!: string;
  askedId!: number;
  // Общие
  baseUrl = 'http://localhost:3000/tasks';

  constructor(private http: HttpClient, private modalService: ModalService) {}

  ngOnInit(): void {
    // Взятие сохраненного фильтра
    this.findTask = localStorage.getItem('findTask');
  }
  // Сохронение фильтра
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    localStorage.setItem('findTask', this.findTask);
  }
  ngAfterViewInit(): void {
    // Берем массив Task
    this.http.get<Task[]>(this.baseUrl).subscribe((data) => {
      this.tasks = data;
    });
  }
  // Можно создать отдельный сервис для всего этого.
  // Добавляем Task
  add_task() {
    const postForm: Task = {
      id: this.tasks[this.tasks.length - 1].id + 1,
      task: this.nameTask,
      isCompleted: false,
      edit: false,
    };
    // Добавляем в локальный массив
    this.tasks.push(postForm);
    // Добавляем в БД
    this.http.post<Task>(this.baseUrl, postForm).subscribe();
  }
  // Разрешить\запретить редактирование Task
  edit_task(id: number, task: string) {
    console.log(task, id);
    this.textTask = task;
    this.tasks[id].edit = !this.tasks[id].edit;
  }
  // Сохранение checkbox, локально, потом отправка на сервер
  save_checkbox(id: number, bool: boolean) {
    this.tasks[id].isCompleted = !this.tasks[id].isCompleted;
    // Если передавать только isCompleted, то сервер трет поля, что странно
    const putForm: Task = {
      id: this.tasks[id].id,
      task: this.tasks[id].task,
      isCompleted: this.tasks[id].isCompleted,
      edit: this.tasks[id].edit,
    };
    this.http
      .put<void>(this.baseUrl + '/' + this.tasks[id].id, putForm)
      .subscribe();
    console.log(this.tasks[id].isCompleted);
  }
  // Сохранение текста таски, локально, потом отправка на сервер
  save(id: number, task: string) {
    this.tasks[id].task = this.textTask;
    this.tasks[id].edit = !this.tasks[id].edit;
    const putForm: Task = {
      id: this.tasks[id].id,
      task: this.tasks[id].task,
      isCompleted: this.tasks[id].isCompleted,
      edit: this.tasks[id].edit,
    };
    this.http
      .put<void>(this.baseUrl + '/' + this.tasks[id].id, putForm)
      .subscribe();
  }
  // Отмена редактирования
  cancel(id: number) {
    this.tasks[id].edit = !this.tasks[id].edit;
  }
  // Удаление Task
  ask_remove_task(idModal: string, idTask: number): void {
    // Модалка взята от сюда: https://jasonwatmore.com/post/2020/09/24/angular-10-custom-modal-window-dialog-box
    // т.к. Material запрещен

    // Передаем id таски котокой обратились
    this.askedId = idTask;
    // Открываем модалку
    this.modalService.open(idModal);
  }
  closeModal(id: string) {
    // Закрываем
    this.modalService.close(id);
  }
  // Удаление таски
  delete_Task(id: string) {
    const idTask = this.askedId;
    this.http
      .delete(this.baseUrl + '/' + this.tasks[idTask].id)
      .subscribe(() => {
        this.tasks = this.tasks.filter((t) => t.id !== idTask + 1);
      });
    this.modalService.close(id);
  }
}
