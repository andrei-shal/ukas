package com.example.back.repositories;

import com.example.back.entities.EntryEntity;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EntryRepository extends JpaRepository<EntryEntity, String> {
    List<EntryEntity> getByUserId(String userId);
}
