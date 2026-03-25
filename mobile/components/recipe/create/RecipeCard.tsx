import React from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { RecipeListItem } from "@/services/api/recipeApi";

const { width } = Dimensions.get("window");
const CARD_MARGIN = 12;
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2;

type Props = {
    item: RecipeListItem;
    onPress?: () => void;
};

export default function RecipeCard({ item, onPress }: Props) {
    const hasImage = !!item.imageUrl;
    const hasVideo = !!item.videoLink;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
            {/* 썸네일 영역 */}
            <View style={styles.thumbnail}>
                {hasImage ? (
                    <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.thumbnailPlaceholder}>
                        {hasVideo ? (
                            <MaterialIcons name="play-circle-outline" size={36} color="#fff" />
                        ) : (
                            <MaterialIcons name="restaurant" size={36} color="#ccc" />
                        )}
                    </View>
                )}
                {hasVideo && (
                    <View style={styles.videoTag}>
                        <MaterialIcons name="videocam" size={12} color="#fff" />
                    </View>
                )}
            </View>

            {/* 텍스트 영역 */}
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>
                    {item.title}
                </Text>
                {!!item.subtitle && (
                    <Text style={styles.subtitle} numberOfLines={1}>
                        {item.subtitle}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: "#fff",
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: CARD_MARGIN,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    thumbnail: {
        width: "100%",
        height: CARD_WIDTH * 0.75,
        backgroundColor: "#f5f5f5",
        position: "relative",
    },
    thumbnailImage: {
        width: "100%",
        height: "100%",
    },
    thumbnailPlaceholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0ede8",
    },
    videoTag: {
        position: "absolute",
        top: 6,
        right: 6,
        backgroundColor: "rgba(0,0,0,0.55)",
        borderRadius: 6,
        paddingHorizontal: 5,
        paddingVertical: 2,
        flexDirection: "row",
        alignItems: "center",
    },
    info: {
        padding: 10,
    },
    title: {
        fontSize: 13,
        fontWeight: "700",
        color: "#1a1a1a",
        lineHeight: 18,
    },
    subtitle: {
        marginTop: 3,
        fontSize: 11,
        color: "#888",
    },
});
