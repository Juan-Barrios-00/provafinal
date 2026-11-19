package com.blogpessoal.dto;

import com.blogpessoal.model.Post;
import java.time.Instant;

public record PostSummaryResponse(Long id, String title, String summary, String category,
                                  String author, String coverUrl, Instant createdAt) {
    public static PostSummaryResponse from(Post p) {
        return new PostSummaryResponse(p.getId(), p.getTitle(), p.getSummary(), p.getCategory(),
                p.getAuthor(), p.getCoverUrl(), p.getCreatedAt());
    }
}
