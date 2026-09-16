package com.eventbooking.backend.dto;

public class CreateBookingRequest {
    private Long studentId;
    private Long eventId;

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
}
