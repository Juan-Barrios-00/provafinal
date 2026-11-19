package com.blogpessoal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PostRequest(
        @NotBlank(message = "Informe o título.")
        @Size(min = 5, max = 150, message = "O título deve ter entre 5 e 150 caracteres.")
        String title,

        @NotBlank(message = "Informe o resumo.")
        @Size(min = 10, max = 300, message = "O resumo deve ter entre 10 e 300 caracteres.")
        String summary,

        @NotBlank(message = "Escreva o conteúdo do artigo.")
        @Size(min = 50, max = 50000, message = "O conteúdo deve ter entre 50 e 50.000 caracteres.")
        String content,

        @NotBlank(message = "Informe a categoria.")
        @Size(max = 50, message = "A categoria deve ter no máximo 50 caracteres.")
        String category,

        @NotBlank(message = "Informe o autor.")
        @Size(max = 80, message = "O autor deve ter no máximo 80 caracteres.")
        String author,

        @Size(max = 500, message = "O link da capa deve ter no máximo 500 caracteres.")
        @Pattern(regexp = "^$|^https?://\\S+$", message = "O link da capa deve começar com http:// ou https://.")
        String coverUrl
) {}
