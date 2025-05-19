package com.example.back.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.back.entities.EntryEntity;
import com.example.back.entities.UserEntity;
import com.example.back.exceptions.EntryNotExistsException;
import com.example.back.services.EntryService;
import com.example.back.services.UserService;

import lombok.AllArgsConstructor;

import java.util.Date;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
@AllArgsConstructor
@RequestMapping("/entry")
public class EntryController {
    
    private EntryService entryService;
    private UserService userService;

    @GetMapping("/entries")
    public ResponseEntity<EntriesResp> getEntries(Authentication authentication) {
        UserEntity userEntity;

        try {
            userEntity = userService.getUserByUsername(authentication.getName());
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.ok().body(new EntriesResp(false, new String[]{ e.getMessage() }, null));
        }

        return ResponseEntity.ok().body(new EntriesResp(true, null, entryService.getUserEntries(userEntity.getId()).toArray(new EntryEntity[1])));
    }

    @PostMapping("/add")
    public ResponseEntity<AddEntryResp> addEntry(Authentication authentication, @RequestBody AddEntryReq addEntryReq) {
        UserEntity userEntity;

        try {
            userEntity = userService.getUserByUsername(authentication.getName());
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.ok().body(new AddEntryResp(false, new String[]{ e.getMessage() }, null));
        }

        EntryEntity entryEntity = new EntryEntity();
        entryEntity.setStart(addEntryReq.start);
        entryEntity.setEnd(addEntryReq.end);
        entryEntity.setRate(addEntryReq.rate);
        entryEntity.setNotes(addEntryReq.notes);
        entryEntity.setUserId(userEntity.getId());

        entryEntity = entryService.saveEntry(entryEntity);

        return ResponseEntity.ok().body(new AddEntryResp(true, null, entryEntity.getId()));
    }

    @PostMapping("/delete")
    public ResponseEntity<DeleteEntryResp> deleteEntry(Authentication authentication, @RequestBody DeleteEntryReq deleteEntryReq) {
        UserEntity userEntity;

        try {
            userEntity = userService.getUserByUsername(authentication.getName());
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.ok().body(new DeleteEntryResp(false, new String[]{ e.getMessage() }));
        }

        EntryEntity entryEntity;
        try {
            entryEntity = entryService.getEntry(deleteEntryReq.entryId);
        } catch (EntryNotExistsException e) {
            return ResponseEntity.ok().body(new DeleteEntryResp(false, new String[]{ e.getMessage() }));
        }

        if (userEntity.getId() != entryEntity.getUserId()) {
            return ResponseEntity.ok().body(new DeleteEntryResp(false, new String[]{ "Unauthorized" }));
        }

        entryService.deleteEntry(deleteEntryReq.entryId);

        return ResponseEntity.ok().body(new DeleteEntryResp(true, null));
    }
    

    private record AddEntryReq(Date start, Date end, int rate, String notes) {};
    private record DeleteEntryReq(String entryId) {};

    private record EntriesResp(Boolean success, String[] errors, EntryEntity[] entries) {};
    private record AddEntryResp(Boolean success, String[] errors, String entryId) {};
    private record DeleteEntryResp(Boolean success, String[] errors) {};
    
}
