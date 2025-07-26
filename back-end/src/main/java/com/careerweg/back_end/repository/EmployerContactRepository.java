package com.careerweg.back_end.repository;

import com.careerweg.back_end.model.EmployerContact;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployerContactRepository extends JpaRepository<EmployerContact, Long> {
    EmployerContact findByUserId(Long userId);
}
