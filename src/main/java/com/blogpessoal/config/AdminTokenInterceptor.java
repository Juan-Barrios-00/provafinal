package com.blogpessoal.config;

import com.blogpessoal.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AdminTokenInterceptor implements HandlerInterceptor {

    private final String adminToken;

    public AdminTokenInterceptor(@Value("${app.admin-token}") String adminToken) { this.adminToken = adminToken; }

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
        boolean readOnly = req.getMethod().equals("GET") || req.getMethod().equals("OPTIONS");
        boolean authCheck = req.getRequestURI().startsWith("/api/auth");
        if (readOnly && !authCheck) return true;

        String sent = req.getHeader("X-Admin-Token");
        if (sent == null || !MessageDigest.isEqual(sent.getBytes(StandardCharsets.UTF_8),
                adminToken.getBytes(StandardCharsets.UTF_8))) {
            throw new UnauthorizedException("Token de administrador inválido ou ausente.");
        }
        return true;
    }
}
