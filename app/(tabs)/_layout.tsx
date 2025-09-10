import { Tabs } from "expo-router";
import { Home, Shirt, Heart, WashingMachine } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 90,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#FF69B4",
        tabBarInactiveTintColor: "#B0B0B0",
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Inter-Medium",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="items"
        options={{
          title: "My Items",
          tabBarIcon: ({ size, color }) => <Shirt size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="outfits"
        options={{
          title: "My Outfits",
          tabBarIcon: ({ size, color }) => <Heart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="laundry"
        options={{
          title: "Laundry",
          tabBarIcon: ({ size, color }) => (
            <WashingMachine size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
