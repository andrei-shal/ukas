package com.example.back.configurations;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy;
import org.springframework.web.cors.CorsConfiguration;

import com.example.back.services.UserService;

import lombok.AllArgsConstructor;

@Configuration
@AllArgsConstructor
@EnableWebSecurity(debug = true) // TODO отключить debug на production
public class SecurityConfig {

    private UserService userService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(
                csrf ->
                    csrf.disable()
            )
            .cors(cors -> corsConfiguration())
            .authorizeHttpRequests(
                req ->
                    req
                        .requestMatchers("/auth/**").permitAll()
                        .anyRequest().authenticated()
            )
            .sessionManagement(
                session ->
                    session
                        .sessionCreationPolicy(SessionCreationPolicy.ALWAYS)
                        .sessionFixation(fixation -> fixation.newSession())
                        .invalidSessionUrl("/auth/invalid-session")
            )
            .logout(
                logout ->
                    logout
                        .logoutSuccessUrl("/auth/status")
                        .deleteCookies("JSESSIONID")
                        .invalidateHttpSession(true)
            )
            .headers(
                headers ->
                    headers
                        /*.httpStrictTransportSecurity(
                            hsts -> 
                                hsts
                                    .includeSubDomains(true)
                                    .preload(true)
                                    .maxAgeInSeconds(31536000)
                        )*/ // TODO включить для https
                        .contentTypeOptions(contentType -> {})
                        .referrerPolicy(
                            referrer ->
                                referrer
                                    .policy(ReferrerPolicy.SAME_ORIGIN)
                        )
            );
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
        daoAuthenticationProvider.setUserDetailsService(userService);
        daoAuthenticationProvider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(daoAuthenticationProvider);
    }

    @Bean
    public CorsConfiguration corsConfiguration() {
        CorsConfiguration cors = new CorsConfiguration();
        cors.addAllowedOrigin("http://localhost:3000");
        cors.addAllowedOrigin("http://192.168.1.20:3000");
        cors.addAllowedHeader("*");
        cors.addAllowedMethod("GET");
        cors.addAllowedMethod("POST");
        cors.addAllowedMethod("PUT");
        cors.addAllowedMethod("DELETE");
        cors.addAllowedMethod("OPTIONS");
        cors.setAllowCredentials(true);
        cors.addAllowedOriginPattern("/**");
        cors.setMaxAge(3600L);
        return cors;
    }
}
