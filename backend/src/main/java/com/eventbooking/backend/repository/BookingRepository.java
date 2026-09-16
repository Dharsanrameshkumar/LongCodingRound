package com.eventbooking.backend.repository;

import com.eventbooking.backend.entity.Booking;
import com.eventbooking.backend.entity.Booking.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByStudentStudentId(Long studentId);

    List<Booking> findByEventEventId(Long eventId);

    List<Booking> findByStatusIn(List<BookingStatus> statuses);

    long countByEventEventIdAndStatusIn(Long eventId, List<BookingStatus> statuses);

    long countByStudentStudentIdAndStatusIn(Long studentId, List<BookingStatus> statuses);

    Optional<Booking> findFirstByStudentStudentIdAndStatusIn(Long studentId, List<BookingStatus> statuses);

    // FIFO: lowest booking_id = earliest in queue
    Optional<Booking> findFirstByEventEventIdAndStatusOrderByBookingIdAsc(Long eventId, BookingStatus status);
}
