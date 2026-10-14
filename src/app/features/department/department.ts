import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-department',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './department.html',
  styleUrls: ['./department.scss']
})
export class DepartmentComponent implements OnInit {
  newSubjectName: string = '';
  subjects: any[] = [];
  isAdding: boolean = false;
  
  private apiUrl = 'http://localhost:3000/api/subjects';

  constructor(public router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.fetchSubjects();
  }

  fetchSubjects() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.subjects = data.sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (err) => {
        console.error('Error fetching subjects:', err);
      }
    });
  }

  addSubject() {
    if (this.newSubjectName.trim()) {
      const payload = { name: this.newSubjectName.trim() };
      this.http.post(this.apiUrl, payload).subscribe({
        next: () => {
          this.fetchSubjects();
          this.newSubjectName = '';
          this.isAdding = false;
        },
        error: (err) => {
          console.error('Add failed:', err);
          alert('Failed to add subject. Is the backend running?');
        }
      });
    }
  }

  deleteSubject(id: number) {
    if (confirm('Are you sure you want to delete this subject?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.fetchSubjects();
        },
        error: (err) => {
          console.error('Delete failed:', err);
          alert('Could not delete subject.');
        }
      });
    }
  }

  editSubject(subject: any) {
    const updatedName = prompt('Edit Subject Name:', subject.name);
    if (updatedName && updatedName.trim() && updatedName !== subject.name) {
      const payload = { name: updatedName.trim() };
      this.http.patch(`${this.apiUrl}/${subject.id}`, payload).subscribe({
        next: () => {
          this.fetchSubjects();
        },
        error: (err) => {
          console.error('Update failed:', err);
          alert('Failed to update subject.');
        }
      });
    }
  }

  toggleAddBox() {
    this.isAdding = !this.isAdding;
    if (!this.isAdding) {
      this.newSubjectName = '';
    }
  }

  onSignOut() {
    this.router.navigate(['/login']);
  }
}