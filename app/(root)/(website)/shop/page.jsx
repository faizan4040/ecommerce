import Filter from '@/components/Website/Filter'
import WebsiteBreadcrumb from '@/components/Website/WebsiteBreadcrumb'
import { WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import React from 'react'

const breadCrumb = {
  title: 'Shop',
  links: [{ label: 'Shop', href: WEBSITE_SHOP }],
}

const Shop = () => {
  return (
    <div>
      <WebsiteBreadcrumb title={breadCrumb.title} links={breadCrumb.links} />

      <section className="lg:flex lg:px-24 md:px-10 px-4 my-16">
        
        {/* Filter Sidebar */}
        <div className="lg:w-72 w-full lg:me-6 mb-8 lg:mb-0">
          <div className="sticky top-24 bg-gray-50 p-4 rounded">
            <Filter />
          </div>
        </div>

        {/* Product Listing (future) */}
        <div className="flex-1">
          {/* products grid here */}
        </div>

      </section>
    </div>
  )
}

export default Shop
