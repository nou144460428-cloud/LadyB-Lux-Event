import Link from 'next/link';
import React from 'react';

interface CategoryCardProps {
  title: string;
  icon: string;
}

const CategoryCard = ({ title, icon }: CategoryCardProps) => {
  // Simple slugification for URL generation
  const slug = title
    .toLowerCase()
    .replace(/ & /g, '-') // Handle ampersands
    .replace(/\s+/g, '-'); // Replace spaces with hyphens

  return (
    <Link href={`/vendors/${slug}`}>
      <a className="block p-6 text-center bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-100 hover:shadow-lg transition-all">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </a>
    </Link>
  );
};

export default CategoryCard;