package com.example.back.exceptions;

public class EntryNotExistsException extends Exception {
    public EntryNotExistsException() {
        super("Entry not exists");
    }
}
