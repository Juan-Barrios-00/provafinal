package com.blogpessoal.service;

import com.blogpessoal.dto.*;
import com.blogpessoal.exception.ResourceNotFoundException;
import com.blogpessoal.model.Post;
import com.blogpessoal.repository.PostRepository;
import java.util.List;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class PostService {

    private final PostRepository repository;

    public PostService(PostRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public PageResponse<PostSummaryResponse> list(String search, String category, int page, int size) {
        Specification<Post> spec = (root, q, cb) -> cb.conjunction();

        if (StringUtils.hasText(search)) {
            String like = "%" + search.trim().toLowerCase()
                    .replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
            spec = spec.and((root, q, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), like, '\\'),
                    cb.like(cb.lower(root.get("summary")), like, '\\'),
                    cb.like(cb.lower(root.get("content")), like, '\\')));
        }
        if (StringUtils.hasText(category)) {
            String cat = category.trim().toLowerCase();
            spec = spec.and((root, q, cb) -> cb.equal(cb.lower(root.get("category")), cat));
        }

        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return PageResponse.from(repository.findAll(spec, pageable).map(PostSummaryResponse::from));
    }

    @Transactional(readOnly = true)
    public PostResponse get(Long id) { return PostResponse.from(find(id)); }

    @Transactional(readOnly = true)
    public List<String> categories() { return repository.findCategories(); }

    @Transactional
    public PostResponse create(PostRequest req) {
        Post post = new Post();
        apply(post, req);
        return PostResponse.from(repository.save(post));
    }

    @Transactional
    public PostResponse update(Long id, PostRequest req) {
        Post post = find(id);
        apply(post, req);
        return PostResponse.from(repository.save(post));
    }

    @Transactional
    public void delete(Long id) { repository.delete(find(id)); }

    private Post find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Publicação não encontrada (id " + id + ")."));
    }

    private void apply(Post p, PostRequest r) {
        p.setTitle(r.title().trim());
        p.setSummary(r.summary().trim());
        p.setContent(r.content().trim());
        p.setCategory(r.category().trim());
        p.setAuthor(r.author().trim());
        p.setCoverUrl(StringUtils.hasText(r.coverUrl()) ? r.coverUrl().trim() : null);
    }
}
