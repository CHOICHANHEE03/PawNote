package com.pawnote.common.file;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.UUID;

@Service
public class FileStorageService {

    private final WebClient webClient = WebClient.builder().build();

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-role-key}")
    private String supabaseServiceRoleKey;

    @Value("${supabase.bucket}")
    private String bucket;

    public String saveFile(MultipartFile file) throws IOException {
        return saveFile(file, "recipes");
    }

    public String saveFile(MultipartFile file, String directory) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String objectPath = buildObjectPath(directory, file);
        byte[] bytes = file.getBytes();
        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        webClient.post()
                .uri(buildObjectUri(objectPath))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + supabaseServiceRoleKey)
                .header("apikey", supabaseServiceRoleKey)
                .header("x-upsert", "false")
                .contentType(MediaType.parseMediaType(contentType))
                .bodyValue(bytes)
                .retrieve()
                .toBodilessEntity()
                .block();

        return objectPath;
    }

    private String buildObjectPath(String directory, MultipartFile file) {
        String normalizedDirectory = (directory == null || directory.isBlank()) ? "files" : directory.trim();
        if (normalizedDirectory.endsWith("/")) {
            normalizedDirectory = normalizedDirectory.substring(0, normalizedDirectory.length() - 1);
        }
        return normalizedDirectory + "/" + UUID.randomUUID() + resolveExtension(file);
    }

    public void deleteFile(String objectPath) {
        if (objectPath == null || objectPath.isBlank()) {
            return;
        }
        if (objectPath.startsWith("http://") || objectPath.startsWith("https://")) {
            return;
        }

        webClient.delete()
                .uri(buildObjectUri(objectPath))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + supabaseServiceRoleKey)
                .header("apikey", supabaseServiceRoleKey)
                .retrieve()
                .toBodilessEntity()
                .onErrorMap(ex -> new ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_GATEWAY,
                        "이미지 삭제 중 오류가 발생했습니다.",
                        ex
                ))
                .block();
    }

    public String toPublicUrl(String objectPath) {
        if (objectPath == null || objectPath.isBlank()) {
            return null;
        }
        if (objectPath.startsWith("http://") || objectPath.startsWith("https://")) {
            return objectPath;
        }

        String normalizedBase = supabaseUrl.endsWith("/")
                ? supabaseUrl.substring(0, supabaseUrl.length() - 1)
                : supabaseUrl;

        return normalizedBase
                + "/storage/v1/object/public/"
                + UriUtils.encodePathSegment(bucket, StandardCharsets.UTF_8)
                + "/"
                + encodePath(objectPath);
    }

    public String normalizeObjectPath(String pathOrUrl) {
        if (pathOrUrl == null || pathOrUrl.isBlank()) {
            return null;
        }

        String value = pathOrUrl.trim();
        if (!value.startsWith("http://") && !value.startsWith("https://")) {
            return value;
        }

        String normalizedBase = supabaseUrl.endsWith("/")
                ? supabaseUrl.substring(0, supabaseUrl.length() - 1)
                : supabaseUrl;

        String encodedBucket = UriUtils.encodePathSegment(bucket, StandardCharsets.UTF_8);
        String encodedPrefix = normalizedBase + "/storage/v1/object/public/" + encodedBucket + "/";
        if (value.startsWith(encodedPrefix)) {
            return stripQueryAndFragment(value.substring(encodedPrefix.length()));
        }

        String rawPrefix = normalizedBase + "/storage/v1/object/public/" + bucket + "/";
        if (value.startsWith(rawPrefix)) {
            return stripQueryAndFragment(value.substring(rawPrefix.length()));
        }

        return value;
    }

    private String stripQueryAndFragment(String path) {
        int queryIndex = path.indexOf('?');
        int hashIndex = path.indexOf('#');
        int cutIndex = -1;

        if (queryIndex >= 0 && hashIndex >= 0) {
            cutIndex = Math.min(queryIndex, hashIndex);
        } else if (queryIndex >= 0) {
            cutIndex = queryIndex;
        } else if (hashIndex >= 0) {
            cutIndex = hashIndex;
        }

        return cutIndex >= 0 ? path.substring(0, cutIndex) : path;
    }

    private String buildObjectUri(String objectPath) {
        String normalizedBase = supabaseUrl.endsWith("/")
                ? supabaseUrl.substring(0, supabaseUrl.length() - 1)
                : supabaseUrl;

        return normalizedBase
                + "/storage/v1/object/"
                + UriUtils.encodePathSegment(bucket, StandardCharsets.UTF_8)
                + "/"
                + encodePath(objectPath);
    }

    private String encodePath(String path) {
        return Arrays.stream(path.split("/"))
                .map(segment -> UriUtils.encodePathSegment(segment, StandardCharsets.UTF_8))
                .reduce((left, right) -> left + "/" + right)
                .orElse("");
    }

    private String resolveExtension(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null) {
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex >= 0 && dotIndex < originalFilename.length() - 1) {
                return originalFilename.substring(dotIndex);
            }
        }
        return ".jpg";
    }
}
