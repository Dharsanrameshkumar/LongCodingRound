package com.eventbooking.backend.service;

import com.eventbooking.backend.dto.CreateEventRequest;
import com.eventbooking.backend.dto.EventSummaryResponse;
import com.eventbooking.backend.entity.Booking.BookingStatus;
import com.eventbooking.backend.entity.Event;
import com.eventbooking.backend.entity.Event.EventStatus;
import com.eventbooking.backend.entity.Organizer;
import com.eventbooking.backend.repository.BookingRepository;
import com.eventbooking.backend.repository.EventRepository;
import com.eventbooking.backend.repository.OrganizerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final OrganizerRepository organizerRepository;
    private final BookingRepository bookingRepository;

    public EventService(EventRepository eventRepository,
                        OrganizerRepository organizerRepository,
                        BookingRepository bookingRepository) {
        this.eventRepository = eventRepository;
        this.organizerRepository = organizerRepository;
        this.bookingRepository = bookingRepository;
    }

    public Event createEvent(CreateEventRequest req) {
        Organizer organizer = organizerRepository.findById(req.getOrganizerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Organizer not found. Only organizers can create events."));

        if (!"ORGANIZER".equals(organizer.getUser().getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only organizers can create events.");
        }

        Event event = new Event();
        event.setOrganizer(organizer);
        event.setEventName(req.getEventName());
        event.setDate(req.getDate());
        event.setMaximumCapacity(req.getMaximumCapacity());
        event.setStatus(EventStatus.OPEN);
        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public List<Event> getEventsByOrganizer(Long organizerId) {
        return eventRepository.findByOrganizerOrganizerId(organizerId);
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found: " + id));
    }

    public EventSummaryResponse getEventSummary(Long eventId) {
        Event event = getEventById(eventId);
        List<BookingStatus> seatOccupying = List.of(BookingStatus.ABSENT, BookingStatus.PRESENT);

        long totalActive = bookingRepository.countByEventEventIdAndStatusIn(eventId, seatOccupying);
        long present    = bookingRepository.countByEventEventIdAndStatusIn(eventId, List.of(BookingStatus.PRESENT));
        long absent     = bookingRepository.countByEventEventIdAndStatusIn(eventId, List.of(BookingStatus.ABSENT));
        long cancelled  = bookingRepository.countByEventEventIdAndStatusIn(eventId, List.of(BookingStatus.CANCELLED));
        long waiting    = bookingRepository.countByEventEventIdAndStatusIn(eventId, List.of(BookingStatus.WAITING));
        int  available  = Math.max(0, event.getMaximumCapacity() - (int) totalActive);

        return new EventSummaryResponse(
                event.getEventId(), event.getEventName(), event.getDate().toString(),
                event.getStatus().name(), event.getMaximumCapacity(),
                totalActive, present, absent, cancelled, waiting, available);
    }
}
