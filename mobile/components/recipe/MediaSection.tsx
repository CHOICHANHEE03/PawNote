import { Image, Pressable, Text, TextInput, View } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { styles } from "./create.styles";

interface Props {
    imageUri: string;
    videoLink: string;
    focusedInput: string;
    onPickImage: () => void;
    onVideoLinkChange: (text: string) => void;
    onFocus: (key: string) => void;
    onBlur: () => void;
    onInputFocusEvent: (target: number, offset?: number) => void;
    mediaError?: string;
}

export default function MediaSection({
    imageUri,
    videoLink,
    focusedInput,
    onPickImage,
    onVideoLinkChange,
    onFocus,
    onBlur,
    onInputFocusEvent,
    mediaError,
}: Props) {
    const trimmedLink = videoLink.trim();

    const getYoutubeId = (url: string) => {
        try {
            const parsedUrl = new URL(url);
            const hostname = parsedUrl.hostname.replace("www.", "");

            // youtu.be/VIDEO_ID
            if (hostname === "youtu.be") {
                const id = parsedUrl.pathname.slice(1).split("/")[0];
                return id?.length === 11 ? id : null;
            }

            // youtube.com/watch?v=VIDEO_ID
            if (
                hostname === "youtube.com" ||
                hostname === "m.youtube.com" ||
                hostname === "music.youtube.com"
            ) {
                const v = parsedUrl.searchParams.get("v");
                if (v && v.length === 11) return v;

                // youtube.com/shorts/VIDEO_ID
                if (parsedUrl.pathname.startsWith("/shorts/")) {
                    const id = parsedUrl.pathname.split("/shorts/")[1]?.split("/")[0];
                    return id?.length === 11 ? id : null;
                }

                // youtube.com/embed/VIDEO_ID
                if (parsedUrl.pathname.startsWith("/embed/")) {
                    const id = parsedUrl.pathname.split("/embed/")[1]?.split("/")[0];
                    return id?.length === 11 ? id : null;
                }
            }

            return null;
        } catch {
            return null;
        }
    };

    const isHttpUrl =
        trimmedLink.startsWith("http://") || trimmedLink.startsWith("https://");

    const youtubeId = isHttpUrl ? getYoutubeId(trimmedLink) : null;

    const isYoutubeDomain = (() => {
        try {
            const parsedUrl = new URL(trimmedLink);
            const hostname = parsedUrl.hostname.replace("www.", "");
            return (
                hostname === "youtu.be" ||
                hostname === "youtube.com" ||
                hostname === "m.youtube.com" ||
                hostname === "music.youtube.com"
            );
        } catch {
            return false;
        }
    })();

    return (
        <>
            <Pressable
                style={[styles.previewBox, mediaError ? { borderColor: "red", borderWidth: 1 } : {}]}
                onPress={onPickImage}
                disabled={!!trimmedLink}
            >
                {imageUri ? (
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.previewImage}
                        resizeMode="cover"
                    />
                ) : trimmedLink ? (
                    youtubeId ? (
                        <View
                            style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: 14,
                                overflow: "hidden",
                            }}
                        >
                            <YoutubePlayer
                                height={220}
                                play={false}
                                videoId={youtubeId}
                                webViewStyle={{ opacity: 0.99 }}
                                initialPlayerParams={{
                                    controls: true,
                                    modestbranding: true,
                                    rel: false,
                                    playsinline: true,
                                }}
                            />
                        </View>
                    ) : isYoutubeDomain ? (
                        <View style={styles.videoPreviewBox}>
                            <Text style={styles.videoPreviewLabel}>
                                올바른 유튜브 영상 링크가 아니에요
                            </Text>
                            <Text style={styles.videoPreviewText} numberOfLines={2}>
                                {trimmedLink}
                            </Text>
                        </View>
                    ) : isHttpUrl ? (
                        <View style={styles.videoPreviewBox}>
                            <Text style={styles.videoPreviewLabel}>
                                유튜브 / 숏츠 링크만 지원해요
                            </Text>
                            <Text style={styles.videoPreviewText} numberOfLines={2}>
                                {trimmedLink}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.videoPreviewBox}>
                            <Text style={styles.videoPreviewLabel}>
                                링크 형식이 올바르지 않아요
                            </Text>
                            <Text style={styles.videoPreviewText} numberOfLines={2}>
                                {trimmedLink}
                            </Text>
                        </View>
                    )
                ) : (
                    <Text style={[styles.mediaPH, { textAlign: "center", lineHeight: 20 }]}>
                        터치하여 이미지를 추가하거나{"\n"}아래에 유튜브 링크를 입력해 주세요
                    </Text>
                )}
            </Pressable>
            {mediaError && <Text style={{ color: "red", fontSize: 12, marginTop: 4, marginBottom: 8, marginLeft: 4 }}>{mediaError}</Text>}

            <TextInput
                style={[styles.field, focusedInput === "videoLink" && styles.fieldActive]}
                placeholder="유튜브 / 숏츠 링크를 입력"
                placeholderTextColor="#aaa"
                value={videoLink}
                onChangeText={onVideoLinkChange}
                onFocus={(e) => {
                    onFocus("videoLink");
                    onInputFocusEvent(e.nativeEvent.target, 80);
                }}
                onBlur={onBlur}
                autoCapitalize="none"
                autoCorrect={false}
            />
        </>
    );
}