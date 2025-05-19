package com.example.back.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.back.entities.EntryEntity;
import com.example.back.entities.UserEntity;
import com.example.back.exceptions.EntryNotExistsException;
import com.example.back.services.AnalyticsService;
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
@RequestMapping("/analytics")
public class AnalyticsController {
    
    private AnalyticsService analyticsService;
    private UserService userService;

    @PostMapping("/notes")
    public ResponseEntity<AnalyticsResp> getNotes(Authentication authentication, @RequestBody NotesReq notesReq) {
        return ResponseEntity.ok().body(new AnalyticsResp(true, null, analyticsService.getNotesForEntry(notesReq.entryId)));
    }

    @GetMapping("/forall")
    public ResponseEntity<AnalyticsResp> getNotesForAll(Authentication authentication) {
        UserEntity userEntity;

        try {
            userEntity = userService.getUserByUsername(authentication.getName());
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.ok().body(new AnalyticsResp(false, new String[]{ e.getMessage() }, null));
        }

        return ResponseEntity.ok().body(new AnalyticsResp(true, null, analyticsService.getNotesForUserEntries(userEntity.getId())));
    }

    private record NotesReq(String entryId) {};

    private record AnalyticsResp(Boolean success, String[] errors, String data) {};
    
}
