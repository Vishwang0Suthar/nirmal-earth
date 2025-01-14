import React from "react";

type Props = {
  Icon: React.ElementType;
  title: string;
  description: string;
};

const FeatureCard = ({ Icon, title, description }: Props) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col items-center text-center">
      <div className="bg-green-100 p-4 aspect-square rounded-full mb-6">
        <Icon className="h-10 w-10 text-green-500 mb-4" />
      </div>
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
