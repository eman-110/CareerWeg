package com.careerweg.back_end.repository;


import com.careerweg.back_end.model.Language;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LanguageRepository extends JpaRepository<Language, Long> {
    List<Language> findByUserId(Long userId);
}
