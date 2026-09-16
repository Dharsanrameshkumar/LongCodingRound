package com.eventbooking.backend.dto;

public class EventSummaryResponse {
    private Long eventId;
    private String eventName;
    private String date;
    private String status;
    private int maximumCapacity;
    private long totalBookings;
    private long presentCount;
    private long absentCount;
    private long cancelledCount;
    private int availableSlots;

    public EventSummaryResponse(Long eventId, String eventName, String date, String status,
                                 int maximumCapacity, long totalBookings, long presentCount,
                                 long absentCount, long cancelledCount, int availableSlots) {
        this.eventId = eventId;
        this.eventName = eventName;
        this.date = date;
        this.status = status;
        this.maximumCapacity = maximumCapacity;
        this.totalBookings = totalBookings;
        this.presentCount = presentCount;
        this.absentCount = absentCount;
        this.cancelledCount = cancelledCount;
        this.availableSlots = availableSlots;
    }

    public Long getEventId() { return eventId; }
    public String getEventName() { return eventName; }
    public String getDate() { return date; }
    public String getStatus() { return status; }
    public int getMaximumCapacity() { return maximumCapacity; }
    public long getTotalBookings() { return totalBookings; }
    public long getPresentCount() { return presentCount; }
    public long getAbsentCount() { return absentCount; }
    public long getCancelledCount() { return cancelledCount; }
    public int getAvailableSlots() { return availableSlots; }
}
