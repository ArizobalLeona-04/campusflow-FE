
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

 subjects: any[] = [
  { id: 1, name: 'Application Development' },
  { id: 2, name: 'Data Structures and Algorithms' },
  { id: 3, name: 'Integrative Programming' },
  { id: 4, name: 'Purposive Communication' },
  { id: 5, name: 'Social and Professional Issues' }
];

staff: any[] = [
  { id: 1, firstName: 'Leona', lastName: 'Arizobal' },
  { id: 2, firstName: 'Precious', lastName: 'Fillalan' },
  { id: 3, firstName: 'Euniece Kyle', lastName: 'Puerto' }
];

  selectedStaff: string = 'Leona Arizobal';

  data: any = {
    period: '',
    department: '',
    untilDate: '',
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
    // Use the sample staff member unless a logged-in user is available.
    const savedUser = localStorage.getItem('currentUser');

    if (savedUser) {
      try {
        const loggedInUser = JSON.parse(savedUser);

        if (loggedInUser.firstName && loggedInUser.lastName) {
          this.selectedStaff =
            `${loggedInUser.firstName} ${loggedInUser.lastName}`;
        }
      } catch {
        this.selectedStaff = 'Leona Arizobal';
      }
    }
  }

  onUntilChange() {
    this.data.showDatePicker =
      this.data.untilDate === 'Pick Date';
  }

  onSubmit() {
    let finalUntilDate = null;

    if (this.selectedType === 'Recurring') {
      finalUntilDate =
        this.data.customUntilDate || this.data.untilDate;
    }

    const bookingPayload = {
      room_name: this.roomName,
      booking_date: this.selectedDate,
      period: this.data.period,
      subject: this.data.department,
      booked_by: this.selectedStaff,
      booking_type: this.selectedType,
      until_date: finalUntilDate,
      status: 'Confirmed'
    };

    console.log('Temporary booking data:', bookingPayload);

    alert(
      'Demo mode: Your booking details were prepared, but not saved. The backend is not connected.'
    );

    // Send the sample booking to the parent component for UI testing.
    this.create.emit(bookingPayload);
    this.close.emit();
  }

  closeModal() {
    this.close.emit();
  }
}
