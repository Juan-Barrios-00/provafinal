package com.blogpessoal.controller;

import com.blogpessoal.dto.*;
import com.blogpessoal.service.PostService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PostController {

    private final PostService service;

    public PostController(PostService service) { this.service = service; }

    @GetMapping("/posts")
    public PageResponse<PostSummaryResponse> list(@RequestParam(required = false) String search,
                                                  @RequestParam(required = false) String category,
                                                  @RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "9") int size) {
        return service.list(search, category, page, size);
    }

    @GetMapping("/posts/{id}")
    public PostResponse get(@PathVariable Long id) { return service.get(id); }

    @GetMapping("/categories")
    public List<String> categories() { return service.categories(); }

    @PostMapping("/posts")
    public ResponseEntity<PostResponse> create(@Valid @RequestBody PostRequest req) {
        PostResponse created = service.create(req);
        return ResponseEntity.created(URI.create("/api/posts/" + created.id())).body(created);
    }

    @PutMapping("/posts/{id}")
    public PostResponse update(@PathVariable Long id, @Valid @RequestBody PostRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** Usado pela página de administração para validar o token. */
    @GetMapping("/auth/check")
    public Map<String, Boolean> check() { return Map.of("ok", true); }
}
