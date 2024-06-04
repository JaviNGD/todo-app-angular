import { Component, signal, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { Task } from './../../models/task.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  tasks = signal<Task[]>([]);

  constructor() {
    effect(() => {
      const tasks = this.tasks();
      localStorage.setItem('tasks', JSON.stringify(tasks));
    });
  }
  
  ngOnInit() {
    const storageTasks = localStorage.getItem('tasks');
    if (storageTasks) {
        const tasks: Task[] = JSON.parse(storageTasks);
        this.tasks.set(tasks);
    }
  }

  newTaskControl = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.pattern(/.+/),
    ]
  });

  changeHandler() {
    const trimmedValue = this.newTaskControl.value.trim();
    if (this.newTaskControl.valid && trimmedValue) {
      this.addTask(trimmedValue);
      this.newTaskControl.reset();
    }
  }

  addTask(title: string) {
    const newTask = {
      id: Date.now(),
      title,
      completed: false
    };
    this.tasks.update((tasks) => [newTask, ...tasks]);
  }

  deleteTask(index: number) {
    this.tasks.update(tasks => tasks.filter((task, position) => position !== index));
  }

  updateTask(index: number) {
    this.tasks.update((tasks) => {
      return tasks.map((task, position) => {
        if (position === index) {
          return {
            ...task,
            completed: !task.completed
          }
        }
        return task;
      })
    })
  }

  updateTaskEditingMode(index: number) {
    if (this.tasks()[index].completed) {
      return;
    }

    this.tasks.update((prevState) => {
      return prevState.map((task, position) => {
        if (position === index) {
          return {
            ...task,
            editing: true
          }
        }
        return {
          ...task,
          editing: false
        }
      })
    })
  }

  updateTaskText(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    this.tasks.update((prevState) => {
      return prevState.map((task, position) => {
        if (position === index) {
          return {
            ...task,
            title: input.value,
            editing: false
          }
        }
        return task;
      })
    })
  }

  filter = signal('All');

  changeFilter(filter: 'All' | 'Pending' | 'Completed') {
    this.filter.set(filter);
  }

  filteredTasks() {
    return this.tasks().filter(task => {
      if (this.filter() === 'All') {
        return true;
      } else if (this.filter() === 'Pending') {
        return !task.completed;
      } else if (this.filter() === 'Completed') {
        return task.completed;
      }
      return true;
    });
  }

  clearCompletedTasks() {
    this.tasks.update(tasks => tasks.filter(task => !task.completed));
  }
}
