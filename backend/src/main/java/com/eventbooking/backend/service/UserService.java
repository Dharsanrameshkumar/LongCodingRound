package com.eventbooking.backend.service;

import com.eventbooking.backend.dto.LoginRequest;
import com.eventbooking.backend.dto.LoginResponse;
import com.eventbooking.backend.dto.RegisterRequest;
import com.eventbooking.backend.entity.Organizer;
import com.eventbooking.backend.entity.Student;
import com.eventbooking.backend.entity.User;
import com.eventbooking.backend.repository.OrganizerRepository;
import com.eventbooking.backend.repository.StudentRepository;
import com.eventbooking.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final OrganizerRepository organizerRepository;

    public UserService(UserRepository userRepository,
                       StudentRepository studentRepository,
                       OrganizerRepository organizerRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.organizerRepository = organizerRepository;
    }

    public LoginResponse register(RegisterRequest req) {
        if (req.getName() == null || req.getEmail() == null ||
            req.getPassword() == null || req.getRole() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Required fields missing.");
        }
        if (!req.getRole().equals("STUDENT") && !req.getRole().equals("ORGANIZER")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role must be STUDENT or ORGANIZER.");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered.");
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPhoneNo(req.getPhoneNo());
        user.setRole(req.getRole());
        user.setPassword(req.getPassword());
        user = userRepository.save(user);

        Long profileId;
        if ("STUDENT".equals(req.getRole())) {
            Student student = new Student();
            student.setUser(user);
            student = studentRepository.save(student);
            profileId = student.getStudentId();
        } else {
            Organizer organizer = new Organizer();
            organizer.setUser(user);
            organizer = organizerRepository.save(organizer);
            profileId = organizer.getOrganizerId();
        }

        return new LoginResponse(user.getUserId(), user.getName(), user.getEmail(), user.getRole(), profileId);
    }

    public LoginResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        if (!user.getPassword().equals(req.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }
        if (!user.getRole().equals(req.getRole())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid role for this account.");
        }

        Long profileId = null;
        if ("STUDENT".equals(user.getRole())) {
            profileId = studentRepository.findByUserUserId(user.getUserId())
                    .map(Student::getStudentId).orElse(null);
        } else if ("ORGANIZER".equals(user.getRole())) {
            profileId = organizerRepository.findByUserUserId(user.getUserId())
                    .map(Organizer::getOrganizerId).orElse(null);
        }

        return new LoginResponse(user.getUserId(), user.getName(), user.getEmail(), user.getRole(), profileId);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));
    }
}
