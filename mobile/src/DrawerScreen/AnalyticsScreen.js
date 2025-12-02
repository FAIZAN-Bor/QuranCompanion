// import React from "react";
// import { View, Text, ScrollView, StyleSheet, Dimensions, Image } from "react-native";
// import { BarChart, LineChart, PieChart } from "react-native-chart-kit";

// const screenWidth = Dimensions.get("window").width;

// export default function AnalyticsScreen() {

//   const pieData = [
//     { name: "Completed", population: 70, color: "#0A7D4F", legendFontColor: "#0A7D4F", legendFontSize: 14 },
//     { name: "Remaining", population: 30, color: "#d1dedcff", legendFontColor: "#555", legendFontSize: 14 },
//   ];

//   const barData = {
//     labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
//     datasets: [{ data: [3, 5, 2, 4, 6, 1, 3] }],
//   };

//   const lineData = {
//     labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
//     datasets: [
//       {
//         data: [70, 75, 80, 90],
//         color: (opacity = 1) => `rgba(10, 125, 79, ${opacity})`,
//         strokeWidth: 2,
//       },
//     ],
//     legend: ["Weekly Progress"],
//   };

//   // Dashboard cards data
//   const dashboardCards = [
//     { id: 1, title: "Total Coins", value: 1200, image: require("../assests/coin.png") },
//     { id: 2, title: "Your Level", value: "Intermediate", image: require("../assests/level.png") },
//     { id: 3, title: "Accuracy", value: "85%", image: require("../assests/accuracy.png") },
//   ];

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.title}>Your Analytics</Text>

//       {/* Dashboard Cards */}
//       <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsContainer}>
//         {dashboardCards.map((card) => (
//           <View key={card.id} style={styles.metricCard}>
//             <Image source={card.image} style={styles.cardIcon} />
//             <Text style={styles.cardTitle}>{card.title}</Text>
//             <Text style={styles.cardValue}>{card.value}</Text>
//           </View>
//         ))}
//       </ScrollView>

//       {/* Pie Chart: Progress */}
//       <Text style={styles.chartTitle}>Progress</Text>
//       <PieChart
//         data={pieData}
//         width={screenWidth - 40}
//         height={200}
//         chartConfig={chartConfig}
//         accessor={"population"}
//         backgroundColor={"transparent"}
//         paddingLeft={"15"}
//         absolute
//       />

//       {/* Bar Chart: Daily Practice */}
//       <Text style={styles.chartTitle}>Daily Recitation (hours)</Text>
//       <BarChart
//         data={barData}
//         width={screenWidth - 40}
//         height={220}
//         chartConfig={chartConfig}
//         verticalLabelRotation={30}
//         fromZero
//         showValuesOnTopOfBars
//       />

//       {/* Line Chart: Weekly Progress */}
//       <Text style={styles.chartTitle}>Weekly Progress (%)</Text>
//       <LineChart
//         data={lineData}
//         width={screenWidth - 40}
//         height={220}
//         chartConfig={chartConfig}
//         bezier
//         style={{ borderRadius: 16, marginVertical: 8 }}
//       />
//     </ScrollView>
//   );
// }

// const chartConfig = {
//   backgroundGradientFrom: "#F4FFF5",
//   backgroundGradientTo: "#F4FFF5",
//   decimalPlaces: 0,
//   color: (opacity = 1) => `rgba(10, 125, 79, ${opacity})`,
//   labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//   style: { borderRadius: 16 },
//   propsForDots: { r: "6", strokeWidth: "2", stroke: "#0A7D4F" },
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F4FFF5", padding: 20 },
//   title: { fontSize: 26, fontWeight: "bold", color: "#0A7D4F", textAlign: "center", marginVertical: 16 },

//   cardsContainer: { flexDirection: "row", marginBottom: 20 },
//   metricCard: {
//     backgroundColor: "#dce8e0",
//     width: screenWidth * 0.4,
//     marginRight: 15,
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: "#9d9307ff",
//     alignItems: "center",
//     paddingVertical: 20,
//   },
//   cardIcon: { width: 40, height: 40, marginBottom: 10, resizeMode: "contain" },
//   cardTitle: { fontSize: 14, color: "#0A7D4F", fontWeight: "700" },
//   cardValue: { fontSize: 20, fontWeight: "bold", color: "#143b2cff", marginTop: 4 },

