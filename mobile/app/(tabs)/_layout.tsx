import { Tabs } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Header from "@/components/header/Header";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                header: () => <Header />,
                tabBarActiveTintColor: "#F5A54C",
                tabBarInactiveTintColor: "#999",
            }}
        >
            <Tabs.Screen
                name="recipe"
                options={{
                    title: "레시피",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="menu-book" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="shopping"
                options={{
                    title: "장보기",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="shopping-cart" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="calendar"
                options={{
                    title: "캘린더",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="calendar-month" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "프로필",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}