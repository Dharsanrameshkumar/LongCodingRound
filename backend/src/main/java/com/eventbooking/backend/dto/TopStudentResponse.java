package com.eventbooking.backend.dto;

public class TopStudentResponse {
    private Long studentId;
    private String studentName;
    private String email;
    private long bookingCount;

    public TopStudentResponse(Long studentId, String studentName, String email, long bookingCount) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.email = email;
        this.bookingCount = bookingCount;
    }

    public Long getStudentId() { return studentId; }
    public String getStudentName() { return studentName; }
    public String getEmail() { return email; }
    public long getBookingCount() { return bookingCount; }
}
