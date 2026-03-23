package com.pawnote.common.file;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadDir = Paths.get("uploads");

    public String saveFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return null;

        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        String filename = UUID.randomUUID() + ".jpg";
        Path path = uploadDir.resolve(filename);

        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + filename;
    }
}