//   chartTitle: { fontSize: 18, fontWeight: "bold", color: "#0A7D4F", marginTop: 16, marginBottom: 8 },
// });
 

import React from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, Image } from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import LinearGradient from 'react-native-linear-gradient';

const screenWidth = Dimensions.get("window").width;

export default function AnalyticsScreen() {

  const pieData = [
    { name: "Completed", population: 70, color: "#0A7D4F", legendFontColor: "#0A7D4F", legendFontSize: 14 },
    { name: "Remaining", population: 30, color: "#d1dedcff", legendFontColor: "#555", legendFontSize: 14 },
  ];

  const barData = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [{ data: [3, 5, 2, 4, 6, 1, 3] }],
  };

  const lineData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        data: [70, 75, 80, 90],
        color: (opacity = 1) => `rgba(10, 125, 79, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ["Weekly Progress"],
  };

  // Dashboard cards data
  const dashboardCards = [
    { id: 1, title: "Total Coins", value: 1200, image: require("../assests/coin.png") },
    { id: 2, title: "Your Level", value: "Intermediate", image: require("../assests/volume.png") },
    { id: 3, title: "Accuracy", value: "85%", image: require("../assests/accuracy.png") },
  ];

  return (
    <LinearGradient
      colors={['#F4FFF5', '#E8F5E9']}
      style={{flex: 1}}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Your Analytics</Text>
        <Text style={styles.subtitle}>Track Your Learning Progress</Text>

        {/* Dashboard Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsContainer}>
          {dashboardCards.map((card) => (
            <LinearGradient
              key={card.id}
              colors={['#FFFFFF', '#E8F5E9']}
              style={styles.metricCard}
            >
              <Image source={card.image} style={styles.cardIcon} />
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardValue}>{card.value}</Text>
            </LinearGradient>
          ))}
        </ScrollView>

      {/* Pie Chart: Progress */}
      <Text style={styles.chartTitle}>Progress</Text>
      <PieChart
        data={pieData}
        width={screenWidth - 40}
        height={200}
        chartConfig={chartConfig}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
        absolute
      />

      {/* Bar Chart: Daily Practice */}
      <Text style={styles.chartTitle}>Daily Recitation (hours)</Text>
      <BarChart
        data={barData}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        verticalLabelRotation={30}
        fromZero
        showValuesOnTopOfBars
      />

      {/* Line Chart: Weekly Progress */}
      <Text style={styles.chartTitle}>Weekly Progress (%)</Text>
      <LineChart
        data={lineData}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={{ borderRadius: 16, marginVertical: 10,marginBottom:30}}
      />
      </ScrollView>
    </LinearGradient>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#F4FFF5",
  backgroundGradientTo: "#F4FFF5",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(10, 125, 79, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: { r: "6", strokeWidth: "2", stroke: "#0A7D4F" },
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 30, fontWeight: "900", color: "#0A7D4F", textAlign: "center", marginTop: 10, letterSpacing: 0.5 },
  subtitle: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 20, fontWeight: '600' },

  cardsContainer: { flexDirection: "row", marginBottom: 25 },
  metricCard: {
    width: screenWidth * 0.42,
    marginRight: 15,
    borderRadius: 20,
    alignItems: "center",
    paddingVertical: 25,
    elevation: 8,
    shadowColor: '#0A7D4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardIcon: { width: 45, height: 45, marginBottom: 12, resizeMode: "contain", tintColor: '#0A7D4F' },
  cardTitle: { fontSize: 13, color: "#666", fontWeight: "700" },
  cardValue: { fontSize: 22, fontWeight: "900", color: "#0A7D4F", marginTop: 8 },

  chartTitle: { fontSize: 18, fontWeight: "800", color: "#0A7D4F", marginTop: 20, marginBottom: 12 },
});
