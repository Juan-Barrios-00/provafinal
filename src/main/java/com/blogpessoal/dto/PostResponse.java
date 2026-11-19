package com.blogpessoal.dto;

import com.blogpessoal.model.Post;
import java.time.Instant;

public record PostResponse(Long id, String title, String summary, String content, String category,
                           String author, String coverUrl, Instant createdAt, Instant updatedAt) {
    public static PostResponse from(Post p) {
        return new PostResponse(p.getId(), p.getTitle(), p.getSummary(), p.getContent(), p.getCategory(),
                p.getAuthor(), p.getCoverUrl(), p.getCreatedAt(), p.getUpdatedAt());
    }
}
