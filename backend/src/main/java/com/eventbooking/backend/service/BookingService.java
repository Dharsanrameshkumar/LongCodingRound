package com.eventbooking.backend.service;

import com.eventbooking.backend.dto.CreateBookingRequest;
import com.eventbooking.backend.dto.TopStudentResponse;
import com.eventbooking.backend.entity.Booking;
import com.eventbooking.backend.entity.Booking.BookingStatus;
import com.eventbooking.backend.entity.Event;
import com.eventbooking.backend.entity.Event.EventStatus;
import com.eventbooking.backend.entity.Student;
import com.eventbooking.backend.repository.BookingRepository;
import com.eventbooking.backend.repository.EventRepository;
import com.eventbooking.backend.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final StudentRepository studentRepository;
    private final EventRepository eventRepository;

    public BookingService(BookingRepository bookingRepository,
                          StudentRepository studentRepository,
                          EventRepository eventRepository) {
        this.bookingRepository = bookingRepository;
        this.studentRepository = studentRepository;
        this.eventRepository = eventRepository;
    }

    public Booking createBooking(CreateBookingRequest req) {
        Student student = studentRepository.findById(req.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Student not found. Only students can book events."));

        if (!"STUDENT".equals(student.getUser().getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only students can create bookings.");
        }

        Event event = eventRepository.findById(req.getEventId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));

        if (event.getStatus() != EventStatus.OPEN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event is not open for booking.");
        }

        // Student must not already have an active (ABSENT/PRESENT) or WAITING booking
        List<BookingStatus> activeOrWaiting = List.of(BookingStatus.ABSENT, BookingStatus.PRESENT, BookingStatus.WAITING);
        long existingActive = bookingRepository.countByStudentStudentIdAndStatusIn(req.getStudentId(), activeOrWaiting);
        if (existingActive > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Student already has an active or waiting booking. Cancel it before booking another event.");
        }

        // Count only seat-occupying bookings (ABSENT + PRESENT) to check capacity
        List<BookingStatus> seatOccupying = List.of(BookingStatus.ABSENT, BookingStatus.PRESENT);
        long activeCount = bookingRepository.countByEventEventIdAndStatusIn(req.getEventId(), seatOccupying);

        // If full → add to WAITING queue instead of rejecting
        BookingStatus newStatus = (activeCount >= event.getMaximumCapacity())
                ? BookingStatus.WAITING
                : BookingStatus.ABSENT;

        Booking booking = new Booking();
        booking.setStudent(student);
        booking.setEvent(event);
        booking.setStatus(newStatus);
        return bookingRepository.save(booking);
    }

    public Booking checkIn(Long bookingId) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.ABSENT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Check-in requires booking status to be ABSENT.");
        }
        if (booking.getCheckInTime() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Already checked in.");
        }

        LocalDate eventDate = booking.getEvent().getDate();
        if (!LocalDate.now().equals(eventDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Check-in is only allowed on the event date: " + eventDate);
        }

        booking.setStatus(BookingStatus.PRESENT);
        booking.setCheckInTime(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    public Booking checkOut(Long bookingId) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PRESENT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Check-out requires booking status to be PRESENT.");
        }
        if (booking.getCheckInTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot check out without checking in first.");
        }
        if (booking.getCheckOutTime() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Already checked out.");
        }

        booking.setCheckOutTime(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    public Booking cancel(Long bookingId) {
        Booking booking = getBookingById(bookingId);

        BookingStatus prevStatus = booking.getStatus();

        if (prevStatus != BookingStatus.ABSENT && prevStatus != BookingStatus.WAITING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only ABSENT or WAITING bookings can be cancelled.");
        }

        // Confirmed seat-holders must cancel before the event date
        if (prevStatus == BookingStatus.ABSENT) {
            LocalDate eventDate = booking.getEvent().getDate();
            if (!LocalDate.now().isBefore(eventDate)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Cancellation must be done before the event date.");
            }
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        // Auto-promote the first WAITING student when a confirmed seat is freed (FIFO)
        if (prevStatus == BookingStatus.ABSENT) {
            Long eventId = booking.getEvent().getEventId();
            bookingRepository
                    .findFirstByEventEventIdAndStatusOrderByBookingIdAsc(eventId, BookingStatus.WAITING)
                    .ifPresent(next -> {
                        next.setStatus(BookingStatus.ABSENT);
                        bookingRepository.save(next);
                    });
        }

        return booking;
    }

    public List<Booking> getBookingsByStudent(Long studentId) {
        return bookingRepository.findByStudentStudentId(studentId);
    }

    public List<Booking> getBookingsByEvent(Long eventId) {
        return bookingRepository.findByEventEventId(eventId);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found: " + id));
    }

    public List<TopStudentResponse> getTopStudents() {
        List<BookingStatus> active = List.of(BookingStatus.ABSENT, BookingStatus.PRESENT);
        List<Booking> bookings = bookingRepository.findByStatusIn(active);

        Map<Student, Long> counts = bookings.stream()
                .collect(Collectors.groupingBy(Booking::getStudent, Collectors.counting()));

        return counts.entrySet().stream()
                .sorted(Map.Entry.<Student, Long>comparingByValue(Comparator.reverseOrder()))
                .map(e -> new TopStudentResponse(
                        e.getKey().getStudentId(),
                        e.getKey().getUser().getName(),
                        e.getKey().getUser().getEmail(),
                        e.getValue()))
                .collect(Collectors.toList());
    }
}
