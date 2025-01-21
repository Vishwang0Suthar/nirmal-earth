"use client";
import FeatureCard from "@/components/home/FeatureCard";
import ImpactCard from "@/components/home/ImpactCard";
import { Button } from "@/components/ui/button";
import {
  getAllRewards,
  getRecentReports,
  getWasteCollectionTasks,
} from "@/utils/db/action";
import { ArrowRight, Coins, Leaf, MapPin, Recycle, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// export const metadata: Metadata = {
//   title: "NIRMAL-EARTH",
//   description: "",
// };

function AnimatedGlobe() {
  return (
    <div className="relative mx-auto mb-8 w-32 h-32">
      <div className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-pulse"></div>
      <div className=" absolute inset-2 rounded-full bg-green-400 opacity-40 animate-ping"></div>
      <div className="absolute inset-4 rounded-full bg-green-500 opacity-60 animate-spin"></div>
      <div className=" absolute inset-6 rounded-full bg-green-400 opacity-80 animate-bounce"></div>
      <Leaf className="absolute inset-0 w-16 m-auto text-green-600 animate-pulse h-16 " />
    </div>
  );
}

export default function Home() {
  const [impactData, setImpactData] = useState({
    wasteCollected: 0,
    reportsSubmitted: 0,
    tokensEarned: 0,
    co2Offset: 0,
  });
  useEffect(() => {
    async function fetchImpactData() {
      try {
        const reports = await getRecentReports(100); // Fetch last 100 reports
        const rewards = await getAllRewards();
        const tasks = await getWasteCollectionTasks(100); // Fetch last 100 tasks

        const wasteCollected = tasks.reduce((total, task) => {
          const match = task.amount.match(/(\d+(\.\d+)?)/);
          const amount = match ? parseFloat(match[0]) : 0;
          return total + amount;
        }, 0);

        const reportsSubmitted = reports.length;
        const tokensEarned = rewards.reduce(
          (total, reward) => total + (reward.points || 0),
          0
        );
        const co2Offset = wasteCollected * 0.5; // Assuming 0.5 kg CO2 offset per kg of waste

        setImpactData({
          wasteCollected: Math.round(wasteCollected * 10) / 10, // Round to 1 decimal place
          reportsSubmitted,
          tokensEarned,
          co2Offset: Math.round(co2Offset * 10) / 10, // Round to 1 decimal place
        });
      } catch (error) {
        console.error("Error fetching impact data:", error);
        // Set default values in case of error
        setImpactData({
          wasteCollected: 0,
          reportsSubmitted: 0,
          tokensEarned: 0,
          co2Offset: 0,
        });
      }
    }
    fetchImpactData();
  }, []);
  return (
    <>
      <div className="container mx-auto px-4 py-16">
        <section className="text-center mb-20">
          <AnimatedGlobe />
          <h1 className="md:text-6xl text-3xl font-bold text-gray-800 tracking-tight">
            Nirmal Earth{" "}
            <span className="text-green-600">Waste Management</span>
            <p className="md:text-xl text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
              Join our community in making waste management more efficient and
              sustainable.
            </p>
            <Link
              className="relative flex items-center justify-center"
              href={"/reports"}
            >
              <Button className="bg-green-600 z-10 shadow-inner overflow-hidden group hover:bg-green-600 duration-500 ease-in-out transition-all hover:translate-x-1 hover:translate-y-1  relative group  rounded-full text-white text-lg py-6 px-10">
                <div className="overflow-hidden z-10 flex flex-col items-center h-10 transition-all duration-300 ">
                  <p className="group-hover:-translate-y-8 p-1 transition-all duration-300 ease-in-out">
                    Report Waste
                  </p>
                  <p className="group-hover:-translate-y-8 p-1 transition-all duration-300 ease-in-out">
                    Report Waste
                  </p>
                </div>
                <div className="h-64 aspect-square rounded-full group-hover:-translate-y-12 transition-all duration-700 ease-in-out translate-y-12 top-0  bg-green-700 absolute"></div>

                <ArrowRight className="w-6 absolute right-3  h-6 ml-2" />
              </Button>
              <Button className="absolute top-0 bg-black overflow-hidden text-lg text-black h-8 translate-x-1 translate-y-1   rounded-full   py-6 px-10">
                <div className=" z-10 h-8  ">
                  <p className=" p-1 ">Report Waste</p>
                </div>
              </Button>
            </Link>
          </h1>
        </section>

        <section className="grid  md:grid-cols-3  gap-10 mb-20">
          <FeatureCard
            Icon={Leaf}
            title="Eco-Friendly"
            description="Contribute to a cleaner environment by reporting and collecting waste."
          />
          <FeatureCard
            Icon={Coins}
            title="Earn Rewards"
            description="Get tokens for your contributions to waste management efforts."
          />
          <FeatureCard
            Icon={Users}
            title="Community-Driven"
            description="Be part of a growing community committed to sustainable practices."
          />
        </section>

        <section className="bg-white p-10 rounded-3xl shadow-lg mb-20">
          <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">
            Our Impact
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <ImpactCard
              title="Waste Collected"
              value={`${impactData.wasteCollected} kg`}
              Icon={Recycle}
            />
            <ImpactCard
              title="Reports Submitted"
              value={impactData.reportsSubmitted.toString()}
              Icon={MapPin}
            />
            <ImpactCard
              title="Tokens Earned"
              value={impactData.tokensEarned.toString()}
              Icon={Coins}
            />
            <ImpactCard
              title="CO2 Offset"
              value={`${impactData.co2Offset} kg`}
              Icon={Leaf}
            />
            {/* <ImpactCard title="Waste Collected" value="50kg" Icon={Recycle} />
            <ImpactCard title="Reports Submitted" value="20kg" Icon={MapPin} />
            <ImpactCard title="Tokens Earned" value="20kg" Icon={Coins} />
            <ImpactCard title="CO2 Offset" value="50kg" Icon={Leaf} /> */}
          </div>
        </section>
      </div>
    </>
  );
}
