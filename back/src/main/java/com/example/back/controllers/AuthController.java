package com.example.back.controllers;

import org.springframework.web.bind.annotation.RestController;

import com.example.back.entities.UserEntity;
import com.example.back.exceptions.UsernameAlreadyExistsException;
import com.example.back.services.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@AllArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private AuthenticationManager authenticationManager;
    private UserService userService;

    private final SecurityContextHolderStrategy securityContextHolderStrategy = SecurityContextHolder.getContextHolderStrategy();
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();
    private final SecurityContextLogoutHandler securityContextLogoutHandler = new SecurityContextLogoutHandler();

    @PostMapping("/signup")
    public ResponseEntity<SignUpResp> signup(@RequestBody SignUpReq signUpReq) {
        UserEntity userEntity = UserEntity.builder().username(signUpReq.username).password(signUpReq.password).role("USER").build();
        try {
            userEntity = userService.createUser(userEntity);
        } catch (UsernameAlreadyExistsException e) {
            return ResponseEntity.ok().body(new SignUpResp(false, new String[] { e.getMessage() }));
        }

        return ResponseEntity.ok().body(new SignUpResp(true, null));

    }

    @PostMapping("/signin")
    public ResponseEntity<SignInResp> signin(@RequestBody SignInReq signInReq, HttpServletRequest request, HttpServletResponse response) {
        Authentication authenticationReq = UsernamePasswordAuthenticationToken.unauthenticated(signInReq.username, signInReq.password);
        Authentication authenticationResp = null;

        try {
            authenticationResp = authenticationManager.authenticate(authenticationReq);
        } catch (AuthenticationException e) {
            return ResponseEntity.ok().body(new SignInResp(false, new String[] { e.getMessage() }));
        }

        SecurityContext context = securityContextHolderStrategy.createEmptyContext();
        context.setAuthentication(authenticationResp);
        securityContextHolderStrategy.setContext(context);
        securityContextRepository.saveContext(context, request, response);

        return ResponseEntity.ok().body(new SignInResp(true, null));
    }

    @PostMapping("/signout")
    public ResponseEntity<SignOutResp> signout(Authentication authentication, HttpServletRequest request, HttpServletResponse response) {
        securityContextLogoutHandler.logout(request, response, authentication);
        return ResponseEntity.ok().body(new SignOutResp(true, null));
    }

    @GetMapping("/status")
    public ResponseEntity<StatusResp> status(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.ok().body(new StatusResp(false));
        }
        return ResponseEntity.ok().body(new StatusResp(true));
    }

    @GetMapping("/invalid-session")
    public ResponseEntity<InvalidSessionResp> invalidSession(Authentication authentication) {
        return ResponseEntity.ok().body(new InvalidSessionResp(false, new String[] { "Invalid session" }));
    }

    private record SignInReq(String username, String password) {}
    private record SignUpReq(String username, String password) {}

    private record SignUpResp(Boolean success, String[] errors) {}
    private record SignInResp(Boolean success, String[] errors) {}
    private record SignOutResp(Boolean success, String[] errors) {}
    private record InvalidSessionResp(Boolean success, String[] errors) {}
    private record StatusResp(Boolean success) {}

}
