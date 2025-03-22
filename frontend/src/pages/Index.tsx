import React from 'react';
import { Helmet } from 'react-helmet';
import Banner from '@/components/Banner';
import ProductGrid from '@/components/ProductGrid';
import { getBestSellers } from '@/utils/products';

const Index = () => {
  const bestSellers = getBestSellers();

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Choy Apparel </title>
        <meta name="description" content="Discover the latest fashion trends at Choy Apparel" />
      </Helmet>

      <main className="flex-1">
        <div className="container px-4 mx-auto py-8">
          {/* Banner */}
          <Banner />
          
          {/* Best Sellers */}
          <section className="mb-16">
            <ProductGrid products={bestSellers} title="Best sellers!" />
          </section>
        </div>
      </main>
      
      <footer className="bg-black text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold mb-4">About</h3>
              <p className="text-sm text-gray-400">
                Choy Apparel offers premium fashion for men and women with a focus on quality and style.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Privacy and Policy</h3>
              <p className="text-sm text-gray-400">
                We care about your privacy. Read our policies to understand how we protect your information.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-4">Teams</h3>
              <p className="text-sm text-gray-400">
                Our team is dedicated to providing you with the best shopping experience.
              </p>
              
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-gray-500">
            © 2025 Choy Apparel. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
