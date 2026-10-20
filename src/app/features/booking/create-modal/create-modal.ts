import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-modal.html',
  styleUrls: ['./create-modal.scss'],
})
export class CreateModal implements OnInit {
  @Input() roomName: string = '';
  @Input() selectedDate: string = '';
  @Input() bookedBy: string = '';

  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<any>();

  selectedType: 'One-Time' | 'Recurring' = 'One-Time';

  subjects: any[] = [];

  // Holds only the logged in user
  staff: any[] = [];
  selectedStaff: string = '';

  data: any = {
    period: '',
    department: '',
    untilDate: 'Ending of session',
    showDatePicker: false,
    startDate: '',
    customUntilDate: ''
  };

  periods = [
    { label: 'Period 1', time: '9:00am - 10:30am' },
    { label: 'Period 2', time: '10:30am - 12:00nn' },
    { label: 'LUNCH', time: '12:00nn - 1:00pm' },
    { label: 'Period 4', time: '1:00pm - 2:00pm' },
    { label: 'Period 5', time: '2:30pm - 3:30pm' },
    { label: 'Period 6', time: '3:30pm - 5:00pm' }
  ];

  ngOnInit() {
    // 1. Load subjects from localStorage
    const savedSubjects = localStorage.getItem('localSubjects') || localStorage.getItem('departments');
    if (savedSubjects) {
      try {
        const parsed = JSON.parse(savedSubjects);
        if (Array.isArray(parsed)) {
          this.subjects = parsed;
        }
      } catch (e) {
        this.subjects = [];
      }
    }

    // 2. Load ONLY the logged-in user into the staff dropdown
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const loggedInUser = JSON.parse(savedUser);
        if (loggedInUser.firstName || loggedInUser.lastName) {
          const userObj = {
            firstName: loggedInUser.firstName || '',
            lastName: loggedInUser.lastName || ''
          };
          this.staff = [userObj];
          this.selectedStaff = `${userObj.firstName} ${userObj.lastName}`.trim();
        } else {
          this.setDefaultUser();
        }
      } catch {
        this.setDefaultUser();
      }
    } else {
      this.setDefaultUser();
    }
  }

  private setDefaultUser() {
    const fallbackUser = { firstName: 'Euniece Kyle', lastName: 'Puerto' };
    this.staff = [fallbackUser];
    this.selectedStaff = `${fallbackUser.firstName} ${fallbackUser.lastName}`;
  }

  onUntilChange() {
    this.data.showDatePicker = this.data.untilDate === 'Pick Date';
  }

  onSubmit() {
    let finalUntilDate = null;

    if (this.selectedType === 'Recurring') {
      finalUntilDate = this.data.showDatePicker
        ? this.data.customUntilDate
        : (this.data.untilDate || 'Ending of session');
    }

    const bookingPayload = {
      room_name: this.roomName,
      booking_date: this.data.startDate || this.selectedDate,
      period: this.data.period,
      subject: this.data.department,
      booked_by: this.selectedStaff,
      booking_type: this.selectedType,
      until_date: finalUntilDate,
      status: 'Confirmed'
    };

    console.log('Temporary booking data:', bookingPayload);

    this.create.emit(bookingPayload);
    this.close.emit();
  }

  closeModal() {
    this.close.emit();
  }
}