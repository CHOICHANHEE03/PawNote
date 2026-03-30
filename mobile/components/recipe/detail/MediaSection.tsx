import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import YoutubePlayer from "react-native-youtube-iframe";
import { styles, VIDEO_HEIGHT, width } from "./detail.styles";

interface Props {
  videoId: string | null;
  imageUrl?: string;
  playing: boolean;
  onPlayPress: () => void;
  onStateChange: (state: string) => void;
}

export default function MediaSection({
  videoId,
  imageUrl,
  playing,
  onPlayPress,
  onStateChange,
}: Props) {
  if (videoId) {
    return (
      <View style={styles.videoWrapper}>
        <YoutubePlayer
          height={VIDEO_HEIGHT}
          videoId={videoId}
          play={playing}
          onChangeState={onStateChange}
        />
        {!playing && (
          <TouchableOpacity
            style={styles.playOverlay}
            onPress={onPlayPress}
            activeOpacity={0.85}
          >
            <View style={styles.playBtn}>
              <MaterialIcons name="play-arrow" size={40} color="#fff" />
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (imageUrl) {
    return (
      <Image source={{ uri: imageUrl }} style={styles.hero} resizeMode="cover" />
    );
  }

  return (
    <View style={[styles.hero, styles.heroPlaceholder]}>
      <MaterialIcons name="restaurant" size={64} color="#d0c8be" />
    </View>
  );
}
