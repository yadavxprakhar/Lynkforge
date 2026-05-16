package com.url.shortener.advice;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Login uses {@code AuthenticationManager} in MVC; map bad credentials to 401, not a generic 403. */
@RestControllerAdvice
public class AuthenticationExceptionControllerAdvice {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ProblemDetail> handleBadCredentials(BadCredentialsException ex) {
        ProblemDetail detail =
                ProblemDetail.forStatusAndDetail(
                        HttpStatus.UNAUTHORIZED, "Invalid username or password.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(detail);
    }
}
