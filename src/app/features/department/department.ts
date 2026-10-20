import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-department',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './department.html',
  styleUrls: ['./department.scss']
})
export class DepartmentComponent implements OnInit {
  subjects: any[] = [];
  newSubjectName: string = '';
  isAdding: boolean = false; // Controls visibility of the "Subject name" input field
  editingSubjectId: number | null = null;
  editingName: string = '';
  currentUserRole: string = 'user';

  constructor(public router: Router) {}

 ngOnInit() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      const email = user.email?.toLowerCase() || '';
      const isAdminDomain = email.endsWith('@admin.com') || email.endsWith('@admin.liceo.edu.ph');

      this.currentUserRole = user.role || (isAdminDomain ? 'admin' : 'user');
    } catch {
      this.currentUserRole = 'user';
    }
  }

  this.loadSubjects();
}
  loadSubjects() {
    const saved = localStorage.getItem('localSubjects');
    if (saved) {
      try {
        this.subjects = JSON.parse(saved);
      } catch {
        this.subjects = [];
      }
    } else {
      this.subjects = [];
      localStorage.setItem('localSubjects', JSON.stringify(this.subjects));
    }
  }

  toggleAddInput() {
    // If input is already visible and has text, save it on button click
    if (this.isAdding && this.newSubjectName.trim()) {
      this.saveSubject();
    } else {
      // Otherwise toggle the input box open/closed
      this.isAdding = !this.isAdding;
      this.newSubjectName = '';
    }
  }

  saveSubject() {
    if (!this.newSubjectName.trim()) {
      alert('Please enter a subject name.');
      return;
    }

    const newSub = {
      id: Date.now(),
      name: this.newSubjectName.trim()
    };

    this.subjects.push(newSub);
    localStorage.setItem('localSubjects', JSON.stringify(this.subjects));
    
    // Reset and hide input after saving
    this.newSubjectName = '';
    this.isAdding = false;
  }

  startEdit(subject: any) {
    this.editingSubjectId = subject.id;
    this.editingName = subject.name;
  }

  saveEdit(id: number) {
    if (!this.editingName.trim()) return;
    const sub = this.subjects.find(s => s.id === id);
    if (sub) {
      sub.name = this.editingName.trim();
      localStorage.setItem('localSubjects', JSON.stringify(this.subjects));
    }
    this.editingSubjectId = null;
  }

  cancelEdit() {
    this.editingSubjectId = null;
    this.editingName = '';
  }

  deleteSubject(id: number) {
    this.subjects = this.subjects.filter(s => s.id !== id);
    localStorage.setItem('localSubjects', JSON.stringify(this.subjects));
  }

  onSignOut() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}