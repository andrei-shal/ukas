package com.example.back.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.back.entities.EntryEntity;
import com.example.back.exceptions.EntryNotExistsException;
import com.example.back.repositories.EntryRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class EntryService {

    private EntryRepository entryRepository;

    public List<EntryEntity> getUserEntries(String userId) {
        return entryRepository.getByUserId(userId);
    }

    public EntryEntity getEntry(String entryId) throws EntryNotExistsException {
        return entryRepository.findById(entryId).orElseThrow(() -> new EntryNotExistsException());
    }

    public EntryEntity saveEntry(EntryEntity entryEntity) {
        return entryRepository.save(entryEntity);
    }

    public void deleteEntry(String entryId) {
        entryRepository.deleteById(entryId);
    }
    
}
