import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Task = {
  status: string;
};

type TaskStructure = {
  [folder: string]: {
    [taskName: string]: Task;
  };
};

@Component({
  selector: 'app-home',
  imports: [FormsModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  tasks: TaskStructure = {};
  newTask: string = '';
  newFolder: string = '';
  openFolder: string | null = null;
  openDropdown: { folder: string, task: string } | null = null;

  statuses = [
    { value: 'a_fazer', icon: '📝', label: 'A fazer' },
    { value: 'fazendo', icon: '⚡', label: 'Fazendo' },
    { value: 'feito', icon: '✅', label: 'Feito' },
    { value: 'cancelado', icon: '❌', label: 'Cancelado' },
    { value: 'adiado', icon: '⏸️', label: 'Adiado' },
    { value: 'compromisso', icon: '📅', label: 'Compromisso' },
    { value: 'evento', icon: '🎉', label: 'Evento' },
    { value: 'anotacao', icon: '🗒️', label: 'Anotação' },
  ];

  ngOnInit() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      this.tasks = JSON.parse(savedTasks);
    } else {
      this.tasks = {};
    }
  }

  originalOrder = () => 0;

  getStatusEmoji(status: string): string {
    return this.statuses.find(s => s.value === status)?.icon || '❔';
  }

  toggleDropdown(folder: string, task: string) {
    if (this.openDropdown?.folder === folder && this.openDropdown?.task === task) {
      this.openDropdown = null;
    } else {
      this.openDropdown = { folder, task };
    }
  }

  onStatusChange(folder: string, taskName: string, newStatus: string) {
    if (this.tasks[folder]?.[taskName]) {
      this.tasks[folder][taskName].status = newStatus;
      this.saveTasks();
    }
    this.openDropdown = null;
  }

  toggleFolder(folderName: string) {
    this.openFolder = this.openFolder === folderName ? null : folderName;
  }

  deleteFolder(folderName: string) {
    if (!this.tasks[folderName]) return;
    const confirmed = confirm(`Tem certeza que deseja apagar a pasta "${folderName}"?`);
    if (!confirmed) return;

    delete this.tasks[folderName];
    this.saveTasks();
    if (this.openFolder === folderName) this.openFolder = null;
  }

  addFolder(folderName?: string) {
    if (!folderName || !folderName.trim()) {
      let i = 1;
      while (this.tasks[i.toString()]) i++;
      folderName = i.toString();
    }

    if (this.tasks[folderName]) {
      console.warn('Pasta já existe:', folderName);
      return;
    }

    this.tasks = { [folderName]: {}, ...this.tasks };
    this.saveTasks();
    this.openFolder = folderName;
    this.newFolder = "";
  }

  addTask(folderName: string, taskName: string) {
    if (!taskName?.trim()) return;
    if (!this.tasks[folderName]) this.tasks[folderName] = {};
    this.tasks[folderName][taskName.trim()] = { status: 'a_fazer' };
    this.newTask = '';
    this.saveTasks();
  }

  deleteTask(folder: string, taskName: string) {
    if (this.tasks[folder]?.[taskName]) {
      delete this.tasks[folder][taskName];
      this.saveTasks();
    }
  }

  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  // 🔹 Fecha dropdown se clicar fora
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.openDropdown = null;
    }
  }
}
